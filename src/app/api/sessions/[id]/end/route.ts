import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface SessionParams {
  params: {
    id: string;
  };
}

// POST /api/sessions/[id]/end - Kết thúc session
export async function POST(request: NextRequest, { params }: SessionParams) {
  try {
    const { id } = params;

    // Check if session exists
    const existingSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return errorResponse("Session not found", 404);
    }

    // Validate session can be ended
    if (existingSession.status !== "IN_PROGRESS") {
      return errorResponse("Only in-progress sessions can be ended", 400);
    }

    // End active matches
    await prisma.match.updateMany({
      where: {
        sessionId: id,
        status: "IN_PROGRESS",
      },
      data: {
        status: "FINISHED",
        endTime: new Date(),
      },
    });

    // End session
    const session = await prisma.session.update({
      where: { id },
      data: {
        status: "FINISHED",
        endTime: new Date(),
      },
    });

    // Generate session statistics for response
    const players = await prisma.player.findMany({
      where: {
        sessionId: id,
      },
      select: {
        id: true,
        playerNumber: true,
        name: true,
        matchesPlayed: true,
        totalWaitTime: true,
      },
      orderBy: {
        matchesPlayed: "desc",
      },
    });

    return successResponse(
      {
        session,
        statistics: {
          players,
        },
      },
      "Session ended successfully"
    );
  } catch (error) {
    console.error("Error ending session:", error);
    return errorResponse("Failed to end session");
  }
}
