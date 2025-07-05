"use client";

import React, { useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Input,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Hash,
  LogIn,
  Activity,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/chakra-compat";
import { SessionService, type Session } from "@/lib/api";
import { useTranslations } from 'next-intl';
import { Link as IntlLink } from '@/i18n/config';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function JoinPage() {
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  
  // Translations
  const t = useTranslations('pages.join');
  const common = useTranslations('common');
  const sessionT = useTranslations('session');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim()) {
      toast.error(sessionT('validation.sessionCodeRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const foundSession = await SessionService.getSession(sessionId);
      setSession(foundSession);
      toast.success("Session found! Redirecting...");
      
      // Redirect to the session page
      window.location.href = `/join/confirm?sessionId=${sessionId}`;
    } catch (error) {
      console.error("Error finding session:", error);
      toast.error("Session not found. Please check the session code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, white, green.50)">
      <Container maxW="4xl" py={8} px={4}>
        {/* Language Switcher */}
        <Flex justify="flex-end" mb={4}>
          <LanguageSwitcher />
        </Flex>

        {/* Header with back button */}
        <Flex align="center" mb={8}>
          <IntlLink href="/">
            <Button
              variant="outline"
              size="sm"
              mr={4}
              _hover={{ bg: "blue.50" }}
              transition="all 0.2s"
            >
              <ArrowLeft size={16} style={{ marginRight: "8px" }} />
              {common('back')}
            </Button>
          </IntlLink>
          <Box>
            <Heading
              size="2xl"
              bgGradient="linear(to-r, blue.600, green.600)"
              fontWeight="bold"
            >
              {t('title')}
            </Heading>
            <Text color="gray.600" mt={1}>
              {t('description')}
            </Text>
          </Box>
        </Flex>

        {/* Join Session Form */}
        <Box
          maxW="md"
          mx="auto"
          shadow="xl"
          bg="whiteAlpha.800"
          backdropFilter="blur(8px)"
          borderRadius="lg"
          overflow="hidden"
          p={8}
        >
          <Box textAlign="center" mb={6}>
            <Flex
              align="center"
              justify="center"
              w={16}
              h={16}
              bgGradient="linear(to-r, blue.500, green.500)"
              rounded="full"
              mb={4}
              shadow="lg"
              mx="auto"
            >
              <Users size={32} color="white" />
            </Flex>
            <Heading size="lg" color="gray.800" mb={2}>
              {t('enterCode')}
            </Heading>
            <Text color="gray.600">
              Enter the session code provided by the host
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack gap={6}>
              <Box>
                <Flex align="center" mb={3}>
                  <Hash
                    size={16}
                    color="#3182CE"
                    style={{ marginRight: "8px" }}
                  />
                  <Text fontWeight="semibold" color="gray.700">
                    {sessionT('sessionCode')} *
                  </Text>
                </Flex>
                <Input
                  id="sessionId"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter 6-digit session code"
                  size="lg"
                  borderWidth={2}
                  borderColor="gray.200"
                  _focus={{ borderColor: "blue.500" }}
                  transition="all 0.2s"
                  textAlign="center"
                  letterSpacing="wider"
                  fontSize="lg"
                  fontWeight="semibold"
                />
                <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                  Ask the host for the session code
                </Text>
              </Box>

              <Button
                type="submit"
                size="lg"
                width="full"
                bgGradient="linear(to-r, blue.500, green.500)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, blue.600, green.600)",
                  transform: "scale(1.02)",
                }}
                shadow="lg"
                _active={{ transform: "scale(0.98)" }}
                transition="all 0.3s"
                disabled={isLoading || !sessionId.trim()}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" mr={3} />
                    Finding Session...
                  </>
                ) : (
                  <>
                    <LogIn size={16} style={{ marginRight: "8px" }} />
                    {t('joinButton')}
                  </>
                )}
              </Button>
            </Stack>
          </form>

          {/* Session Found Display */}
          {session && (
            <Box
              mt={6}
              p={4}
              bg="green.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="green.200"
            >
              <Flex align="center" mb={2}>
                <Activity size={16} color="#38A169" style={{ marginRight: "8px" }} />
                <Text fontWeight="semibold" color="green.800">
                  Session Found!
                </Text>
              </Flex>
              <Text color="green.700" fontWeight="medium">
                {session.name}
              </Text>
              <Text fontSize="sm" color="green.600">
                {session.numberOfCourts} courts • {session.maxPlayersPerCourt} players per court
              </Text>
            </Box>
          )}
        </Box>

        {/* How to Join Section */}
        <Box mt={12} textAlign="center">
          <Heading size="md" mb={4} color="gray.800">
            How to Join a Session
          </Heading>
          <Stack direction={{ base: "column", md: "row" }} spacing={8} justify="center">
            <Box>
              <Box
                bg="blue.100"
                color="blue.600"
                w={12}
                h={12}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb={3}
                fontSize="lg"
                fontWeight="bold"
              >
                1
              </Box>
              <Text fontWeight="medium" color="gray.700">
                Get Session Code
              </Text>
              <Text fontSize="sm" color="gray.600">
                Ask the host for the 6-digit session code
              </Text>
            </Box>
            <Box>
              <Box
                bg="green.100"
                color="green.600"
                w={12}
                h={12}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb={3}
                fontSize="lg"
                fontWeight="bold"
              >
                2
              </Box>
              <Text fontWeight="medium" color="gray.700">
                Enter Code
              </Text>
              <Text fontSize="sm" color="gray.600">
                Enter the code in the field above
              </Text>
            </Box>
            <Box>
              <Box
                bg="purple.100"
                color="purple.600"
                w={12}
                h={12}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb={3}
                fontSize="lg"
                fontWeight="bold"
              >
                3
              </Box>
              <Text fontWeight="medium" color="gray.700">
                Start Playing
              </Text>
              <Text fontSize="sm" color="gray.600">
                Join the session and start playing!
              </Text>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
