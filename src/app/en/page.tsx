"use client";

import { Box, Container, Heading, Text, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";

export default function EnglishHomePage() {
  return (
    <Container maxW="container.xl" p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <Heading color="blue.600">Badminton Court Management</Heading>
        <Flex gap={4}>
          <Link href="/en">
            <Button colorScheme="blue" size="sm">
              English
            </Button>
          </Link>
          <Link href="/vi">
            <Button colorScheme="blue" variant="outline" size="sm">
              Tiếng Việt
            </Button>
          </Link>
        </Flex>
      </Flex>

      <Box textAlign="center" py={20}>
        <Heading size="2xl" mb={6}>
          Manage Your Badminton Sessions
        </Heading>
        <Text fontSize="xl" mb={10} color="gray.600">
          Efficiently organize courts, players, and matches for your badminton
          club
        </Text>

        <Flex gap={6} justifyContent="center">
          <Link href="/en/host">
            <Button colorScheme="blue" size="lg" px={8}>
              Host a Session
            </Button>
          </Link>
          <Link href="/en/join">
            <Button colorScheme="green" size="lg" px={8}>
              Join a Session
            </Button>
          </Link>
        </Flex>
      </Box>

      <Box bg="gray.50" p={8} borderRadius="lg" mt={16}>
        <Heading size="lg" mb={4}>
          Features
        </Heading>
        <Text>• Manage multiple courts and sessions</Text>
        <Text>• Track players and wait times</Text>
        <Text>• Auto-assign players to matches</Text>
        <Text>• Real-time session updates</Text>
      </Box>
    </Container>
  );
}
