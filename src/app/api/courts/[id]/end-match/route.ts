import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface CourtParams {
  id: string;
}

// POST /api/courts/[id]/end-match - End the match on the court
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<CourtParams> }
) {
  try {
    const { id } = await params;
    // Parse optional match result fields from request body
    let score: string | undefined;
    let winnerIds: string | undefined;
    let isDraw: boolean | undefined;
    let notes: string | undefined;
    try {
      const body = await request.json();
      // Score: if array/object, stringify
      if (body.score !== undefined) {
        if (typeof body.score === "object") {
          score = JSON.stringify(body.score);
        } else {
          score = body.score;
        }
      }
      // WinnerIds: if array, stringify
      if (body.winnerIds !== undefined) {
        if (Array.isArray(body.winnerIds)) {
          winnerIds = JSON.stringify(body.winnerIds);
        } else {
          winnerIds = body.winnerIds;
        }
      }
      isDraw = body.isDraw;
      notes = body.notes;
    } catch (e) {
      // No body or invalid JSON, ignore
    }

    console.log("END MATCH API - Court ID:", id);

    // Validate court exists
    const court = await prisma.court.findUnique({
      where: { id },
      include: {
        session: true,
        currentPlayers: true,
        currentMatch: true,
      },
    });

    console.log("END MATCH API - Court found:", court ? "Yes" : "No");
    if (court) {
      console.log("END MATCH API - Court status:", court.status);
      console.log("END MATCH API - Current match ID:", court.currentMatchId);
      console.log("END MATCH API - Session status:", court.session.status);
    }

    if (!court) {
      return errorResponse("Court not found", 404);
    }

    // Validate court has an active match
    if (!court.currentMatchId || !court.currentMatch) {
      return errorResponse("Court does not have an active match", 400);
    }

    // Validate session is in progress
    if (court.session.status !== "IN_PROGRESS") {
      return errorResponse(
        "Cannot end a match for a session that is not in progress",
        400
      );
    }

    // All validations passed, end the match in a transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // End the match
        const match = await tx.match.update({
          where: { id: court.currentMatchId! },
          data: {
            status: "FINISHED",
            endTime: new Date(),
            ...(score !== undefined ? { score } : {}),
            ...(winnerIds !== undefined ? { winnerIds } : {}),
            ...(isDraw !== undefined ? { isDraw } : {}),
            ...(notes !== undefined ? { notes } : {}),
          },
        });

        // Update players in parallel: move to waiting state and reset their current court
        const playerUpdatePromises = court.currentPlayers.map(
          async (player) => {
            return tx.player.update({
              where: { id: player.id },
              data: {
                status: "WAITING",
                currentCourtId: null,
                // Add the time they just played to their total wait time
                // This is just for record-keeping; the current wait time is reset
                currentWaitTime: 0,
              },
            });
          }
        );

        // Execute all player updates in parallel
        await Promise.all(playerUpdatePromises);

        // Update court status and remove current match
        const updatedCourt = await tx.court.update({
          where: { id },
          data: {
            status: "EMPTY",
            currentMatchId: null,
          },
          include: {
            currentPlayers: true,
          },
        });

        return {
          court: updatedCourt,
          match,
          players: court.currentPlayers,
        };
      },
      {
        maxWait: 10000, // Maximum wait time in milliseconds (10 seconds)
        timeout: 15000, // Transaction timeout in milliseconds (15 seconds)
      }
    );

    return successResponse(result, "Match ended successfully");
  } catch (error) {
    console.error("Error ending match:", error);
    return errorResponse("Failed to end match");
  }
}
