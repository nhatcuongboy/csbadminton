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
import { useTranslations } from "next-intl";

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

// UI Session type based on API data
interface UISession {
  id: string;
  title: string;
  date: string;
  time: string;
  numberOfCourts: number;
  totalPlayers: number;
  maxPlayers: number;
  status: "PREPARING" | "IN_PROGRESS" | "FINISHED";
  hostName: string;
}

const statusColors = {
  PREPARING: "blue",
  IN_PROGRESS: "green",
  FINISHED: "gray",
};

const statusLabels = {
  PREPARING: "Preparing",
  IN_PROGRESS: "In Progress",
  FINISHED: "Finished",
};

interface SessionCardProps {
  session: UISession;
  onDelete?: (id: string) => void;
  mode?: "view" | "manage";
}

const SessionCard = ({
  session,
  onDelete,
  mode = "view",
}: SessionCardProps) => {
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
            {statusLabels[session.status]}
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

        <Flex mt={4} gap={2} justify="flex-end">
          <NextLinkButton
            href={`/host/sessions/${session.id}`}
            colorScheme="blue"
          >
            Manage Session
          </NextLinkButton>
          {mode === "manage" && onDelete && (
            <button
              style={{
                background: "#fff",
                color: "#e53e3e",
                border: "1px solid #e53e3e",
                borderRadius: 6,
                padding: "8px 16px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this session?"
                  )
                ) {
                  onDelete(session.id);
                }
              }}
            >
              Delete
            </button>
          )}
        </Flex>
      </Stack>
    </Box>
  );
};

interface SessionsListProps {
  status?: string;
  mode?: "view" | "manage";
}

export default function SessionsList({
  status = "ALL",
  mode = "view",
}: SessionsListProps) {
  const [sessions, setSessions] = useState<UISession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("session");

  // Delete handler
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await SessionService.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError("Failed to delete session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);
        const sessionData = await SessionService.getAllSessions();

        // Transform API data to UI format
        const uiSessions = sessionData.map((session: Session) => {
          // Calculate max players based on courts and maxPlayersPerCourt
          const maxPlayers =
            session.numberOfCourts * session.maxPlayersPerCourt;

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
            status: session.status,
            hostName: session.host?.name || "",
          };
        });

        setSessions(uiSessions);
      } catch (err) {
        setError(t("loadingError"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  // Filter sessions by status
  const filteredSessions =
    status === "ALL"
      ? sessions
      : status === "UPCOMING_AND_INPROGRESS"
      ? sessions.filter(
          (s) => s.status === "PREPARING" || s.status === "IN_PROGRESS"
        )
      : sessions.filter((s) => s.status === status);

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

  if (filteredSessions.length === 0) {
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
          {t("noActiveSessions")}
        </Heading>
        <Text color="gray.500">{t("noActiveSessionsDescription")}</Text>
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
      {filteredSessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onDelete={mode === "manage" ? handleDelete : undefined}
          mode={mode}
        />
      ))}
    </Grid>
  );
}
