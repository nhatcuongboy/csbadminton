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
import { Plus } from "lucide-react";
import SessionsList from "@/components/session/SessionsList";
import { useState } from "react";

export default function HostSessionsPage() {
  const t = useTranslations("pages.host");
  const common = useTranslations("common");
  const [status, setStatus] = useState<string>("ALL");

  const statusOptions = [
    { value: "ALL", label: "All" },
    { value: "PREPARING", label: "Preparing" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "FINISHED", label: "Finished" },
  ];

  return (
    <Box minH="100vh">
      {/* Top Bar */}
      <TopBar showBackButton={true} backHref="/host" title="Host Dashboard" />

      <Container maxW="7xl" p={4} pt={24}>
        {/* Filter */}
        <Flex mb={4} justify="flex-end">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #CBD5E0",
              minWidth: 160,
            }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Flex>
        {/* My Sessions Content Only */}
        <Flex mb={6} justify="space-between" alignItems="center">
          <Heading size="md">My Badminton Sessions</Heading>
          <NextLinkButton href="/host/new">
            <Plus className="mr-2 h-4 w-4" /> New Session
          </NextLinkButton>
        </Flex>
        <VStack gap={6} alignItems="stretch">
          <SessionsList status={status} mode="manage" />
        </VStack>
      </Container>
    </Box>
  );
}
