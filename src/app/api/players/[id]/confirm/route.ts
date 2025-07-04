import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface PlayerParams {
  params: {
    id: string;
  };
}

// POST /api/players/[id]/confirm - Người chơi xác nhận tham gia
export async function POST(request: NextRequest, { params }: PlayerParams) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { id },
      include: {
        session: true,
      },
    });

    if (!existingPlayer) {
      return errorResponse("Player not found", 404);
    }

    // For sessions requiring player info, validate data
    if (existingPlayer.session.requirePlayerInfo) {
      const { name, gender, level } = body;

      if (!name || !gender || !level) {
        return errorResponse(
          "Name, gender, and level are required for this session",
          400
        );
      }

      // Update player info and confirm
      const player = await prisma.player.update({
        where: { id },
        data: {
          name,
          gender,
          level,
          phone: body.phone,
          confirmedByPlayer: true,
        },
      });

      return successResponse(
        player,
        "Player confirmed successfully with info updated"
      );
    } else {
      // For sessions not requiring info, just confirm
      const player = await prisma.player.update({
        where: { id },
        data: {
          name: body.name ?? undefined,
          gender: body.gender ?? undefined,
          level: body.level ?? undefined,
          phone: body.phone ?? undefined,
          confirmedByPlayer: true,
        },
      });

      return successResponse(player, "Player confirmed successfully");
    }
  } catch (error) {
    console.error("Error confirming player:", error);
    return errorResponse("Failed to confirm player");
  }
}
