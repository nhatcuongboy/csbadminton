import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface CourtParams {
  id: string;
}

// POST /api/courts/[id]/select-players - Host chọn người chơi vào sân
export async function POST(request: NextRequest, { params }: { params: Promise<CourtParams> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { playerIds } = body;

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

    // Validate session is in progress
    if (court.session.status !== "IN_PROGRESS") {
      return errorResponse(
        "Cannot select players for a session that is not in progress",
        400
      );
    }

    // Validate court is empty
    if (court.status === "IN_USE") {
      return errorResponse("Court is already in use", 400);
    }

    // Validate exactly 4 player IDs
    if (!Array.isArray(playerIds) || playerIds.length !== 4) {
      return errorResponse("Exactly 4 players must be selected", 400);
    }

    // Validate all players exist and are in waiting state
    const players = await prisma.player.findMany({
      where: {
        id: {
          in: playerIds,
        },
      },
    });

    if (players.length !== 4) {
      return errorResponse("One or more selected players do not exist", 404);
    }

    const nonWaitingPlayers = players.filter(
      (player) => player.status !== "WAITING"
    );
    if (nonWaitingPlayers.length > 0) {
      return errorResponse(
        `Players ${nonWaitingPlayers
          .map((p) => p.playerNumber)
          .join(", ")} are not in waiting state`,
        400
      );
    }

    // All validations passed, prepare for transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update each player's status and court
      for (const playerId of playerIds) {
        await tx.player.update({
          where: { id: playerId },
          data: {
            status: "PLAYING",
            currentCourtId: id,
            currentWaitTime: 0, // Reset wait time when moving to court
          },
        });
      }

      // Update court status
      const updatedCourt = await tx.court.update({
        where: { id },
        data: {
          status: "IN_USE",
        },
        include: {
          currentPlayers: true,
        },
      });

      return updatedCourt;
    });

    return successResponse(
      result,
      "Players selected and court updated successfully"
    );
  } catch (error) {
    console.error("Error selecting players for court:", error);
    return errorResponse("Failed to select players for court");
  }
}
