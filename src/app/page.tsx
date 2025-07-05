"use client";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Stack,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  SimpleGrid,
  ListItem,
  Image,
} from "@chakra-ui/react";
import { NextLinkButton } from "@/components/ui/NextLinkButton";
import {
  ArrowRight,
  Plus,
  Calendar,
  Users,
  Check,
  ArrowUpRight,
} from "lucide-react";
import * as React from "react";
type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  buttonText: string;
  buttonLink: string;
  accentColor?: string;
};
type StartGuideProps = {
  title: string;
  steps: string[];
  buttonText: string;
  buttonLink: string;
  primary: boolean;
};
export default function Home() {
  const bgGradient = "linear(to-r, teal.100, green.100)";
  const accentColor = "blue.500";
  return (
    <Box minH="100vh">
      {/* Hero Section with Gradient */}
      <Box bgGradient={bgGradient} py={16} px={4} textAlign="center">
        <Container maxW="container.xl">
          <Heading
            as="h1"
            size="3xl"
            mb={6}
            bgGradient="linear(to-r, blue.600, cyan.600)"
            bgClip="text"
            fontWeight="extrabold"
          >
            Badminton Session Manager
          </Heading>
          <Text
            fontSize="xl"
            maxW="2xl"
            mx="auto"
            mb={10}
            color="gray.600"
            _dark={{ color: "gray.300" }}
          >
            Manage your badminton sessions, track player rotation, and optimize
            court usage
          </Text>
          <Flex gap={6} justify="center" flexWrap="wrap">
            <NextLinkButton
              href="/host"
              size="lg"
              colorScheme="blue"
              px={8}
              py={7}
              fontSize="lg"
              fontWeight="bold"
              _hover={{ transform: "translateY(-3px)" }}
              transition="all 0.2s"
            >
              Host Mode
              <ArrowRight className="ml-2" size={18} />
            </NextLinkButton>
            <NextLinkButton
              href="/join"
              size="lg"
              variant="outline"
              px={8}
              py={7}
              fontSize="lg"
              _hover={{ transform: "translateY(-3px)" }}
              transition="all 0.2s"
            >
              Join as Player
              <Users className="ml-2" size={18} />
            </NextLinkButton>
          </Flex>
        </Container>
      </Box>
      {/* Main Content */}
      <Container maxW="container.xl" py={16}>
        {/* Features with animated cards */}
        <Stack gap={16}>
          {/* Description section */}
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={12}
            w="full"
            alignItems="center"
          >
            <Box>
              <Heading as="h2" size="xl" mb={6}>
                Effortless Badminton{" "}
                <Text as="span" color="blue.500">
                  Session Management
                </Text>
              </Heading>
              <Text
                fontSize="lg"
                mb={6}
                color="gray.600"
                _dark={{ color: "gray.400" }}
                lineHeight="taller"
              >
                Our intuitive platform helps you organize badminton sessions
                with ease. Easily track players, manage courts, and ensure
                everyone gets fair play time with our smart rotation system.
              </Text>
              <Flex gap={4} flexDir={{ base: "column", sm: "row" }}>
                <NextLinkButton href="/host" colorScheme="blue" size="lg" fontWeight="bold">
                  Get Started
                  <ArrowRight className="ml-2" size={18} />
                </NextLinkButton>
                <NextLinkButton href="#features" variant="ghost" size="lg">
                  Explore Features
                  <ArrowUpRight className="ml-2" size={18} />
                </NextLinkButton>
              </Flex>
            </Box>
            <Flex justify="center" align="center">
              <Box
                bg="gray.100"
                _dark={{ bg: "gray.700" }}
                borderRadius="xl"
                p={8}
                display="flex"
                alignItems="center"
                justifyContent="center"
                minH="300px"
                w="full"
              >
                <Calendar size={64} color="var(--chakra-colors-gray-400)" />
              </Box>
            </Flex>
          </Grid>
          {/* Features Section */}
          <Box id="features" width="full" pt={8}>
            <Box textAlign="center" mb={12} position="relative">
              <Heading as="h2" size="xl">
                Key Features
              </Heading>
              <Box
                w="80px"
                h="4px"
                bg="blue.500"
                position="absolute"
                bottom="-12px"
                left="50%"
                transform="translateX(-50%)"
              />
            </Box>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={10}>
              <FeatureCard
                title="Session Management"
                description="Create and configure custom badminton sessions with flexible settings for courts, duration and player requirements"
                icon={Calendar}
                buttonText="Create Session"
                buttonLink="/host"
                accentColor={accentColor}
              />
              <FeatureCard
                title="Player Tracking"
                description="Advanced tracking for player wait times, match history, and automated fair rotation system for all participants"
                icon={Users}
                buttonText="Manage Players"
                buttonLink="/host"
                accentColor={accentColor}
              />
              <FeatureCard
                title="Session History"
                description="Comprehensive statistics and session history with insights to improve future play organization and player experience"
                icon={Calendar}
                buttonText="View History"
                buttonLink="/host/history"
                accentColor={accentColor}
              />
            </SimpleGrid>
          </Box>
          {/* Getting Started Section */}
          <Box
            width="full"
            bg="gray.50"
            _dark={{ bg: "gray.800" }}
            p={{ base: 6, md: 12 }}
            borderRadius="xl"
            boxShadow="lg"
          >
            <Heading as="h2" size="xl" mb={8} textAlign="center">
              Getting Started
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={12}>
              <StartGuide
                title="For Hosts"
                steps={[
                  "Create a new session with your preferred settings",
                  "Add players or let them join with their player number",
                  "Start the session when ready",
                  "Manage court rotations and player assignments",
                  "End the session to generate statistics",
                ]}
                buttonText="Host a Session"
                buttonLink="/host"
                primary={true}
              />
              <StartGuide
                title="For Players"
                steps={[
                  "Get your player number from the host",
                  "Enter your number to join the session",
                  "Fill in your information if required",
                  "Follow the queue and court assignments",
                  "Enjoy your badminton session!",
                ]}
                buttonText="Join a Session"
                buttonLink="/join"
                primary={false}
              />
            </Grid>
          </Box>
        </Stack>
      </Container>
      {/* Footer */}
      <Box bg="gray.50" _dark={{ bg: "gray.900" }} py={10}>
        <Container maxW="container.xl">
          <Flex direction="column" align="center">
            <Text color="gray.500" fontSize="sm">
              © {new Date().getFullYear()} Badminton Session Manager. All rights
              reserved.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
// Feature Card Component
function FeatureCard({
  title,
  description,
  icon,
  buttonText,
  buttonLink,
  accentColor,
}: FeatureCardProps) {
  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      p={5}
      h="full"
      bg="white"
      _dark={{ bg: "gray.800" }}
      boxShadow="md"
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "xl",
        borderColor: "blue.500",
      }}
    >
      <Box pb={2}>
        <Flex align="center" mb={3}>
          <Box color="blue.500" mr={2}>
            {React.createElement(icon, { size: 24 })}
          </Box>
          <Heading size="md">{title}</Heading>
        </Flex>
      </Box>
      <Box pt={0} pb={4}>
        <Text color="gray.500" _dark={{ color: "gray.400" }}>
          {description}
        </Text>
      </Box>
      <Box pt={0}>
        <NextLinkButton href={buttonLink} variant="outline" colorScheme="blue" width="full">
          {buttonText}
          <Plus className="ml-2" size={16} />
        </NextLinkButton>
      </Box>
    </Box>
  );
}
// Start Guide Component
function StartGuide({
  title,
  steps,
  buttonText,
  buttonLink,
  primary,
}: StartGuideProps) {
  return (
    <Stack gap={6} alignItems="flex-start">
      <Heading size="lg" fontWeight="bold">
        {title}
      </Heading>
      <Stack gap={3}>
        {steps.map((step, index) => (
          <Flex key={index} alignItems="flex-start">
            <Box color={primary ? "blue.500" : "green.500"} mr={2} mt={1}>
              <Check size={16} />
            </Box>
            <Text>{step}</Text>
          </Flex>
        ))}
      </Stack>
      <NextLinkButton
        href={buttonLink}
        colorScheme={primary ? "blue" : "gray"}
        mt={4}
        alignSelf="flex-start"
      >
        {buttonText}
        <ArrowRight className="ml-2" size={16} />
      </NextLinkButton>
    </Stack>
  );
}
