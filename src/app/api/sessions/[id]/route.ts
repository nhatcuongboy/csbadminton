import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { generateCourtName } from "@/lib/server/sessions";
import { NextRequest } from "next/server";

interface SessionParams {
  id: string;
}

// GET /api/sessions/[id] - Retrieve detailed session information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<SessionParams> }
) {
  try {
    const { id } = await params;

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
                levelDescription: true,
                desire: true,
                requireConfirmInfo: true,
                status: true,
                currentCourtId: true,
                courtPosition: true, // Include court position
                updatedAt: true,
              },
              orderBy: {
                courtPosition: "asc", // Order by court position instead of updatedAt
              },
            },
            currentMatch: {
              include: {
                players: {
                  select: {
                    playerId: true,
                    position: true,
                  },
                  orderBy: {
                    position: "asc",
                  },
                },
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
            levelDescription: true,
            desire: true,
            currentWaitTime: true,
            totalWaitTime: true,
            matchesPlayed: true,
            status: true,
            preFilledByHost: true,
            confirmedByPlayer: true,
            requireConfirmInfo: true,
          },
        },
        matches: {
          where: {
            status: "IN_PROGRESS",
          },
          include: {
            players: {
              include: {
                player: true,
              },
            },
            court: true,
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

    // Process courts to add position information to currentPlayers
    const processedCourts = session.courts.map(court => {
      let playersWithPosition = [...court.currentPlayers];

      // If court has an active match, get positions from MatchPlayer
      if (court.currentMatch && court.currentMatch.players.length > 0) {
        const matchPlayerPositions = court.currentMatch.players.reduce((acc, mp) => {
          acc[mp.playerId] = mp.position;
          return acc;
        }, {} as Record<string, number>);

        // Sort players by their match position
        playersWithPosition = court.currentPlayers
          .map(player => ({
            ...player,
            position: matchPlayerPositions[player.id] ?? 0,
          }))
          .sort((a, b) => a.position - b.position);
      } else {
        // For READY courts (no active match), use stored courtPosition
        // Players are already ordered by courtPosition from the query
        playersWithPosition = court.currentPlayers.map((player) => ({
          ...player,
          position: player.courtPosition ?? 0, // Use stored court position
        }));
      }

      // Remove currentMatch from the response and add processed players
      const { currentMatch, ...courtWithoutMatch } = court;
      return {
        ...courtWithoutMatch,
        currentPlayers: playersWithPosition,
      };
    });

    // Return session with processed courts
    const processedSession = {
      ...session,
      courts: processedCourts,
    };

    return successResponse(processedSession, "Session retrieved successfully");
  } catch (error) {
    console.error("Error fetching session:", error);
    return errorResponse("Failed to fetch session");
  }
}

// PUT /api/sessions/[id] - Update session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<SessionParams> }
) {
  try {
    const { id } = await params;
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
            courtName: generateCourtName(i), // Generate court name
            status: "EMPTY",
          });
        }

        await prisma.court.createMany({
          data: newCourts.map((court) => ({
            sessionId: court.sessionId,
            courtNumber: court.courtNumber,
            courtName: court.courtName,
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

// DELETE /api/sessions/[id] - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<SessionParams> }
) {
  try {
    const { id } = await params;

    // Check if session exists
    const existingSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return errorResponse("Session not found", 404);
    }

    // Delete all players related to this session
    await prisma.player.deleteMany({
      where: { sessionId: id },
    });

    // Delete session (cascade will delete related courts, matches)
    await prisma.session.delete({
      where: { id },
    });

    return successResponse(null, "Session and related players deleted successfully");
  } catch (error) {
    console.error("Error deleting session:", error);
    return errorResponse("Failed to delete session");
  }
}
