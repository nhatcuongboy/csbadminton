import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface MatchEndParams {
  id: string;
  matchId: string;
}

// PATCH /api/sessions/[id]/matches/[matchId]/end - End a match
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<MatchEndParams> }
) {
  try {
    const { id: sessionId, matchId } = await params;

    // Check if session exists and is in progress
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return errorResponse("Session not found", 404);
    }

    if (session.status !== "IN_PROGRESS") {
      return errorResponse(
        "Cannot end a match for a session that is not in progress",
        400
      );
    }

    // Check if match exists and is in progress
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        sessionId,
      },
      include: {
        court: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!match) {
      return errorResponse("Match not found", 404);
    }

    if (match.status !== "IN_PROGRESS") {
      return errorResponse("Match is already finished", 400);
    }

    // Get player IDs from match
    const playerIds = match.players.map((mp) => mp.player.id);

    // Start transaction to end match and update related entities
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. End the match
        const updatedMatch = await tx.match.update({
          where: { id: matchId },
          data: {
            status: "FINISHED",
            endTime: new Date(),
          },
        });

        // 2. Update court status
        await tx.court.update({
          where: { id: match.courtId },
          data: {
            status: "EMPTY",
            currentMatchId: null,
          },
        });

        // 3. Update player statuses and stats in parallel
        const playerUpdatePromises = playerIds.map(async (playerId) => {
          return tx.player.update({
            where: { id: playerId },
            data: {
              status: "WAITING",
              currentCourtId: null,
              matchesPlayed: {
                increment: 1,
              },
            },
          });
        });

        await Promise.all(playerUpdatePromises);

        return updatedMatch;
      },
      {
        maxWait: 10000, // Maximum wait time in milliseconds (10 seconds)
        timeout: 15000, // Transaction timeout in milliseconds (15 seconds)
      }
    );

    // Get the updated match data to return
    const updatedMatchData = await prisma.match.findUnique({
      where: { id: result.id },
      include: {
        players: {
          include: {
            player: true,
          },
        },
        court: true,
      },
    });

    return successResponse(updatedMatchData, "Match ended successfully");
  } catch (error) {
    console.error("Error ending match:", error);
    return errorResponse("Failed to end match");
  }
}
