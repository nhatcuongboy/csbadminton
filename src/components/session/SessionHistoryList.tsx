"use client";

import {
  Box,
  Grid,
  Heading,
  Text,
  Stack,
  Badge,
  Icon,
  Flex,
  Button,
} from "@chakra-ui/react";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import Link from "next/link";
import { NextLinkButton } from "@/components/ui/NextLinkButton";

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
            <Icon as={Calendar} boxSize={5} mr={2} />
            <Text>{session.date}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={Clock} boxSize={5} mr={2} />
            <Text>{session.time}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={MapPin} boxSize={5} mr={2} />
            <Text>{session.location}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={Users} boxSize={5} mr={2} />
            <Text>
              {session.totalPlayers} / {session.maxPlayers} players
            </Text>
          </Flex>
        </Stack>

        <Box borderTopWidth="1px" pt={4} mt={2}>
          <Text color="gray.600" _dark={{ color: "gray.400" }}>
            {session.matchesPlayed} matches played
          </Text>
        </Box>

        <Flex mt={4} justify="flex-end">
          <NextLinkButton href={`/host/session/${session.id}`} variant="outline">
            View Details
          </NextLinkButton>
        </Flex>
      </Stack>
    </Box>
  );
};

// Example history sessions data - replace with actual API call
const mockHistorySessions: HistorySession[] = [
  {
    id: "1",
    title: "Sunday Morning Badminton",
    date: "2024-03-17",
    time: "09:00 AM - 11:00 AM",
    location: "Sports Center Court 1",
    totalPlayers: 12,
    maxPlayers: 12,
    matchesPlayed: 15,
    status: "completed",
  },
  {
    id: "2",
    title: "Tuesday Evening Session",
    date: "2024-03-19",
    time: "06:00 PM - 08:00 PM",
    location: "Sports Center Court 2",
    totalPlayers: 8,
    maxPlayers: 8,
    matchesPlayed: 10,
    status: "completed",
  },
];

export default function SessionHistoryList() {
  if (mockHistorySessions.length === 0) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading size="md" mb={2}>
          No Session History
        </Heading>
        <Text color="gray.500">
          You haven't hosted any sessions yet. Create a new session to get
          started!
        </Text>
      </Box>
    );
  }

  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
      {mockHistorySessions.map((session) => (
        <HistorySessionCard key={session.id} session={session} />
      ))}
    </Grid>
  );
}
