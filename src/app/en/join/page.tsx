"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Input,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";

export default function JoinPage() {
  const [sessionCode, setSessionCode] = useState("");

  const handleJoin = () => {
    if (sessionCode.trim()) {
      // TODO: Implement join logic
      console.log("Joining session:", sessionCode);
    }
  };

  return (
    <Container maxW="container.xl" p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <Link href="/en">
          <Button variant="ghost" size="sm">
            ← Back to Home
          </Button>
        </Link>
        <Flex gap={4}>
          <Link href="/en/join">
            <Button colorScheme="blue" size="sm">
              English
            </Button>
          </Link>
          <Link href="/vi/join">
            <Button colorScheme="blue" variant="outline" size="sm">
              Tiếng Việt
            </Button>
          </Link>
        </Flex>
      </Flex>

      <Box textAlign="center" py={10}>
        <Heading size="2xl" mb={6}>
          Join a Session
        </Heading>
        <Text fontSize="xl" mb={10} color="gray.600">
          Enter the session code to join a badminton session
        </Text>

        <VStack gap={6} maxW="md" mx="auto">
          <Box width="full">
            <Text mb={2} fontWeight="medium">
              Session Code
            </Text>
            <Input
              placeholder="Enter session code"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              size="lg"
              textAlign="center"
            />
          </Box>

          <Button
            colorScheme="green"
            size="lg"
            width="full"
            onClick={handleJoin}
            disabled={!sessionCode.trim()}
          >
            Join Session
          </Button>
        </VStack>
      </Box>
    </Container>
  );
}
