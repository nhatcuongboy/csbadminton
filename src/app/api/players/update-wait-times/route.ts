import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

// PUT /api/players/update-wait-times - Cập nhật thời gian chờ cho tất cả người chơi đang chờ
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, minutesToAdd = 1 } = body;

    if (!sessionId) {
      return errorResponse("Session ID is required", 400);
    }

    // Validate session exists and is in progress
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return errorResponse("Session not found", 404);
    }

    if (session.status !== "IN_PROGRESS") {
      return errorResponse(
        "Can only update wait times for in-progress sessions",
        400
      );
    }

    // Update wait times for all waiting players in the session
    const updatedPlayers = await prisma.player.updateMany({
      where: {
        sessionId,
        status: "WAITING",
      },
      data: {
        currentWaitTime: {
          increment: minutesToAdd,
        },
        totalWaitTime: {
          increment: minutesToAdd,
        },
      },
    });

    // Get the updated players for the response
    const players = await prisma.player.findMany({
      where: {
        sessionId,
        status: "WAITING",
      },
      orderBy: {
        currentWaitTime: "desc",
      },
      select: {
        id: true,
        playerNumber: true,
        name: true,
        currentWaitTime: true,
        totalWaitTime: true,
      },
    });

    return successResponse(
      {
        updatedCount: updatedPlayers.count,
        players,
      },
      "Wait times updated successfully"
    );
  } catch (error) {
    console.error("Error updating wait times:", error);
    return errorResponse("Failed to update wait times");
  }
}
