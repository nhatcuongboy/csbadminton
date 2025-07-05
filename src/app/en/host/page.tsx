"use client";

import { Box, Container, Heading, Text, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";

export default function HostPage() {
  return (
    <Container maxW="container.xl" p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <Link href="/en">
          <Button variant="ghost" size="sm">
            ← Back to Home
          </Button>
        </Link>
        <Flex gap={4}>
          <Link href="/en/host">
            <Button colorScheme="blue" size="sm">
              English
            </Button>
          </Link>
          <Link href="/vi/host">
            <Button colorScheme="blue" variant="outline" size="sm">
              Tiếng Việt
            </Button>
          </Link>
        </Flex>
      </Flex>

      <Box textAlign="center" py={10}>
        <Heading size="2xl" mb={6}>
          Host a Session
        </Heading>
        <Text fontSize="xl" mb={10} color="gray.600">
          Create and manage a badminton session
        </Text>

        <Flex direction="column" gap={6} maxW="md" mx="auto">
          <Link href="/en/host/new">
            <Button colorScheme="blue" size="lg" width="full">
              Create New Session
            </Button>
          </Link>
          <Link href="/en/host/sessions">
            <Button colorScheme="gray" size="lg" width="full">
              View Existing Sessions
            </Button>
          </Link>
        </Flex>
      </Box>
    </Container>
  );
}
