"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Center, Box, Text } from "@chakra-ui/react";
import { SessionService } from "@/lib/api";
import SessionDetailContent from "@/components/session/SessionDetailContent";

// Get the session detail data and adapt it to the format expected by SessionDetailContent
export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  // Use React.use() to unwrap params if it's a Promise, otherwise use it directly
  const unwrappedParams = use(params);
  const sessionId = unwrappedParams.id;
  const [session, setSession] = useState<any>(null);
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
        
        // Transform API data format to match what SessionDetailContent expects
        const formattedSession = {
          ...sessionData,
          // Ensure dates are proper Date objects for formatting
          startTime: sessionData.startTime ? new Date(sessionData.startTime) : null,
          endTime: sessionData.endTime ? new Date(sessionData.endTime) : null,
          // Đảm bảo các mảng tồn tại
          courts: sessionData.courts || [],
          players: sessionData.players || [],
          matches: [], // API mới không trả về matches
          waitingQueue: sessionData.players?.filter(
            (p: any) => p.status === "WAITING"
          ) || [],
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
