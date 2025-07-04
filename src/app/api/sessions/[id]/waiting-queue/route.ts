import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface SessionParams {
  params: {
    id: string;
  };
}

// GET /api/sessions/[id]/waiting-queue - Lấy danh sách người chơi đang đợi theo thứ tự
export async function GET(request: NextRequest, { params }: SessionParams) {
  try {
    const { id } = params;

    // Validate session exists
    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return errorResponse("Session not found", 404);
    }

    // Get waiting players sorted by wait time
    const waitingPlayers = await prisma.player.findMany({
      where: {
        sessionId: id,
        status: "WAITING",
        confirmedByPlayer: true, // Only include players who have confirmed joining
      },
      orderBy: [
        {
          currentWaitTime: "desc", // Sort by current wait time descending
        },
        {
          playerNumber: "asc", // Then by player number
        },
      ],
      select: {
        id: true,
        playerNumber: true,
        name: true,
        gender: true,
        level: true,
        currentWaitTime: true,
        totalWaitTime: true,
        matchesPlayed: true,
      },
    });

    return successResponse(
      waitingPlayers,
      "Waiting queue retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching waiting queue:", error);
    return errorResponse("Failed to fetch waiting queue");
  }
}
