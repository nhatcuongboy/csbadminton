"use client";

import { useState, useEffect } from "react";
import { Spinner, Center, Box, Text } from "@chakra-ui/react";
import { SessionService, type Session } from "@/lib/api";
import SessionDetailContent from "@/components/session/SessionDetailContent";

// Type cho session detail data
interface SessionDetailResponse {
  id: string;
  name: string;
  hostId: string;
  host: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  startTime: string | null;
  endTime: string | null;
  numberOfCourts: number;
  sessionDuration: number;
  maxPlayersPerCourt: number;
  requirePlayerInfo: boolean;
  players: any[];
  courts: any[];
  matches: any[];
  waitingQueue?: any[];
}

export default function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const sessionId = params?.id;
  const [session, setSession] = useState<SessionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessionData() {
      if (!sessionId) {
        setError("Session ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const sessionData = await SessionService.getSession(sessionId);
        
        // Chuyển đổi định dạng Session từ API sang SessionDetailResponse
        const formattedSession: SessionDetailResponse = {
          id: sessionData.id,
          name: sessionData.name,
          hostId: sessionData.hostId,
          host: sessionData.host,
          status: sessionData.status,
          startTime: sessionData.startTime ? sessionData.startTime.toString() : null,
          endTime: sessionData.endTime ? sessionData.endTime.toString() : null,
          numberOfCourts: sessionData.numberOfCourts,
          sessionDuration: sessionData.sessionDuration,
          maxPlayersPerCourt: sessionData.maxPlayersPerCourt,
          requirePlayerInfo: sessionData.requirePlayerInfo,
          courts: sessionData.courts || [],
          players: sessionData.players || [],
          matches: [], // API mới không trả về trường này
          waitingQueue: sessionData.players?.filter(p => p.status === "WAITING") || []
        };
        
        setSession(formattedSession);
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("An error occurred while loading session data");
      } finally {
        setLoading(false);
      }
    }

    fetchSessionData();
  }, [sessionId]);

  // Loading state
  if (loading) {
    return (
      <Center minH="50vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        p={6}
        bg="red.50"
        color="red.600"
        borderRadius="md"
        m={8}
        textAlign="center"
      >
        <Text fontSize="lg" fontWeight="medium">
          {error}
        </Text>
        <Text mt={2}>
          Please try again or contact support if the problem persists.
        </Text>
      </Box>
    );
  }

  // No session found
  if (!session) {
    return (
      <Box
        p={6}
        bg="blue.50"
        color="blue.600"
        borderRadius="md"
        m={8}
        textAlign="center"
      >
        <Text fontSize="lg" fontWeight="medium">
          Session not found
        </Text>
        <Text mt={2}>
          The session you're looking for might have been deleted or doesn't
          exist.
        </Text>
      </Box>
    );
  }

  // Pass the session data to the SessionDetailContent component
  return <SessionDetailContent sessionData={session} />;
}
