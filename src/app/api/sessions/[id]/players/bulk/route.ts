import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface SessionParams {
  id: string;
}

interface BulkPlayerData {
  playerNumber: number;
  name?: string;
  gender?: "MALE" | "FEMALE";
  level?: "Y" | "Y_PLUS" | "TBY" | "TB_MINUS" | "TB" | "TB_PLUS";
  phone?: string;
}

// POST /api/sessions/[id]/players/bulk - Tạo đồng loạt nhiều player
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<SessionParams> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();

    if (!Array.isArray(body)) {
      return errorResponse("Body phải là một mảng các player data", 400);
    }

    const playersData: BulkPlayerData[] = body;

    // Validate session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        players: true,
      },
    });

    if (!session) {
      return errorResponse("Session không tồn tại", 404);
    }

    // Calculate max players allowed
    const maxPlayers = session.numberOfCourts * session.maxPlayersPerCourt;

    // Validate player data
    const errors: string[] = [];
    const playerNumbers = new Set<number>();

    for (const [index, playerData] of playersData.entries()) {
      // Validate required fields
      if (
        !playerData.playerNumber ||
        typeof playerData.playerNumber !== "number"
      ) {
        errors.push(
          `Player ${index + 1}: playerNumber là bắt buộc và phải là số`
        );
        continue;
      }

      // Validate playerNumber range
      if (playerData.playerNumber < 1 || playerData.playerNumber > maxPlayers) {
        errors.push(
          `Player ${index + 1}: playerNumber phải từ 1 đến ${maxPlayers}`
        );
        continue;
      }

      // Check for duplicate playerNumber in request
      if (playerNumbers.has(playerData.playerNumber)) {
        errors.push(
          `Player ${index + 1}: playerNumber ${
            playerData.playerNumber
          } đã tồn tại trong request`
        );
        continue;
      }
      playerNumbers.add(playerData.playerNumber);

      // Validate gender
      if (
        playerData.gender &&
        !["MALE", "FEMALE"].includes(playerData.gender)
      ) {
        errors.push(`Player ${index + 1}: gender phải là MALE hoặc FEMALE`);
      }

      // Validate level
      if (
        playerData.level &&
        !["Y", "Y_PLUS", "TBY", "TB_MINUS", "TB", "TB_PLUS"].includes(
          playerData.level
        )
      ) {
        errors.push(`Player ${index + 1}: level không hợp lệ`);
      }

      // Validate phone format (optional)
      if (playerData.phone && typeof playerData.phone !== "string") {
        errors.push(`Player ${index + 1}: phone phải là chuỗi`);
      }
    }

    if (errors.length > 0) {
      return errorResponse(`Dữ liệu không hợp lệ: ${errors.join(", ")}`, 400);
    }

    // Check for existing players with same playerNumber
    const existingPlayers = await prisma.player.findMany({
      where: {
        sessionId,
        playerNumber: {
          in: Array.from(playerNumbers),
        },
      },
    });

    if (existingPlayers.length > 0) {
      const conflictNumbers = existingPlayers
        .map((p: any) => p.playerNumber)
        .join(", ");
      return errorResponse(
        `Các playerNumber sau đã tồn tại: ${conflictNumbers}`,
        409
      );
    }

    // Create players in bulk
    const createPromises = playersData.map((playerData) => {
      return prisma.player.create({
        data: {
          sessionId,
          playerNumber: playerData.playerNumber,
          name: playerData.name || null,
          gender: playerData.gender || null,
          level: playerData.level || null,
          phone: playerData.phone || null,
          preFilledByHost: true, // Đánh dấu là host đã pre-fill
          confirmedByPlayer: false, // Player chưa confirm
          status: "WAITING",
        },
      });
    });

    const createdPlayers = await Promise.all(createPromises);

    // Get updated session with all players
    const updatedSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        players: {
          orderBy: { playerNumber: "asc" },
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return successResponse({
      createdPlayers,
      session: updatedSession,
      message: `Đã tạo thành công ${createdPlayers.length} player(s)`,
    });
  } catch (error) {
    console.error("Error creating bulk players:", error);
    return errorResponse("Có lỗi xảy ra khi tạo players", 500);
  }
}

// GET /api/sessions/[id]/players/bulk - Lấy thông tin về khả năng tạo bulk players
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<SessionParams> }
) {
  try {
    const { id: sessionId } = await params;

    // Get session info
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        players: {
          orderBy: { playerNumber: "asc" },
        },
      },
    });

    if (!session) {
      return errorResponse("Session không tồn tại", 404);
    }

    const maxPlayers = session.numberOfCourts * session.maxPlayersPerCourt;
    const existingPlayerNumbers = session.players.map(
      (p: any) => p.playerNumber
    );
    const availablePlayerNumbers = [];

    // Find available player numbers
    for (let i = 1; i <= maxPlayers; i++) {
      if (!existingPlayerNumbers.includes(i)) {
        availablePlayerNumbers.push(i);
      }
    }

    return successResponse({
      sessionId,
      sessionName: session.name,
      maxPlayers,
      currentPlayersCount: session.players.length,
      availableSlots: availablePlayerNumbers.length,
      availablePlayerNumbers,
      existingPlayerNumbers,
    });
  } catch (error) {
    console.error("Error getting bulk players info:", error);
    return errorResponse("Có lỗi xảy ra khi lấy thông tin", 500);
  }
}
