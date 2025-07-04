import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface CourtParams {
  params: {
    id: string;
  };
}

// GET /api/courts/[id]/current-match - Lấy thông tin trận đấu hiện tại trên sân
export async function GET(request: NextRequest, { params }: CourtParams) {
  try {
    const { id } = params;

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

    // Check if court has an active match
    if (!court.currentMatchId) {
      return successResponse(null, "Court does not have an active match");
    }

    // Get match with players
    const match = await prisma.match.findUnique({
      where: { id: court.currentMatchId },
      include: {
        players: {
          include: {
            player: {
              select: {
                id: true,
                playerNumber: true,
                name: true,
                gender: true,
                level: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      return errorResponse("Match not found", 404);
    }

    // Calculate duration in minutes
    const durationMinutes = Math.floor(
      (Date.now() - match.startTime.getTime()) / (1000 * 60)
    );

    return successResponse(
      {
        ...match,
        durationMinutes,
      },
      "Current match retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching current match:", error);
    return errorResponse("Failed to fetch current match");
  }
}
