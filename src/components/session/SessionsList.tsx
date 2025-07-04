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
import { Calendar, Clock, Users, SquareAsterisk } from "lucide-react";
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

const mapSessionStatus = (
  status: "PREPARING" | "IN_PROGRESS" | "FINISHED"
): "upcoming" | "in-progress" | "completed" => {
  switch (status) {
    case "PREPARING":
      return "upcoming";
    case "IN_PROGRESS":
      return "in-progress";
    case "FINISHED":
      return "completed";
    default:
      return "upcoming";
  }
};

// UI Session type based on API data
interface UISession {
  id: string;
  title: string;
  date: string;
  time: string;
  numberOfCourts: number;
  totalPlayers: number;
  maxPlayers: number;
  status: "upcoming" | "in-progress" | "completed";
  hostName: string;
}

const SessionCard = ({ session }: { session: UISession }) => {
  const statusColors = {
    upcoming: "blue",
    "in-progress": "green",
    completed: "gray",
  };

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
        transform: "translateY(-4px)",
        boxShadow: "lg",
      }}
    >
      <Stack gap={4}>
        <Flex justify="space-between" align="flex-start">
          <Heading size="md" mb={2}>
            {session.title}
          </Heading>
          <Badge colorScheme={statusColors[session.status]}>
            {session.status.replace("-", " ")}
          </Badge>
        </Flex>

        <Stack gap={3}>
          <Flex align="center">
            <Icon as={Calendar} boxSize={5} mr={2} color="blue.500" />
            <Text>{session.date}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={Clock} boxSize={5} mr={2} color="blue.500" />
            <Text>{session.time}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={SquareAsterisk} boxSize={5} mr={2} color="blue.500" />
            <Text>{session.numberOfCourts} courts available</Text>
          </Flex>
          <Flex align="center">
            <Icon as={Users} boxSize={5} mr={2} color="blue.500" />
            <Text>
              {session.totalPlayers} / {session.maxPlayers} players
            </Text>
          </Flex>
        </Stack>

        <Flex mt={4} justify="flex-end">
          <NextLinkButton href={`/host/sessions/${session.id}`} colorScheme="blue">
            Manage Session
          </NextLinkButton>
        </Flex>
      </Stack>
    </Box>
  );
};

export default function SessionsList() {
  const [sessions, setSessions] = useState<UISession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);
        const sessionData = await SessionService.getAllSessions();

        // Transform API data to UI format
        const uiSessions = sessionData.map((session: Session) => {
          // Calculate max players based on courts and maxPlayersPerCourt
          const maxPlayers = session.numberOfCourts * session.maxPlayersPerCourt;

          return {
            id: session.id,
            title: session.name,
            date: session.startTime
              ? formatDate(session.startTime)
              : formatDate(session.createdAt) + " (Not started)",
            time: session.startTime
              ? `${formatTime(session.startTime)} - ${
                  session.endTime ? formatTime(session.endTime) : "In progress"
                }`
              : "Not started yet",
            numberOfCourts: session.numberOfCourts,
            totalPlayers: session._count?.players || 0,
            maxPlayers,
            status: mapSessionStatus(session.status),
            hostName: session.host?.name || "",
          };
        });

        setSessions(uiSessions);
      } catch (err) {
        setError("Failed to load sessions. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
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
          No Active Sessions
        </Heading>
        <Text color="gray.500">
          You don't have any active sessions. Create a new one to get started!
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
        <SessionCard key={session.id} session={session} />
      ))}
    </Grid>
  );
}
