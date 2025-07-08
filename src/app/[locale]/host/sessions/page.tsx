"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { NextLinkButton } from "@/components/ui/NextLinkButton";
import TopBar from "@/components/ui/TopBar";
import { useState } from "react";
import SessionsList from "@/components/session/SessionsList";
import SessionHistoryList from "@/components/session/SessionHistoryList";
import { Plus } from "lucide-react";

export default function HostSessionsPage() {
  const t = useTranslations("pages.host");
  const common = useTranslations("common");
  const [activeTab, setActiveTab] = useState("my-sessions");

  return (
    <Box minH="100vh">
      {/* Top Bar */}
      <TopBar showBackButton={true} backHref="/host" title="Host Dashboard" />

      <Container maxW="7xl" p={4} pt={24}>
        {/* Tabs for different sections - Using custom tab implementation */}
        <Box>
          <Box
            className="tabs-container"
            borderBottom="1px solid"
            borderColor="gray.200"
            _dark={{ borderColor: "gray.700" }}
          >
            <Flex>
              <Box
                flex={1}
                p={4}
                textAlign="center"
                fontWeight="semibold"
                borderBottom="2px solid"
                borderColor={
                  activeTab === "my-sessions" ? "blue.500" : "transparent"
                }
                color={activeTab === "my-sessions" ? "blue.500" : "gray.500"}
                _hover={{
                  color: activeTab === "my-sessions" ? "blue.600" : "gray.700",
                }}
                cursor="pointer"
                onClick={() => setActiveTab("my-sessions")}
              >
                My Sessions
              </Box>
              <Box
                flex={1}
                p={4}
                textAlign="center"
                fontWeight="semibold"
                borderBottom="2px solid"
                borderColor={
                  activeTab === "history" ? "blue.500" : "transparent"
                }
                color={activeTab === "history" ? "blue.500" : "gray.500"}
                _hover={{
                  color: activeTab === "history" ? "blue.600" : "gray.700",
                }}
                cursor="pointer"
                onClick={() => setActiveTab("history")}
              >
                Session History
              </Box>
            </Flex>
          </Box>

          {/* My Sessions Tab */}
          <Box
            p={0}
            pt={4}
            display={activeTab === "my-sessions" ? "block" : "none"}
          >
            <Flex mb={6} justify="space-between" alignItems="center">
              <Heading size="md">My Badminton Sessions</Heading>
              <NextLinkButton href="/host/new">
                <Plus className="mr-2 h-4 w-4" /> New Session
              </NextLinkButton>
            </Flex>
            <VStack gap={6} alignItems="stretch">
              <SessionsList />
            </VStack>
          </Box>

          {/* History Tab */}
          <Box
            p={0}
            pt={4}
            display={activeTab === "history" ? "block" : "none"}
          >
            <Box mb={6}>
              <Heading size="md">Session History</Heading>
              <Text color="gray.500">View your past badminton sessions</Text>
            </Box>
            <VStack gap={6} alignItems="stretch">
              <SessionHistoryList />
            </VStack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
