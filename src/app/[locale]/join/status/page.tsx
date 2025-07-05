"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { ArrowLeft, Clock, CheckCircle2, User, Users } from "lucide-react";
import {
  PlayerService,
  SessionService,
  type Player,
  type Session,
  type Court,
  type Match,
} from "@/lib/api";
import { getCourtDisplayName } from "@/lib/api/sessions";
import BadmintonCourt from "@/components/court/BadmintonCourt";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Link as IntlLink } from "@/i18n/config";
import { Button } from "@/components/ui/chakra-compat";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

function StatusPageContent() {
  const searchParams = useSearchParams();
  const playerId = searchParams.get("playerId");

  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [queuePosition, setQueuePosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [currentCourt, setCurrentCourt] = useState<Court | null>(null);
  const [courtPlayers, setCourtPlayers] = useState<Player[]>([]);

  // Translations
  const t = useTranslations("pages.join.status");
  const common = useTranslations("common");
  const playerT = useTranslations("player");

  // Helper function to format elapsed time for match display
  const formatMatchElapsedTime = (startTime: Date): string => {
    const start = new Date(startTime);
    const elapsedMs = Date.now() - start.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);

    if (elapsedMinutes === 0) {
      return t("time.lessThanMinute");
    } else if (elapsedMinutes === 1) {
      return t("time.oneMinute");
    } else {
      return t("time.minutes", { count: elapsedMinutes });
    }
  };

  // Function to fetch player data
  const fetchPlayerData = async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      const playerData = await PlayerService.getPlayer(playerId);
      setPlayer(playerData);

      // Fetch session data
      if (playerData.sessionId) {
        const sessionData = await SessionService.getSession(
          playerData.sessionId
        );
        setSession(sessionData);

        // Calculate queue position if player is waiting
        if (playerData.status === "WAITING") {
          const waitingPlayers =
            sessionData.players?.filter((p) => p.status === "WAITING") || [];
          // Sort by current wait time (descending)
          const sortedPlayers = [...waitingPlayers].sort(
            (a, b) => b.currentWaitTime - a.currentWaitTime
          );
          const position =
            sortedPlayers.findIndex((p) => p.id === playerData.id) + 1;
          setQueuePosition(position);
        }

        // Get match and court info if player is playing
        if (playerData.status === "PLAYING" && playerData.currentCourtId) {
          const court = sessionData.courts?.find(
            (c) => c.id === playerData.currentCourtId
          );
          if (court) {
            setCurrentCourt(court);
            setCourtPlayers(court.currentPlayers || []);

            // Get the current match from the court
            if (court.currentMatch) {
              setCurrentMatch(court.currentMatch);
            }
          }
        } else {
          // Clear match and court info if not playing
          setCurrentMatch(null);
          setCurrentCourt(null);
          setCourtPlayers([]);
        }
      }
    } catch (error) {
      console.error("Error fetching player data:", error);
      toast.error(t("errors.loadFailed"));
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!playerId) {
      toast.error(t("errors.missingPlayerId"));
      return;
    }

    fetchPlayerData();
  }, [playerId, t]);

  // Set up auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshInterval((prev) => {
        if (prev <= 1) {
          fetchPlayerData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [playerId]);

  if (loading && !player) {
    return (
      <Container maxW="md" py={12}>
        <Flex justify="center" align="center" height="50vh" direction="column">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text>{common("loading")}</Text>
        </Flex>
      </Container>
    );
  }

  if (!player || !session) {
    return (
      <Container maxW="md" py={12}>
        <Flex justify="center" align="center" height="50vh" direction="column">
          <Box
            as="div"
            p={5}
            borderRadius="md"
            bg="red.50"
            color="red.500"
            mb={4}
            textAlign="center"
          >
            <Heading size="md" mb={2}>
              {t("errors.playerNotFound")}
            </Heading>
            <Text>{t("errors.playerNotFoundDescription")}</Text>
          </Box>
          <IntlLink href="/join">
            <Button colorScheme="blue">{t("errors.returnToJoin")}</Button>
          </IntlLink>
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={12}>
      {/* Language Switcher */}
      <Flex justify="flex-end" mb={4}>
        <LanguageSwitcher />
      </Flex>

      {/* Header */}
      <Box textAlign="center" mb={8}>
        <Heading
          size="lg"
          mb={2}
          bgGradient="linear(to-r, blue.400, teal.500)"
          bgClip="text"
        >
          {session.name}
        </Heading>
        <Text color="gray.500">
          {t("playerInfo", {
            number: player.playerNumber,
            name: player.name || "",
          })}
        </Text>
      </Box>

      <Box
        borderWidth="1px"
        borderRadius="lg"
        mb={6}
        overflow="hidden"
        boxShadow="md"
        transition="all 0.2s"
        _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
      >
        {/* Card Header */}
        <Box
          p={4}
          pb={2}
          borderBottomWidth="1px"
          borderBottomColor="gray.100"
          _dark={{ borderBottomColor: "gray.700" }}
        >
          <Flex align="center">
            <Box as={User} boxSize={5} color="blue.500" mr={2} />
            <Box>
              <Heading size="md">{t("yourStatus")}</Heading>
              <Text color="gray.500" fontSize="sm">
                {t("statusDescription")}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Card Body */}
        <Box p={4}>
          <Stack gap={4}>
            <Box
              bg="gray.100"
              _dark={{ bg: "gray.700" }}
              p={4}
              borderRadius="md"
              textAlign="center"
              transition="all 0.2s"
              _hover={{ transform: "translateY(-2px)", boxShadow: "sm" }}
            >
              {player.status === "WAITING" ? (
                <>
                  <Center mb={2}>
                    <Clock size={32} color="var(--chakra-colors-blue-500)" />
                  </Center>
                  <Heading size="sm" fontWeight="medium">
                    {t("status.waiting.title")}
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    {t("status.waiting.description")}
                  </Text>
                </>
              ) : player.status === "PLAYING" ? (
                <>
                  <Center mb={2}>
                    <CheckCircle2
                      size={32}
                      color="var(--chakra-colors-green-500)"
                    />
                  </Center>
                  <Heading size="sm" fontWeight="medium">
                    {t("status.playing.title")}
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    {t("status.playing.description", {
                      courtNumber:
                        player.currentCourt?.courtNumber || "Unknown",
                    })}
                  </Text>
                </>
              ) : (
                <>
                  <Center mb={2}>
                    <CheckCircle2
                      size={32}
                      color="var(--chakra-colors-gray-500)"
                    />
                  </Center>
                  <Heading size="sm" fontWeight="medium">
                    {t("status.finished.title")}
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    {t("status.finished.description")}
                  </Text>
                </>
              )}
            </Box>

            {/* Court Visual - Only show when player is playing */}
            {player.status === "PLAYING" &&
              currentCourt &&
              courtPlayers.length > 0 && (
                <Box
                  borderWidth="1px"
                  p={4}
                  borderRadius="md"
                  bg="white"
                  _dark={{ bg: "gray.800" }}
                  boxShadow="sm"
                  transition="all 0.2s"
                  _hover={{ boxShadow: "md" }}
                >
                  <Flex justify="space-between" align="center" mb={3}>
                    <Heading size="sm" color="green.600">
                      {t("court.title", { number: currentCourt.courtNumber })}
                    </Heading>
                    {currentMatch && (
                      <Text fontSize="sm" color="gray.500">
                        {t("court.elapsed", {
                          time: formatMatchElapsedTime(currentMatch.startTime),
                        })}
                      </Text>
                    )}
                  </Flex>
                  <BadmintonCourt
                    players={courtPlayers.map((p) => ({
                      ...p,
                      isCurrentPlayer: p.id === player.id,
                    }))}
                    isActive={true}
                    elapsedTime={
                      currentMatch
                        ? formatMatchElapsedTime(currentMatch.startTime)
                        : undefined
                    }
                    courtName={getCourtDisplayName(
                      currentCourt?.courtName,
                      currentCourt?.courtNumber
                    )}
                    width="100%"
                    height="200px"
                    showTimeInCenter={true}
                  />
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mt={2}
                    textAlign="center"
                  >
                    {t("court.playerHighlight")}
                  </Text>
                  {courtPlayers.length > 0 && (
                    <Box mt={2}>
                      <Text
                        fontSize="xs"
                        color="gray.600"
                        textAlign="center"
                        mb={1}
                      >
                        {t("court.playingWith")}
                      </Text>
                      <Flex justify="center" wrap="wrap" gap={2}>
                        {courtPlayers
                          .filter((p) => p.id !== player.id)
                          .map((p) => (
                            <Text
                              key={p.id}
                              fontSize="xs"
                              color="gray.500"
                              bg="gray.50"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              #{p.playerNumber}{" "}
                              {p.name?.split(" ")[0] || `P${p.playerNumber}`}
                            </Text>
                          ))}
                      </Flex>
                    </Box>
                  )}
                </Box>
              )}

            <Flex gap={4}>
              <Box
                borderWidth="1px"
                p={3}
                borderRadius="md"
                textAlign="center"
                flex={1}
                transition="all 0.2s"
                _hover={{
                  borderColor: "blue.200",
                  bg: "blue.50",
                  transform: "translateY(-2px)",
                }}
                _dark={{ _hover: { bg: "blue.900", borderColor: "blue.700" } }}
              >
                <Center mb={1}>
                  <Clock size={16} color="var(--chakra-colors-gray-500)" />
                </Center>
                <Text fontSize="xl" fontWeight="semibold">
                  {player.currentWaitTime} {t("stats.minutes")}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {t("stats.currentWait")}
                </Text>
              </Box>

              <Box
                borderWidth="1px"
                p={3}
                borderRadius="md"
                textAlign="center"
                flex={1}
                transition="all 0.2s"
                _hover={{
                  borderColor: "blue.200",
                  bg: "blue.50",
                  transform: "translateY(-2px)",
                }}
                _dark={{ _hover: { bg: "blue.900", borderColor: "blue.700" } }}
              >
                <Center mb={1}>
                  <Users size={16} color="var(--chakra-colors-gray-500)" />
                </Center>
                <Text fontSize="xl" fontWeight="semibold">
                  {player.matchesPlayed}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {t("stats.matchesPlayed")}
                </Text>
              </Box>
            </Flex>

            {player.status === "WAITING" && (
              <Box
                borderWidth="1px"
                p={4}
                borderRadius="md"
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ borderColor: "blue.200", boxShadow: "md" }}
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    {t("queue.title")}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {t("queue.updated", {
                      time: lastRefreshed.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    })}
                  </Text>
                </Flex>
                <Flex align="center">
                  <Box
                    flex={1}
                    mr={2}
                    h="8px"
                    bg="gray.200"
                    borderRadius="full"
                    overflow="hidden"
                    _dark={{ bg: "gray.700" }}
                  >
                    <Box
                      h="100%"
                      w={`${Math.max(0, 100 - queuePosition * 10)}%`}
                      bg="blue.500"
                      borderRadius="full"
                    />
                  </Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    width="24px"
                    textAlign="center"
                  >
                    #{queuePosition || "?"}
                  </Text>
                </Flex>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {t("queue.autoRefresh", { seconds: refreshInterval })}
                </Text>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Card Footer */}
        <Box p={4} borderTopWidth="1px" textAlign="center">
          <Text fontSize="xs" color="gray.500">
            {t("footer")}
          </Text>
        </Box>
      </Box>

      <Center>
        <IntlLink href="/">
          <Button
            variant="outline"
            borderRadius="full"
            transition="all 0.2s"
            _hover={{
              bg: "blue.50",
              borderColor: "blue.300",
              transform: "translateY(-2px)",
              boxShadow: "sm",
            }}
          >
            <Flex align="center">
              <Box as={ArrowLeft} boxSize={4} mr={2} />
              {common("backToHome")}
            </Flex>
          </Button>
        </IntlLink>
      </Center>
    </Container>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <StatusPageContent />
    </Suspense>
  );
}
