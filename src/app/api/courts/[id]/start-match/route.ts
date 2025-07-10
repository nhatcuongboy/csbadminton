import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface CourtParams {
  id: string;
}

// POST /api/courts/[id]/start-match - Start the match on the court
export async function POST(
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
        currentPlayers: true,
      },
    });

    if (!court) {
      return errorResponse("Court not found", 404);
    }

    // Validate court has 4 players
    if (court.currentPlayers.length !== 4) {
      return errorResponse(
        "Court must have exactly 4 players to start a match",
        400
      );
    }

    // Validate session is in progress
    if (court.session.status !== "IN_PROGRESS") {
      return errorResponse(
        "Cannot start a match for a session that is not in progress",
        400
      );
    }

    // Validate court doesn't already have an active match
    if (court.currentMatchId) {
      return errorResponse("Court already has an active match", 400);
    }

    // All validations passed, create a new match in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create new match
      const match = await tx.match.create({
        data: {
          sessionId: court.sessionId,
          courtId: id,
          status: "IN_PROGRESS",
          startTime: new Date(),
        },
      });

      // Link players to match with positions
      for (let i = 0; i < court.currentPlayers.length; i++) {
        const player = court.currentPlayers[i];
        await tx.matchPlayer.create({
          data: {
            matchId: match.id,
            playerId: player.id,
            position: i + 1, // Position 1-4
          },
        });

        // Increment matches played count for each player
        await tx.player.update({
          where: { id: player.id },
          data: {
            matchesPlayed: {
              increment: 1,
            },
          },
        });
      }

      // Update court with current match
      const updatedCourt = await tx.court.update({
        where: { id },
        data: {
          currentMatchId: match.id,
        },
        include: {
          currentPlayers: true,
          currentMatch: true,
        },
      });

      return {
        court: updatedCourt,
        match,
      };
    });

    return successResponse(result, "Match started successfully");
  } catch (error) {
    console.error("Error starting match:", error);
    return errorResponse("Failed to start match");
  }
}
