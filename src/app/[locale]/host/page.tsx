"use client";

import * as React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Grid,
  Stack,
  SimpleGrid,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { NextLinkButton } from "@/components/ui/NextLinkButton";
import TopBar from "@/components/ui/TopBar";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  Settings,
  Clock,
  BarChart3,
} from "lucide-react";

export default function HostPage() {
  const t = useTranslations("pages.host");
  const common = useTranslations("common");

  const bgGradient = "linear(to-r, blue.100, purple.100)";

  return (
    <Box minH="100vh">
      {/* Top Bar */}
      <TopBar showBackButton={true} backHref="/" title="Host" />

      {/* Main Content */}
      <Container maxW="container.xl" py={16} mt={10}>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={12}>
          {/* Quick Actions */}
          <Box>
            <Heading as="h2" size="xl" mb={8} textAlign="center">
              Quick Actions
            </Heading>
            <Stack gap={6}>
              <Box
                borderWidth="1px"
                borderRadius="xl"
                overflow="hidden"
                p={6}
                bg="white"
                _dark={{ bg: "gray.800" }}
                boxShadow="lg"
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "xl",
                  borderColor: "blue.500",
                }}
              >
                <Flex align="center" mb={4}>
                  <Box color="blue.500" mr={3}>
                    <Plus size={24} />
                  </Box>
                  <Heading size="md">Create New Session</Heading>
                </Flex>
                <Text color="gray.600" _dark={{ color: "gray.400" }} mb={4}>
                  Start a new badminton session with custom settings
                </Text>
                <NextLinkButton
                  href="/host/new"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                >
                  {t("createNew")}
                </NextLinkButton>
              </Box>

              <Box
                borderWidth="1px"
                borderRadius="xl"
                overflow="hidden"
                p={6}
                bg="white"
                _dark={{ bg: "gray.800" }}
                boxShadow="lg"
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "xl",
                  borderColor: "purple.500",
                }}
              >
                <Flex align="center" mb={4}>
                  <Box color="purple.500" mr={3}>
                    <Calendar size={24} />
                  </Box>
                  <Heading size="md">Manage Sessions</Heading>
                </Flex>
                <Text color="gray.600" _dark={{ color: "gray.400" }} mb={4}>
                  View and manage your existing sessions
                </Text>
                <NextLinkButton
                  href="/host/sessions"
                  colorScheme="purple"
                  variant="outline"
                  size="lg"
                  width="full"
                >
                  {t("existingSessions")}
                </NextLinkButton>
              </Box>
            </Stack>
          </Box>

          {/* Features Overview */}
          <Box>
            <Heading as="h2" size="xl" mb={8} textAlign="center">
              Host Features
            </Heading>
            <SimpleGrid columns={1} gap={4}>
              <FeatureItem
                icon={Users}
                title="Player Management"
                description="Add players, manage wait times, and track participation"
                color="green.500"
              />
              <FeatureItem
                icon={Clock}
                title="Session Control"
                description="Start, pause, and manage session timing and rotations"
                color="orange.500"
              />
              <FeatureItem
                icon={BarChart3}
                title="Analytics"
                description="View session statistics and player performance data"
                color="red.500"
              />
              <FeatureItem
                icon={Settings}
                title="Customization"
                description="Configure courts, rules, and session preferences"
                color="cyan.500"
              />
            </SimpleGrid>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}

// Feature Item Component
function FeatureItem({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Flex
      align="start"
      p={4}
      borderRadius="lg"
      bg="gray.50"
      _dark={{ bg: "gray.700" }}
    >
      <Box color={color} mr={4} mt={1}>
        {React.createElement(icon, { size: 20 })}
      </Box>
      <Box>
        <Heading size="sm" mb={2}>
          {title}
        </Heading>
        <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
          {description}
        </Text>
      </Box>
    </Flex>
  );
}
