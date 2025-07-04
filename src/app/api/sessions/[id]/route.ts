import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface SessionParams {
  params: {
    id: string;
  };
}

// GET /api/sessions/[id] - Lấy thông tin chi tiết session
export async function GET(request: NextRequest, { params }: SessionParams) {
  try {
    const { id } = params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        courts: {
          orderBy: {
            courtNumber: "asc",
          },
          include: {
            currentPlayers: {
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
        players: {
          orderBy: {
            currentWaitTime: "desc",
          },
          select: {
            id: true,
            playerNumber: true,
            name: true,
            gender: true,
            level: true,
            currentWaitTime: true,
            totalWaitTime: true,
            matchesPlayed: true,
            status: true,
            preFilledByHost: true,
            confirmedByPlayer: true,
          },
        },
        _count: {
          select: {
            players: true,
            courts: true,
            matches: true,
          },
        },
      },
    });

    if (!session) {
      return errorResponse("Session not found", 404);
    }

    return successResponse(session, "Session retrieved successfully");
  } catch (error) {
    console.error("Error fetching session:", error);
    return errorResponse("Failed to fetch session");
  }
}

// PUT /api/sessions/[id] - Cập nhật session
export async function PUT(request: NextRequest, { params }: SessionParams) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if session exists
    const existingSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return errorResponse("Session not found", 404);
    }

    // Prevent updating if session is in progress or finished
    if (existingSession.status !== "PREPARING") {
      return errorResponse(
        "Cannot update a session that has already started or finished",
        400
      );
    }

    // Update session
    const {
      name,
      numberOfCourts,
      sessionDuration,
      maxPlayersPerCourt,
      requirePlayerInfo,
    } = body;

    const session = await prisma.session.update({
      where: { id },
      data: {
        name: name ?? undefined,
        numberOfCourts: numberOfCourts ?? undefined,
        sessionDuration: sessionDuration ?? undefined,
        maxPlayersPerCourt: maxPlayersPerCourt ?? undefined,
        requirePlayerInfo: requirePlayerInfo ?? undefined,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If number of courts changed, adjust courts
    if (
      numberOfCourts !== undefined &&
      numberOfCourts !== existingSession.numberOfCourts
    ) {
      if (numberOfCourts > existingSession.numberOfCourts) {
        // Add new courts
        const newCourts = [];
        for (
          let i = existingSession.numberOfCourts + 1;
          i <= numberOfCourts;
          i++
        ) {
          newCourts.push({
            sessionId: id,
            courtNumber: i,
            status: "EMPTY",
          });
        }

        await prisma.court.createMany({
          data: newCourts.map((court) => ({
            sessionId: court.sessionId,
            courtNumber: court.courtNumber,
            status: "EMPTY",
          })),
        });
      } else if (numberOfCourts < existingSession.numberOfCourts) {
        // Remove excess courts (only if they're empty)
        await prisma.court.deleteMany({
          where: {
            sessionId: id,
            courtNumber: {
              gt: numberOfCourts,
            },
            status: "EMPTY",
          },
        });
      }
    }

    return successResponse(session, "Session updated successfully");
  } catch (error) {
    console.error("Error updating session:", error);
    return errorResponse("Failed to update session");
  }
}

// DELETE /api/sessions/[id] - Xóa session
export async function DELETE(request: NextRequest, { params }: SessionParams) {
  try {
    const { id } = params;

    // Check if session exists
    const existingSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return errorResponse("Session not found", 404);
    }

    // Delete session (cascade will delete related courts, players, matches)
    await prisma.session.delete({
      where: { id },
    });

    return successResponse(null, "Session deleted successfully");
  } catch (error) {
    console.error("Error deleting session:", error);
    return errorResponse("Failed to delete session");
  }
}
