"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Heading,
  Text,
  Stack,
  Badge,
  Icon,
  Flex,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import Link from "next/link";
import { NextLinkButton } from "@/components/ui/NextLinkButton";
import { SessionService, type Session } from "@/lib/api";

// Helper functions for formatting
const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTimeRange = (startTime?: Date, endTime?: Date): string => {
  if (!startTime) return "Time not recorded";
  
  const start = formatTime(startTime);
  if (!endTime) return `${start} - End time not recorded`;
  
  const end = formatTime(endTime);
  return `${start} - ${end}`;
};

type HistorySession = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  totalPlayers: number;
  maxPlayers: number;
  matchesPlayed: number;
  status: "completed";
  numberOfCourts: number;
};

const HistorySessionCard = ({ session }: { session: HistorySession }) => {
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
        <Flex justify="space-between" align="flex-start">
          <Heading size="md" mb={2}>
            {session.title}
          </Heading>
          <Badge colorScheme="gray">Completed</Badge>
        </Flex>

        <Stack gap={3}>
          <Flex align="center">
            <Icon as={Calendar} boxSize={5} mr={2} color="gray.500" />
            <Text>{session.date}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={Clock} boxSize={5} mr={2} color="gray.500" />
            <Text>{session.time}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={MapPin} boxSize={5} mr={2} color="gray.500" />
            <Text>{session.numberOfCourts} courts used</Text>
          </Flex>
          <Flex align="center">
            <Icon as={Users} boxSize={5} mr={2} color="gray.500" />
            <Text>
              {session.totalPlayers} players participated
            </Text>
          </Flex>
        </Stack>

        <Box borderTopWidth="1px" pt={4} mt={2}>
          <Text color="gray.600" _dark={{ color: "gray.400" }}>
            {session.matchesPlayed > 0 
              ? `${session.matchesPlayed} matches played`
              : "No matches recorded"
            }
          </Text>
        </Box>

        <Flex mt={4} justify="flex-end">
          <NextLinkButton href={`/host/sessions/${session.id}`} variant="outline">
            View Details
          </NextLinkButton>
        </Flex>
      </Stack>
    </Box>
  );
};

export default function SessionHistoryList() {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistorySessions() {
      try {
        setLoading(true);
        const allSessions = await SessionService.getAllSessions();
        
        // Filter only completed sessions
        const completedSessions = allSessions.filter(
          (session: Session) => session.status === "FINISHED"
        );

        // Transform to UI format with matches count
        const historySessionsPromises = completedSessions.map(
          async (session: Session): Promise<HistorySession> => {
            const maxPlayers = session.numberOfCourts * session.maxPlayersPerCourt;
            
            // Get matches count for this session
            let matchesPlayed = 0;
            try {
              const matches = await SessionService.getSessionMatches(session.id);
              matchesPlayed = matches.length;
            } catch (error) {
              console.warn(`Failed to get matches for session ${session.id}:`, error);
              matchesPlayed = 0;
            }

            return {
              id: session.id,
              title: session.name,
              date: session.startTime 
                ? formatDate(session.startTime)
                : formatDate(session.createdAt),
              time: formatTimeRange(session.startTime, session.endTime),
              location: `${session.numberOfCourts} courts`,
              totalPlayers: session._count?.players || 0,
              maxPlayers,
              matchesPlayed,
              status: "completed",
              numberOfCourts: session.numberOfCourts,
            };
          }
        );

        const historySessions = await Promise.all(historySessionsPromises);
        setSessions(historySessions);
      } catch (err) {
        setError("Failed to load session history. Please try again later.");
        console.error("Error fetching session history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistorySessions();
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

  if (sessions.length === 0) {
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
          No Session History
        </Heading>
        <Text color="gray.500">
          You haven't completed any sessions yet. Host and complete sessions to see your history here!
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
      {sessions.map((session) => (
        <HistorySessionCard key={session.id} session={session} />
      ))}
    </Grid>
  );
}
