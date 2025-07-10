import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface CourtParams {
  id: string;
}

// POST /api/courts/[id]/end-match - End the match on the court
export async function POST(request: NextRequest, { params }: { params: Promise<CourtParams> }) {
  try {
    const { id } = await params;
    
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
    const result = await prisma.$transaction(async (tx) => {
      // End the match
      const match = await tx.match.update({
        where: { id: court.currentMatchId! },
        data: {
          status: "FINISHED",
          endTime: new Date(),
        },
      });

      // Update players: move to waiting state and reset their current court
      for (const player of court.currentPlayers) {
        await tx.player.update({
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
    });

    return successResponse(result, "Match ended successfully");
  } catch (error) {
    console.error("Error ending match:", error);
    return errorResponse("Failed to end match");
  }
}
