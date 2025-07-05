"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from 'next-intl';
import { Link as IntlLink } from '@/i18n/config';
import SessionsList from "@/components/session/SessionsList";
import SessionHistoryList from "@/components/session/SessionHistoryList";
import NextLinkButton from "@/components/ui/NextLinkButton";

export default function HostPage() {
  const [activeTab, setActiveTab] = useState("my-sessions");
  const t = useTranslations('pages.host');
  const common = useTranslations('common');

  return (
    <Container maxW="7xl" py={8}>
      {/* Header with back button */}
      <Flex alignItems="center" mb={8}>
        <IntlLink href="/">
          <Button variant="outline" size="sm" mr={4}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {common('back')}
          </Button>
        </IntlLink>
        <Heading size="lg" fontWeight="bold">
          {t('title')}
        </Heading>
      </Flex>

      {/* Tabs for different sections - Using custom tab implementation */}
      <Box>
        <Box
          className="tabs-container"
          borderBottom="1px solid"
          borderColor="gray.200"
          _dark={{ borderColor: "gray.700" }}
        >
          <Flex mb={8}>
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
              {t('existingSessions')}
            </Box>
            <Box
              flex={1}
              p={4}
              textAlign="center"
              fontWeight="semibold"
              borderBottom="2px solid"
              borderColor={activeTab === "history" ? "blue.500" : "transparent"}
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
            <Heading size="md">{t('existingSessions')}</Heading>
            <IntlLink href="/host/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> {t('createNew')}
              </Button>
            </IntlLink>
          </Flex>

          <VStack gap={6} alignItems="stretch">
            <SessionsList />
          </VStack>
        </Box>

        {/* History Tab */}
        <Box p={0} pt={4} display={activeTab === "history" ? "block" : "none"}>
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
  );
}
