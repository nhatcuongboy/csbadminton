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
};

const HistoryMatchCard = ({ match }: { match: HistoryMatch }) => {
  // Assume match.players is an array of 4 player names, order: [A1, A2, B1, B2]
  const pair1 = match.players.slice(0, 2);
  const pair2 = match.players.slice(2, 4);
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
            <Box>
              <Text color="gray.600" fontSize="sm">
                Pair 1
              </Text>
              <Text>{pair1.join(" & ")}</Text>
            </Box>
            <Box>
              <Text color="gray.600" fontSize="sm">
                Pair 2
              </Text>
              <Text>{pair2.join(" & ")}</Text>
            </Box>
          </Flex>
        </Box>

        {match.winner && (
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
        );
        // Only completed matches (status === 'COMPLETED' or similar)
        const completedMatches = sessionMatches.filter(
          (m: any) => m.status === "COMPLETED" || m.status === "FINISHED"
        );
        for (const match of completedMatches) {
          // Get court name/number if available, fallback to courtId
          let courtName = "Court ?";
          if (match.court && match.court.courtName && match.court.courtNumber) {
            courtName = `Court ${match.court.courtNumber} (${match.court.courtName})`;
          } else if (match.court && match.court.courtName) {
            courtName = match.court.courtName;
          } else if (match.court && match.court.courtNumber) {
            courtName = `Court ${match.court.courtNumber}`;
          } else if (match.courtId) {
            courtName = `Court ${match.courtId}`;
          }
          // Get player names (match.players is array of { player: { name } })
          const playerNames = Array.isArray(match.players)
            ? match.players.map((mp: any) => mp.player?.name || "?")
            : [];
          allMatches.push({
            id: match.id,
            sessionId,
            court: courtName,
            players: playerNames,
            startTime: match.startTime,
            endTime: match.endTime,
            winner: undefined, // winner field not available in Match type
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
