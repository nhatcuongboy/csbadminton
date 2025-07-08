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
import { NextLinkButton } from "@/components/ui/NextLinkButton";
import { SessionService, type Session } from "@/lib/api";
import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import { useRouter } from "@/i18n/config";

export default function JoinPage() {
  const t = useTranslations("pages.join");
  const common = useTranslations("common");
  const router = useRouter();
  
  const [sessionId, setSessionId] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [existingPlayers, setExistingPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  // Fetch available sessions on component mount
  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoadingSessions(true);
        const sessionsData = await SessionService.getAllSessions();
        const availableSessions = sessionsData.filter(
          (session) =>
            session.status === "PREPARING" || session.status === "IN_PROGRESS"
        );
        setSessions(availableSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error("Failed to load available sessions");
      } finally {
        setLoadingSessions(false);
      }
    }

    fetchSessions();
  }, []);

  // Handle session selection change
  const handleSessionChange = async (e: any) => {
    const selectedId = e.target.value;
    setSessionId(selectedId);
    setPlayerNumber("");
    setSelectedPlayer(null);

    if (!selectedId) {
      setSelectedSession(null);
      setExistingPlayers([]);
      return;
    }

    try {
      setLoading(true);
      const sessionData = await SessionService.getSession(selectedId);
      setSelectedSession(sessionData);
      const players = sessionData.players || [];
      const availablePlayers = players.filter(
        (p) => p.preFilledByHost && !p.confirmedByPlayer
      );
      setExistingPlayers(availablePlayers);
    } catch (error) {
      console.error("Error fetching session details:", error);
      toast.error("Failed to load session details");
    } finally {
      setLoading(false);
    }
  };

  // Handle player selection
  const handlePlayerChange = (e: any) => {
    const selectedPlayerNumber = e.target.value;
    setPlayerNumber(selectedPlayerNumber);

    if (!selectedPlayerNumber) {
      setSelectedPlayer(null);
      return;
    }

    const player = existingPlayers.find(
      (p) => p.playerNumber.toString() === selectedPlayerNumber
    );
    setSelectedPlayer(player || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionId || !playerNumber || !selectedPlayer) {
      toast.error(t("errors.missingFields"));
      return;
    }

    setIsSubmitting(true);

    try {
      router.push(`/join/confirm?sessionId=${sessionId}&playerNumber=${playerNumber}&playerId=${selectedPlayer.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh">
      {/* Top Bar */}
      <TopBar showBackButton={true} backHref="/" title="Join Session" />

      <Container maxW="md" py={12} pt={24}>
        <Box
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
          borderWidth="1px"
          bg="white"
          _dark={{ bg: "gray.800" }}
          transition="all 0.2s"
          _hover={{
            transform: "translateY(-3px)",
            boxShadow: "xl",
          }}
          position="relative"
        >
          {/* Decorative element */}
          <Box
            position="absolute"
            top={-3}
            right={-3}
            boxSize={16}
            bg="blue.400"
            borderRadius="full"
            opacity={0.2}
            zIndex={0}
          />
          
          <Box
            bg="blue.50"
            _dark={{ bg: "blue.900" }}
            borderBottomWidth="1px"
            px={6}
            py={5}
            position="relative"
            zIndex={1}
          >
            <Flex align="center" mb={2}>
              <Box as={LogIn} boxSize={5} color="blue.500" mr={2} />
              <Heading size="md">Join Badminton Session</Heading>
            </Flex>
            <Text color="gray.500" fontSize="sm">
              Choose your session and select your player information
            </Text>
          </Box>

          <Box p={6} position="relative" zIndex={1}>
            <form onSubmit={handleSubmit}>
              <Stack gap={6}>
                <Box>
                  <Box mb={2}>
                    <Flex align="center">
                      <Box as={Hash} boxSize={4} color="blue.500" mr={2} />
                      <Text fontWeight="medium">
                        Select Session
                        <Box as="span" color="red.500">*</Box>
                      </Text>
                    </Flex>
                  </Box>
                  {loadingSessions ? (
                    <Flex justify="center" py={4}>
                      <Spinner color="blue.500" />
                    </Flex>
                  ) : (
                    <select
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        borderWidth: "1px",
                        borderColor: "#CBD5E0",
                      }}
                      value={sessionId}
                      onChange={handleSessionChange}
                      required
                    >
                      <option value="">Select available session</option>
                      {sessions.length === 0 ? (
                        <option disabled>No available sessions</option>
                      ) : (
                        sessions.map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.name} (
                            {session.status === "PREPARING"
                              ? "Upcoming"
                              : "In Progress"}
                            )
                          </option>
                        ))
                      )}
                    </select>
                  )}
                  {selectedSession && (
                    <Box mt={2} p={2} bg="blue.50" borderRadius="md">
                      <Text fontSize="sm" color="blue.600">
                        Host: {selectedSession.host.name} | Courts:{" "}
                        {selectedSession.numberOfCourts} | Players:{" "}
                        {selectedSession.players?.length || 0}
                      </Text>
                    </Box>
                  )}
                </Box>

                <Box>
                  <Box mb={2}>
                    <Flex align="center">
                      <Box as={Users} boxSize={4} color="blue.500" mr={2} />
                      <Text fontWeight="medium">
                        Player Number
                        <Box as="span" color="red.500">*</Box>
                      </Text>
                    </Flex>
                  </Box>
                  {loading ? (
                    <Flex justify="center" py={4}>
                      <Spinner color="blue.500" />
                    </Flex>
                  ) : (
                    <>
                      {selectedSession ? (
                        existingPlayers.length > 0 ? (
                          <select
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "8px",
                              borderWidth: "1px",
                              borderColor: "#CBD5E0",
                            }}
                            value={playerNumber}
                            onChange={handlePlayerChange}
                            required
                          >
                            <option value="">Select your player number</option>
                            {existingPlayers.map((player) => (
                              <option key={player.id} value={player.playerNumber}>
                                Player #{player.playerNumber}{" "}
                                {player.name ? `(${player.name})` : ""}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Box
                            p={3}
                            bg="yellow.50"
                            color="yellow.700"
                            borderRadius="md"
                          >
                            <Text>
                              No pre-filled players available in this session.
                              Please ask the host to add you first.
                            </Text>
                          </Box>
                        )
                      ) : (
                        <Input
                          placeholder="Please select a session first"
                          disabled
                          borderColor="gray.300"
                          size="lg"
                          borderRadius="md"
                        />
                      )}
                      
                      {/* Player info preview */}
                      {selectedPlayer && (
                        <Box mt={3} p={3} bg="blue.50" borderRadius="md">
                          <Text fontWeight="medium" mb={1}>
                            Player Information:
                          </Text>
                          <Stack gap={1} fontSize="sm">
                            <Text>
                              Number:{" "}
                              <strong>#{selectedPlayer.playerNumber}</strong>
                            </Text>
                            {selectedPlayer.name && (
                              <Text>
                                Name: <strong>{selectedPlayer.name}</strong>
                              </Text>
                            )}
                            {selectedPlayer.gender && (
                              <Text>
                                Gender:{" "}
                                <strong>
                                  {selectedPlayer.gender === "MALE"
                                    ? "Male"
                                    : "Female"}
                                </strong>
                              </Text>
                            )}
                            {selectedPlayer.level && (
                              <Text>
                                Level:{" "}
                                <strong>
                                  {selectedPlayer.level.replace("_", " ")}
                                </strong>
                              </Text>
                            )}
                            {selectedPlayer.phone && (
                              <Text>
                                Phone: <strong>{selectedPlayer.phone}</strong>
                              </Text>
                            )}
                          </Stack>
                        </Box>
                      )}
                    </>
                  )}
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Select your player number from the list of pre-filled players
                  </Text>
                </Box>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  mt={4}
                  loading={isSubmitting}
                  disabled={!sessionId || !playerNumber || isSubmitting}
                >
                  <Flex align="center" justify="center" width="100%">
                    {isSubmitting ? "Connecting..." : "Continue"}
                    {!isSubmitting && <Box as={ArrowRight} ml={2} boxSize={5} />}
                  </Flex>
                </Button>
              </Stack>
            </form>
          </Box>

          <Box
            bg="gray.50"
            _dark={{ bg: "gray.700" }}
            borderTopWidth="1px"
            p={6}
            display="flex"
            justifyContent="center"
            position="relative"
            zIndex={1}
          >
            <Flex direction="column" align="center">
              <Text fontSize="sm" color="gray.500" textAlign="center">
                The host must add you to the session before you can join
              </Text>
              <Box
                as={Activity}
                boxSize={4}
                color="blue.400"
                mt={2}
                opacity={0.7}
                transform="rotate(0deg)"
                transition="all 0.3s ease-in-out"
                _hover={{
                  opacity: 1,
                  transform: "rotate(30deg) scale(1.2)",
                }}
              />
            </Flex>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
