import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface SessionParams {
  id: string;
}

// GET /api/sessions/[id]/players/statistics - Get comprehensive statistics for all players in a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<SessionParams> }
) {
  try {
    const { id: sessionId } = await params;

    // Validate session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      return errorResponse("Session not found", 404);
    }

    // Get all players in the session
    const players = await prisma.player.findMany({
      where: { sessionId },
    });

    // Get all matches in the session
    const matches = await prisma.match.findMany({
      where: { sessionId },
      include: {
        players: true,
      },
    });

    // Build statistics for each player
    const playerStats = players.map((player) => {
      // Matches played by this player
      const playedMatches = matches.filter((match) =>
        match.players.some((mp) => mp.playerId === player.id)
      );
      const totalMatches = playedMatches.length;
      // Wins: player is in winning pair
      const wins = playedMatches.filter((match) => {
        if (!match.winnerIds) return false;
        try {
          const winnerIds =
            typeof match.winnerIds === "string"
              ? JSON.parse(match.winnerIds)
              : match.winnerIds;
          return Array.isArray(winnerIds) && winnerIds.includes(player.id);
        } catch {
          return false;
        }
      }).length;
      const losses = totalMatches - wins;
      const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
      // Average score (if available)
      let totalScore = 0;
      let scoreCount = 0;
      playedMatches.forEach((match) => {
        if (match.score) {
          try {
            const scores =
              typeof match.score === "string"
                ? JSON.parse(match.score)
                : match.score;
            if (scores && typeof scores === "object") {
              // If player is in pair1, use pair1Score, else pair2Score
              const mp = match.players.find((mp) => mp.playerId === player.id);
              if (mp && mp.position && scores.pair1Score !== undefined && scores.pair2Score !== undefined) {
                const isPair1 = mp.position === 1 || mp.position === 2;
                totalScore += isPair1 ? scores.pair1Score : scores.pair2Score;
                scoreCount++;
              }
            }
          } catch {}
        }
      });
      const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
      // Play time and wait time
      // Activity summary
      return {
        playerId: player.id,
        playerNumber: player.playerNumber,
        name: player.name,
        gender: player.gender,
        level: player.level,
        totalMatches,
        wins,
        losses,
        winRate,
        averageScore,
        status: player.status,
      };
    });

    return successResponse({
      sessionId,
      playerStats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting player statistics:", error);
    return errorResponse("Failed to get player statistics", 500);
  }
}
