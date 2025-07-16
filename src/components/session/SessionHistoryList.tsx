"use client";

import { SessionService } from "@/lib/api";
import {
  Box,
  Center,
  Flex,
  Grid,
  Heading,
  Icon,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { parseScoreData } from "@/utils/match-result-utils";

const formatTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// New implementation: Show all completed matches, not just sessions
type HistoryMatch = {
  id: string;
  sessionId: string;
  court: string;
  players: string[];
  startTime?: string | Date;
  endTime?: string | Date;
  winner?: string;
  scores?: {
    pair1Score: number;
    pair2Score: number;
  };
  winningPair?: 1 | 2;
};

const HistoryMatchCard = ({ match }: { match: HistoryMatch }) => {
  // Assume match.players is an array of 4 player names, order: [A1, A2, B1, B2]
  const pair1 = match.players.slice(0, 2);
  const pair2 = match.players.slice(2, 4);

  // Determine which pair is the winner
  const winningPair = match.winningPair;
  // Winning pair: blue, losing pair: red
  const pair1WonStyle =
    winningPair === 1
      ? { fontWeight: "bold", color: "blue.600" }
      : winningPair === 2
      ? { fontWeight: "bold", color: "red.600" }
      : {};
  const pair2WonStyle =
    winningPair === 2
      ? { fontWeight: "bold", color: "blue.600" }
      : winningPair === 1
      ? { fontWeight: "bold", color: "red.600" }
      : {};

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      _dark={{ bg: "gray.800" }}
      p={6}
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
      }}
    >
      <Stack gap={4}>
        <Flex align="center" gap={2}>
          <Icon as={MapPin} boxSize={5} color="gray.500" />
          <Text fontWeight="bold">{match.court}</Text>
        </Flex>

        <Stack gap={2}>
          <Flex align="center" gap={2}>
            <Icon as={Clock} boxSize={5} color="gray.500" />
            <Text>
              {match.startTime ? `${formatTime(match.startTime)}` : "..."}
              {match.endTime ? ` - ${formatTime(match.endTime)}` : "..."}
            </Text>
          </Flex>
        </Stack>

        <Box mt={2}>
          <Text fontWeight="semibold" mb={1}>
            Players
          </Text>
          <Flex gap={4}>
            <Box {...pair1WonStyle}>
              <Text color="gray.600" fontSize="sm">
                Pair 1
              </Text>
              <Text>{pair1.join(" & ")}</Text>
            </Box>
            <Box {...pair2WonStyle}>
              <Text color="gray.600" fontSize="sm">
                Pair 2
              </Text>
              <Text>{pair2.join(" & ")}</Text>
            </Box>
          </Flex>
        </Box>

        {/* Match score display */}
        {match.scores ? (
          <Box borderTopWidth="1px" pt={4} mt={2}>
            <Text fontWeight="semibold" mb={2}>
              Final Score
            </Text>
            <Flex justifyContent="center" alignItems="center" gap={3}>
              <Text fontSize="2xl" fontWeight="bold" {...pair1WonStyle}>
                {match.scores.pair1Score}
              </Text>
              <Text fontSize="lg" color="gray.500">
                -
              </Text>
              <Text fontSize="2xl" fontWeight="bold" {...pair2WonStyle}>
                {match.scores.pair2Score}
              </Text>
            </Flex>
            <Text
              mt={2}
              textAlign="center"
              fontSize="sm"
              fontWeight="bold"
              color={
                match.scores.pair1Score === match.scores.pair2Score
                  ? "gray.600"
                  : "green.600"
              }
            >
              {match.scores.pair1Score === match.scores.pair2Score
                ? "(Draw)"
                : winningPair === 1
                ? "(Pair 1 Won)"
                : "(Pair 2 Won)"}
            </Text>
          </Box>
        ) : (
          <Box borderTopWidth="1px" pt={4} mt={2}>
            <Text fontWeight="semibold" mb={2}>
              Final Score
            </Text>
            <Flex justifyContent="center" alignItems="center" gap={3}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.400">
                ...
              </Text>
            </Flex>
          </Box>
        )}

        {match.winner && !match.scores && (
          <Box borderTopWidth="1px" pt={4} mt={2}>
            <Text color="gray.600" _dark={{ color: "gray.400" }}>
              Winner: {match.winner}
            </Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

interface SessionHistoryListProps {
  sessionId: string; // Optional prop to filter by session
}

export default function SessionHistoryList({
  sessionId,
}: SessionHistoryListProps) {
  const [matches, setMatches] = useState<HistoryMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompletedMatches() {
      try {
        setLoading(true);
        let allMatches: HistoryMatch[] = [];

        const sessionMatches = await SessionService.getSessionMatches(
          sessionId
        ); // Only completed matches (status === 'COMPLETED' or similar)
        const completedMatches = sessionMatches.filter(
          (m: any) => m.status === "COMPLETED" || m.status === "FINISHED"
        );
        for (const match of completedMatches) {
          // Use any type to avoid TypeScript errors with API data
          const matchData = match as any;

          // Get court name/number if available, fallback to courtId
          let courtName = "Court ?";
          if (
            matchData.court &&
            matchData.court.courtName &&
            matchData.court.courtNumber
          ) {
            courtName = `Court ${matchData.court.courtNumber} (${matchData.court.courtName})`;
          } else if (matchData.court && matchData.court.courtName) {
            courtName = matchData.court.courtName;
          } else if (matchData.court && matchData.court.courtNumber) {
            courtName = `Court ${matchData.court.courtNumber}`;
          } else if (matchData.courtId) {
            courtName = `Court ${matchData.courtId}`;
          }
          // Get player names (match.players is array of { player: { name } })
          const playerNames = Array.isArray(matchData.players)
            ? matchData.players.map((mp: any) => mp.player?.name || "?")
            : [];

          // Log the match object to check the structure
          console.log("Match data:", matchData);

          // Extract match results using the new utility function
          let scores;
          let winningPair;

          // Create players array with position info for the utility function
          const playersWithPosition = Array.isArray(matchData.players)
            ? matchData.players.map((mp: any, index: number) => ({
                playerId: mp.player?.id || mp.playerId,
                position: mp.position || index + 1,
              }))
            : [];

          // Try to parse score data using the utility function
          const matchResult = parseScoreData(matchData, playersWithPosition);
          if (matchResult) {
            scores = matchResult.scores;
            winningPair = matchResult.winningPair;
          } else {
            // Fallback to legacy parsing
            const scoreData =
              matchData.score ||
              matchData.result ||
              matchData.scores ||
              matchData.matchResult;

            if (scoreData) {
              try {
                // Handle the new [21,19] format
                if (
                  typeof scoreData === "string" &&
                  scoreData.startsWith("[") &&
                  scoreData.endsWith("]")
                ) {
                  const scoreArray = JSON.parse(scoreData);
                  if (Array.isArray(scoreArray) && scoreArray.length === 2) {
                    scores = {
                      pair1Score: scoreArray[0],
                      pair2Score: scoreArray[1],
                    };

                    // Determine winning pair
                    if (scores.pair1Score > scores.pair2Score) {
                      winningPair = 1 as const;
                    } else if (scores.pair2Score > scores.pair1Score) {
                      winningPair = 2 as const;
                    }
                  }
                }
                // Handle legacy formats
                else {
                  // Parse if string, use directly if object
                  const parsedScore =
                    typeof scoreData === "string"
                      ? JSON.parse(scoreData)
                      : scoreData;

                  if (parsedScore && typeof parsedScore === "object") {
                    // Extract scores from various possible formats
                    const scoresObj = parsedScore.scores || parsedScore;

                    const pair1Score =
                      scoresObj.pair1 ||
                      scoresObj.team1 ||
                      scoresObj.score1 ||
                      0;
                    const pair2Score =
                      scoresObj.pair2 ||
                      scoresObj.team2 ||
                      scoresObj.score2 ||
                      0;

                    scores = {
                      pair1Score: Number(pair1Score),
                      pair2Score: Number(pair2Score),
                    };

                    // Determine winning pair
                    if (scores.pair1Score > scores.pair2Score) {
                      winningPair = 1 as const;
                    } else if (scores.pair2Score > scores.pair1Score) {
                      winningPair = 2 as const;
                    }
                  }
                }
              } catch (e) {
                console.warn("Failed to parse match score:", e);
              }
            }
          }

          allMatches.push({
            id: matchData.id,
            sessionId,
            court: courtName,
            players: playerNames,
            startTime: matchData.startTime,
            endTime: matchData.endTime,
            winner: matchData.winner,
            scores,
            winningPair,
          });
        }

        // Sort by startTime descending
        allMatches.sort((a, b) => {
          const aDate = a.startTime ? new Date(a.startTime).getTime() : 0;
          const bDate = b.startTime ? new Date(b.startTime).getTime() : 0;
          return bDate - aDate;
        });
        setMatches(allMatches);
      } catch (err) {
        setError("Failed to load match history. Please try again later.");
        console.error("Error fetching match history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompletedMatches();
  }, []);

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box
        p={4}
        bg="red.50"
        color="red.600"
        borderRadius="md"
        mb={6}
        borderWidth="1px"
        borderColor="red.200"
      >
        <Text fontWeight="medium">{error}</Text>
      </Box>
    );
  }

  if (matches.length === 0) {
    return (
      <Box
        textAlign="center"
        py={10}
        px={6}
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        _dark={{ bg: "gray.800" }}
      >
        <Heading size="md" mb={2}>
          No Completed Matches
        </Heading>
        <Text color="gray.500">
          There are no completed matches yet. Play and complete matches to see
          them here!
        </Text>
      </Box>
    );
  }

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        md: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)",
      }}
      gap={6}
    >
      {matches.map((match) => (
        <HistoryMatchCard key={match.id} match={match} />
      ))}
    </Grid>
  );
}
