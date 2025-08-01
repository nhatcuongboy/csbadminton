"use client";

import { SessionService } from "@/lib/api";
import { parseScoreData } from "@/utils/match-result-utils";
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

const formatTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (
  startTime?: string | Date,
  endTime?: string | Date
): string => {
  if (!startTime || !endTime) return "";

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = Math.floor(durationMs / (1000 * 60));

  if (durationMinutes < 1) return "< 1 min";

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
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

const HistoryMatchCard = ({ 
  match, 
  direction = "horizontal" 
}: { 
  match: HistoryMatch; 
  direction?: "horizontal" | "vertical";
}) => {
  // For the pairing logic, we need to consider the courtPosition values and direction
  // According to the user: with direction="horizontal" (default):
  // #8 (courtPosition=0) pairs with #14 (courtPosition=1) = Pair 1
  // #7 (courtPosition=2) pairs with #11 (courtPosition=3) = Pair 2
  
  // The match.players array should be sorted by courtPosition for proper pairing
  // We'll assume the players are already properly ordered based on courtPosition
  
  let pair1: string[], pair2: string[];
  
  if (direction === "horizontal") {
    // Horizontal layout: courtPosition 0,1 = Pair 1, courtPosition 2,3 = Pair 2
    pair1 = match.players.slice(0, 2); // courtPosition 0, 1
    pair2 = match.players.slice(2, 4); // courtPosition 2, 3
  } else {
    // Vertical layout: courtPosition 0,2 = Pair 1, courtPosition 1,3 = Pair 2
    // This matches the visual mapping from BadmintonCourt.tsx
    pair1 = [match.players[0], match.players[2]]; // courtPosition 0, 2
    pair2 = [match.players[1], match.players[3]]; // courtPosition 1, 3
  }

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
            <Box display={"flex"} gap={2}>
              <Text>
                {match.startTime ? `${formatTime(match.startTime)}` : "..."}
                {match.endTime ? ` - ${formatTime(match.endTime)}` : "..."}
              </Text>
              {match.startTime && match.endTime && (
                <Text color="gray.500">{`(${formatDuration(
                  match.startTime,
                  match.endTime
                )})`}</Text>
              )}
            </Box>
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
  direction?: "horizontal" | "vertical"; // Layout direction for court display
}

export default function SessionHistoryList({
  sessionId,
  direction = "horizontal", // Default to horizontal layout
}: SessionHistoryListProps) {
  const [matches, setMatches] = useState<HistoryMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [players, setPlayers] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch players and courts for filter dropdowns
        const [playersData, courtsData] = await Promise.all([
          SessionService.getSessionPlayers(sessionId),
          SessionService.getSessionCourts(sessionId),
        ]);

        setPlayers(playersData);
        setCourts(courtsData);
        setInitialDataLoaded(true);
      } catch (err) {
        setError("Failed to load initial data. Please try again later.");
        console.error("Error fetching initial data:", err);
        setLoading(false);
      }
      // Don't set loading to false here - let the matches fetch do it
    }

    fetchInitialData();
  }, [sessionId]);

  useEffect(() => {
    async function fetchCompletedMatches() {
      // Only proceed if initial data is loaded
      if (!initialDataLoaded) return;

      try {
        setLoading(true);
        setError(null);
        let allMatches: HistoryMatch[] = [];

        // Use the new API with filters
        const filters: { playerId?: string; courtId?: string } = {};
        if (selectedPlayerId) filters.playerId = selectedPlayerId;
        if (selectedCourtId) filters.courtId = selectedCourtId;

        const result = await SessionService.getSessionMatchesWithFilters(
          sessionId,
          Object.keys(filters).length > 0 ? filters : undefined
        );

        const sessionMatches = result.matches; // Only completed matches (status === 'COMPLETED' or similar)
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
          // Get player names sorted by courtPosition
          let playerNames: string[] = [];
          if (Array.isArray(matchData.players)) {
            // Sort players by courtPosition to ensure correct pairing
            const sortedMatchPlayers = [...matchData.players].sort((a, b) => {
              const posA = a.player?.courtPosition ?? a.position ?? 0;
              const posB = b.player?.courtPosition ?? b.position ?? 0;
              return posA - posB;
            });
            playerNames = sortedMatchPlayers.map((mp: any) => mp.player?.name || "?");
          }

          
          // Extract match results using the new utility function
          let scores;
          let winningPair;

          // Create players array with position info for the utility function
          const playersWithPosition = Array.isArray(matchData.players)
            ? matchData.players.map((mp: any, index: number) => ({
                playerId: mp.player?.id || mp.playerId,
                position: mp.player?.courtPosition ?? mp.position ?? index,
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
  }, [sessionId, selectedPlayerId, selectedCourtId, initialDataLoaded]);

  return (
    <Box>
      <Text fontWeight="semibold" mb={3}>
        Matches
      </Text>
      {/* Filter Controls */}
      <Box
        mb={6}
        p={4}
        bg="gray.50"
        _dark={{ bg: "gray.700" }}
        borderRadius="lg"
      >
        <Flex gap={4} flexWrap="wrap">
          {/* Player Filter */}
          <Box minW="150px" maxW="250px" flex="1">
            <Text
              fontSize="sm"
              color="gray.600"
              _dark={{ color: "gray.400" }}
              mb={1}
            >
              Player
            </Text>
            <select
              value={selectedPlayerId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedPlayerId(e.target.value)
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              <option value="">All players</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  #{player.playerNumber} - {player.name || "Unnamed"}
                </option>
              ))}
            </select>
          </Box>

          {/* Court Filter */}
          <Box minW="150px" maxW="250px" flex="1">
            <Text
              fontSize="sm"
              color="gray.600"
              _dark={{ color: "gray.400" }}
              mb={1}
            >
              Court
            </Text>
            <select
              value={selectedCourtId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedCourtId(e.target.value)
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              <option value="">All courts</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  Court {court.courtNumber}
                  {court.courtName ? ` (${court.courtName})` : ""}
                </option>
              ))}
            </select>
          </Box>
        </Flex>
      </Box>

      {/* Results */}
      {loading ? (
        <Center py={10}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : error ? (
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
      ) : matches.length === 0 ? (
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
            {selectedPlayerId || selectedCourtId
              ? "No matches found with the selected filters. Try adjusting your filters."
              : "There are no completed matches yet. Play and complete matches to see them here!"}
          </Text>
        </Box>
      ) : (
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={6}
        >
          {matches.map((match) => (
            <HistoryMatchCard 
              key={match.id} 
              match={match} 
              direction={direction}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
}
