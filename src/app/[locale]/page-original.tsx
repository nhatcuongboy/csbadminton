"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Image,
} from "@chakra-ui/react";
import {
  ArrowRight,
  Plus,
  Calendar,
  Users,
  Check,
  ArrowUpRight,
} from "lucide-react";
import * as React from "react";
import { useTranslations } from 'next-intl';
import { Link as IntlLink } from '@/i18n/config';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Home() {
  const t = useTranslations('pages.home');
  
  return (
    <Container maxW="container.xl" p={0}>
      {/* Language Switcher */}
      <Box p={4} display="flex" justifyContent="flex-end">
        <LanguageSwitcher />
      </Box>

      {/* Hero Section */}
      <Box
        position="relative"
        overflow="hidden"
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={20}
        px={8}
        minH="70vh"
        display="flex"
        alignItems="center"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.1)"
        />
        <Box position="relative" zIndex={1} w="full">
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={12}
            alignItems="center"
            maxW="container.xl"
            mx="auto"
          >
            <Box>
              <Heading
                as="h1"
                size="2xl"
                mb={6}
                fontWeight="bold"
                lineHeight="1.2"
              >
                {t('title')}
              </Heading>
              <Text fontSize="xl" mb={8} opacity={0.9}>
                {t('description')}
              </Text>
              <Stack
                direction={{ base: "column", sm: "row" }}
                gap={4}
                align="start"
              >
                <IntlLink href="/host">
                  <Button
                    size="lg"
                    bg="white"
                    color="purple.600"
                    _hover={{ bg: "gray.100" }}
                    px={8}
                  >
                    {t('hostButton')} <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                  </Button>
                </IntlLink>
                <IntlLink href="/join">
                  <Button
                    size="lg"
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ bg: "whiteAlpha.200" }}
                    px={8}
                  >
                    {t('joinButton')} <Users size={20} style={{ marginLeft: '8px' }} />
                  </Button>
                </IntlLink>
              </Stack>
            </Box>
            <Box>
              <Box
                w="400px"
                h="300px"
                bg="gray.100"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="gray.500"
                shadow="xl"
                mx="auto"
              >
                <Text fontSize="xl" fontWeight="bold">
                  🏸 Badminton App
                </Text>
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>

      {/* Features Section */}
      <Box py={20} px={8}>
        <Container maxW="container.xl">
          <Box textAlign="center" mb={16}>
            <Heading as="h2" size="xl" mb={4}>
              Key Features
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Everything you need to manage badminton sessions
            </Text>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              shadow="md"
              _hover={{ shadow: "lg" }}
            >
              <Box
                bg="purple.100"
                color="purple.600"
                w={12}
                h={12}
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
              >
                <Calendar size={24} />
              </Box>
              <Heading size="md" mb={2}>
                Session Management
              </Heading>
              <Text color="gray.600">
                Create and manage badminton sessions with ease. Set up courts,
                manage players, and track game progress.
              </Text>
            </Box>

            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              shadow="md"
              _hover={{ shadow: "lg" }}
            >
              <Box
                bg="blue.100"
                color="blue.600"
                w={12}
                h={12}
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
              >
                <Users size={24} />
              </Box>
              <Heading size="md" mb={2}>
                Player Queue
              </Heading>
              <Text color="gray.600">
                Automatic player queue management. Players can join sessions
                and get assigned to courts automatically.
              </Text>
            </Box>

            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              shadow="md"
              _hover={{ shadow: "lg" }}
            >
              <Box
                bg="green.100"
                color="green.600"
                w={12}
                h={12}
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
              >
                <Check size={24} />
              </Box>
              <Heading size="md" mb={2}>
                Real-time Updates
              </Heading>
              <Text color="gray.600">
                Get real-time updates on court availability, player status,
                and game progress.
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* How it Works Section */}
      <Box bg="gray.50" py={20} px={8}>
        <Container maxW="container.xl">
          <Box textAlign="center" mb={16}>
            <Heading as="h2" size="xl" mb={4}>
              How It Works
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Simple steps to get started
            </Text>
          </Box>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
            gap={8}
            alignItems="start"
          >
            <Box textAlign="center">
              <Box
                bg="purple.600"
                color="white"
                w={16}
                h={16}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb={4}
                fontSize="xl"
                fontWeight="bold"
              >
                1
              </Box>
              <Heading size="md" mb={2}>
                Create Session
              </Heading>
              <Text color="gray.600">
                Host creates a badminton session with courts and settings
              </Text>
            </Box>
            <Box textAlign="center">
              <Box
                bg="blue.600"
                color="white"
                w={16}
                h={16}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb={4}
                fontSize="xl"
                fontWeight="bold"
              >
                2
              </Box>
              <Heading size="md" mb={2}>
                Players Join
              </Heading>
              <Text color="gray.600">
                Players join using session code and get added to the queue
              </Text>
            </Box>
            <Box textAlign="center">
              <Box
                bg="green.600"
                color="white"
                w={16}
                h={16}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb={4}
                fontSize="xl"
                fontWeight="bold"
              >
                3
              </Box>
              <Heading size="md" mb={2}>
                Auto Management
              </Heading>
              <Text color="gray.600">
                System automatically assigns players to courts and manages queue
              </Text>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} px={8}>
        <Container maxW="container.xl">
          <Box
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="xl"
            p={12}
            textAlign="center"
            color="white"
          >
            <Heading as="h2" size="xl" mb={4}>
              Ready to Get Started?
            </Heading>
            <Text fontSize="lg" mb={8} opacity={0.9}>
              Create your first badminton session or join an existing one
            </Text>
            <Stack
              direction={{ base: "column", sm: "row" }}
              gap={4}
              justify="center"
            >
              <IntlLink href="/host">
                <Button
                  size="lg"
                  bg="white"
                  color="purple.600"
                  _hover={{ bg: "gray.100" }}
                  px={8}
                >
                  {t('hostButton')} <Plus size={20} style={{ marginLeft: '8px' }} />
                </Button>
              </IntlLink>
              <IntlLink href="/join">
                <Button
                  size="lg"
                  variant="outline"
                  color="white"
                  borderColor="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  px={8}
                >
                  {t('joinButton')} <ArrowUpRight size={20} style={{ marginLeft: '8px' }} />
                </Button>
              </IntlLink>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Container>
  );
}
