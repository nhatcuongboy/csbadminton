import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface CourtParams {
  id: string;
}

// GET /api/courts/[id]/suggested-players - Get suggested players for a court
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<CourtParams> }
) {
  try {
    const { id } = await params;

    // Validate court exists
    const court = await prisma.court.findUnique({
      where: { id },
      include: {
        session: true,
      },
    });

    if (!court) {
      return errorResponse("Court not found", 404);
    }

    // Validate session is in progress
    if (court.session.status !== "IN_PROGRESS") {
      return errorResponse(
        "Cannot get suggested players for a session that is not in progress",
        400
      );
    }

    // Validate court is empty
    if (court.status === "IN_USE") {
      return errorResponse("Court is already in use", 400);
    }

    // Get waiting players ordered by wait time (longest wait first)
    const waitingPlayers = await prisma.player.findMany({
      where: {
        sessionId: court.sessionId,
        status: "WAITING",
      },
      orderBy: {
        currentWaitTime: "desc",
      },
      take: 4, // Only get top 4 players
    });

    // Check if we have enough players
    if (waitingPlayers.length < 4) {
      return errorResponse("Not enough waiting players to start a match", 400);
    }

    // Return the top 4 waiting players
    return successResponse(
      waitingPlayers,
      "Suggested players retrieved successfully"
    );
  } catch (error) {
    console.error("Error getting suggested players:", error);
    return errorResponse("Failed to get suggested players");
  }
}
