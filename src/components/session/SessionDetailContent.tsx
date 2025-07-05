"use client";

import {
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  //   Tab,
  //   TabList,
  //   TabPanel,
  //   TabPanels,
  //   Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import {
  TabsComp as Tabs,
  Tab,
  TabPanel,
  TabPanels,
} from "@/components/ui/chakra-compat";
import { useCallback, useEffect, useState } from "react";

// Import compatibility components
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  IconButton,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
} from "@/components/ui/chakra-compat";
import { NextLinkButton } from "@/components/ui/NextLinkButton";
import {
  formatDuration,
  formatTime,
  getCourtDisplayName,
} from "@/lib/api/sessions";
import BulkPlayersForm from "@/components/player/BulkPlayersForm";
import SessionManagement from "@/components/session/SessionManagement";
import BadmintonCourt from "@/components/court/BadmintonCourt";
import {
  ArrowLeft,
  Clock,
  Play,
  Plus,
  RefreshCw,
  Shuffle,
  Square,
  Users,
} from "lucide-react";

// Types for session data and related entities
interface Player {
  id: string;
  playerNumber: number;
  name: string;
  gender?: string;
  level?: string;
  status: string;
  currentWaitTime: number;
  totalWaitTime: number;
  matchesPlayed: number;
  currentCourtId?: string;
  preFilledByHost: boolean;
  confirmedByPlayer: boolean;
}

interface Court {
  id: string;
  courtNumber: number;
  courtName?: string;
  status: string;
  currentMatchId?: string;
  currentPlayers: Player[];
}

interface MatchPlayer {
  id: string;
  matchId: string;
  playerId: string;
  position: number;
  player: Player;
}

interface Match {
  id: string;
  status: string;
  courtId: string;
  startTime: string;
  endTime?: string;
  players: MatchPlayer[];
}

interface SessionData {
  id: string;
  name: string;
  hostId: string;
  host: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  startTime: string | null;
  endTime: string | null;
  numberOfCourts: number;
  sessionDuration: number;
  maxPlayersPerCourt: number;
  requirePlayerInfo: boolean;
  players: Player[];
  courts: Court[];
  matches: Match[];
  waitingQueue?: Player[];
}

// Component hiển thị chi tiết session
export default function SessionDetailContent({
  sessionData,
}: {
  sessionData: SessionData;
}) {
  const [session, setSession] = useState<SessionData>(sessionData);
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [matchMode, setMatchMode] = useState<"auto" | "manual">("auto");
  const [showMatchCreation, setShowMatchCreation] = useState<boolean>(false);
  const toast = useToast();
  const playerModalDisclosure = useDisclosure();
  const courtModalDisclosure = useDisclosure();
  const matchModalDisclosure = useDisclosure();

  // Get waiting players (players with status WAITING)
  const waitingPlayers = session.players
    .filter((player) => player.status === "WAITING")
    .sort((a, b) => b.currentWaitTime - a.currentWaitTime);

  // Get active courts (with current matches)
  const activeCourts = session.courts.filter(
    (court) => court.status === "IN_USE"
  );

  // Get completed matches
  const completedMatches =
    session.matches
      ?.filter((match) => match.status === "FINISHED")
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ) ?? [];

  // Helper function to calculate elapsed time
  const calculateElapsedTime = (startTime: string): string => {
    const start = new Date(startTime);
    const elapsedMs = currentTime.getTime() - start.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);

    if (elapsedMinutes === 0) {
      return `${elapsedSeconds}s`;
    } else {
      return `${elapsedMinutes}m ${elapsedSeconds}s`;
    }
  };

  // Helper function to format elapsed time for court display (more readable)
  const formatCourtElapsedTime = (startTime: string): string => {
    const start = new Date(startTime);
    const elapsedMs = currentTime.getTime() - start.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);

    if (elapsedMinutes === 0) {
      return "< 1 phút";
    } else if (elapsedMinutes === 1) {
      return "1 phút";
    } else {
      return `${elapsedMinutes} phút`;
    }
  };

  // Helper function to get current match for a court
  const getCurrentMatch = (courtId: string): Match | null => {
    // First try to find by courtId and status
    let match = session.matches?.find(
      (match) => match.courtId === courtId && match.status === "IN_PROGRESS"
    );

    // If not found, try to find by currentMatchId from court
    if (!match) {
      const courtData = session.courts.find((c) => c.id === courtId);
      if (courtData?.currentMatchId) {
        match = session.matches?.find(
          (match) => match.id === courtData.currentMatchId
        );
      }
    }

    return match || null;
  };

  // Function to refresh session data
  const refreshSessionData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (result.success) {
        setSession(result.data);
        setLastRefreshed(new Date());
      } else {
        console.error("Failed to refresh session data:", result.message);
      }
    } catch (error) {
      console.error("Error refreshing session data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [session.id]);

  // Setup auto-refresh when session is in progress
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (session.status === "IN_PROGRESS" && refreshInterval > 0) {
      intervalId = setInterval(refreshSessionData, refreshInterval * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [session.status, refreshInterval, refreshSessionData]);

  // Update current time every second for elapsed time calculations
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Toggle session status (Start/End session)
  const toggleSessionStatus = async () => {
    try {
      // Xác định trạng thái tiếp theo
      let nextStatus = session.status;
      if (session.status === "PREPARING") {
        nextStatus = "IN_PROGRESS";
      } else if (session.status === "IN_PROGRESS") {
        nextStatus = "FINISHED";
      } else {
        return; // Không thay đổi nếu đã FINISHED
      }

      // Gọi API cập nhật trạng thái
      const response = await fetch(`/api/sessions/${session.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const result = await response.json();

      if (result.success) {
        // Cập nhật state với dữ liệu mới từ server
        setSession((prev) => ({
          ...prev,
          status: result.data.status,
          startTime: result.data.startTime,
          endTime: result.data.endTime,
        }));

        toast.toast({
          title:
            nextStatus === "IN_PROGRESS" ? "Session started" : "Session ended",
          status: "success",
          duration: 3000,
        });
      } else {
        console.error("Failed to update session status:", result.message);
        toast.toast({
          title: "Failed to update session status",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating session status:", error);
      toast.toast({
        title: "Error updating session status",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Map session status to UI text
  const mapSessionStatusToUI = (status: string) => {
    switch (status) {
      case "PREPARING":
        return "Start Session";
      case "IN_PROGRESS":
        return "End Session";
      case "FINISHED":
        return "Session Ended";
      default:
        return "Unknown Status";
    }
  };

  // Map session status to color scheme
  const mapSessionStatusToColor = (status: string) => {
    switch (status) {
      case "PREPARING":
        return "green";
      case "IN_PROGRESS":
        return "red";
      case "FINISHED":
        return "gray";
      default:
        return "blue";
    }
  };

  // Format wait time to display in mm:ss format
  const formatWaitTime = (waitTimeInMinutes: number) => {
    const hours = Math.floor(waitTimeInMinutes / 60);
    const minutes = waitTimeInMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes} min`;
  };

  // Start a new match with selected players on selected court
  const startNewMatch = async () => {
    if (selectedPlayers.length !== 4 || !selectedCourt) {
      toast.toast({
        title: "Please select 4 players and a court",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${session.id}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courtId: selectedCourt,
          playerIds: selectedPlayers,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Clear selections and refresh data
        setSelectedPlayers([]);
        setSelectedCourt(null);
        await refreshSessionData();

        toast.toast({
          title: "Match started successfully",
          status: "success",
          duration: 3000,
        });

        matchModalDisclosure.onClose();
      } else {
        console.error("Failed to start match:", result.message);
        toast.toast({
          title: "Failed to start match",
          description: result.message,
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error starting match:", error);
      toast.toast({
        title: "Error starting match",
        status: "error",
        duration: 3000,
      });
    }
  };

  // End a match
  const endMatch = async (matchId: string) => {
    try {
      const response = await fetch(
        `/api/sessions/${session.id}/matches/${matchId}/end`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        await refreshSessionData();

        toast.toast({
          title: "Match ended successfully",
          status: "success",
          duration: 3000,
        });
      } else {
        console.error("Failed to end match:", result.message);
        toast.toast({
          title: "Failed to end match",
          description: result.message,
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error ending match:", error);
      toast.toast({
        title: "Error ending match",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Auto-assign players to a specific court
  const autoAssignPlayersToSpecificCourt = async (courtId: string) => {
    try {
      // Check if we have enough waiting players
      if (waitingPlayers.length < 4) {
        toast.toast({
          title: "Not enough players",
          description: "Need at least 4 waiting players to start a match",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Select the top 4 waiting players (those with longest wait time)
      const selectedPlayerIds = waitingPlayers.slice(0, 4).map((p) => p.id);

      // First, assign players to the court
      const selectResponse = await fetch(
        `/api/courts/${courtId}/select-players`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerIds: selectedPlayerIds,
          }),
        }
      );

      const selectResult = await selectResponse.json();

      if (!selectResult.success) {
        console.error("Failed to select players:", selectResult.message);
        toast.toast({
          title: "Failed to select players",
          description: selectResult.message,
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Then, start the match
      const startResponse = await fetch(`/api/courts/${courtId}/start-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const startResult = await startResponse.json();

      if (startResult.success) {
        await refreshSessionData();

        toast.toast({
          title: "Match started successfully",
          description: "4 players have been auto-assigned to the court",
          status: "success",
          duration: 3000,
        });
      } else {
        console.error("Failed to start match:", startResult.message);
        toast.toast({
          title: "Failed to start match",
          description: startResult.message,
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error auto-assigning players:", error);
      toast.toast({
        title: "Error auto-assigning players",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Auto-assign players to empty courts
  const autoAssignPlayers = async () => {
    try {
      const response = await fetch(`/api/sessions/${session.id}/auto-assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        await refreshSessionData();

        toast.toast({
          title: "Players auto-assigned successfully",
          status: "success",
          duration: 3000,
        });
      } else {
        console.error("Failed to auto-assign players:", result.message);
        toast.toast({
          title: "Failed to auto-assign players",
          description: result.message,
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error auto-assigning players:", error);
      toast.toast({
        title: "Error auto-assigning players",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Toggle player selection for new match
  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
    } else {
      if (selectedPlayers.length < 4) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      }
    }
  };

  // Start manual match creation for a court
  const startManualMatchCreation = (courtId: string) => {
    setSelectedCourt(courtId);
    setMatchMode("manual");
    setShowMatchCreation(true);
    setSelectedPlayers([]);
  };

  // Cancel match creation
  const cancelMatchCreation = () => {
    setSelectedCourt(null);
    setMatchMode("auto");
    setShowMatchCreation(false);
    setSelectedPlayers([]);
  };

  // Confirm manual match creation
  const confirmManualMatch = async () => {
    if (selectedPlayers.length !== 4 || !selectedCourt) {
      toast.toast({
        title: "Please select exactly 4 players",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${session.id}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courtId: selectedCourt,
          playerIds: selectedPlayers,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Clear selections and refresh data
        cancelMatchCreation();
        await refreshSessionData();

        toast.toast({
          title: "Match started successfully",
          status: "success",
          duration: 3000,
        });
      } else {
        console.error("Failed to start match:", result.message);
        toast.toast({
          title: "Failed to start match",
          description: result.message,
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error starting match:", error);
      toast.toast({
        title: "Error starting match",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      {/* Header with back button */}
      <Flex alignItems="center" justify="space-between" mb={8}>
        <Flex alignItems="center">
          <NextLinkButton
            href="/host"
            variant="outline"
            size="sm"
            mr={4}
            borderRadius="full"
            transition="all 0.2s"
            _hover={{
              bg: "blue.50",
              borderColor: "blue.300",
              transform: "translateY(-2px)",
              boxShadow: "sm",
            }}
          >
            <Flex alignItems="center">
              <Box as={ArrowLeft} boxSize={4} mr={2} />
              Back
            </Flex>
          </NextLinkButton>
          <Heading size="lg">{session.name}</Heading>
        </Flex>

        <Button
          colorScheme={mapSessionStatusToColor(session.status)}
          onClick={toggleSessionStatus}
          disabled={session.status === "FINISHED"}
        >
          <Flex alignItems="center">
            <Box
              as={session.status === "IN_PROGRESS" ? Square : Play}
              boxSize={4}
              mr={2}
            />
            {mapSessionStatusToUI(session.status)}
          </Flex>
        </Button>
      </Flex>

      {/* Session Status Cards */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
        gap={6}
        mb={8}
      >
        <Box
          p={6}
          bg="white"
          _dark={{ bg: "gray.800" }}
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
        >
          <Flex align="center" mb={2}>
            <Box as={Clock} boxSize={5} color="blue.500" mr={2} />
            <Heading size="md">Session Time</Heading>
          </Flex>
          <Text fontSize="lg">
            {session.status === "PREPARING"
              ? "Not started yet"
              : session.status === "IN_PROGRESS"
              ? `Started ${formatTime(session.startTime!)}`
              : `Ended (Duration: ${formatDuration(
                  session.startTime!,
                  session.endTime!
                )})`}
          </Text>
        </Box>

        <Box
          p={6}
          bg="white"
          _dark={{ bg: "gray.800" }}
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
        >
          <Flex align="center" mb={2}>
            <Box as={Users} boxSize={5} color="blue.500" mr={2} />
            <Heading size="md">Players</Heading>
          </Flex>
          <Text fontSize="lg">{session.players.length} total players</Text>
          <Text fontSize="sm" color="gray.500">
            {session.players.filter((p) => p.status === "PLAYING").length}{" "}
            playing /
            {session.players.filter((p) => p.status === "WAITING").length}{" "}
            waiting
          </Text>
        </Box>

        <Box
          p={6}
          bg="white"
          _dark={{ bg: "gray.800" }}
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
        >
          <Flex align="center" mb={2} justifyContent="space-between">
            <Flex>
              <Box as={RefreshCw} boxSize={5} color="blue.500" mr={2} />
              <Heading size="md">Updates</Heading>
            </Flex>
            {session.status === "IN_PROGRESS" && (
              <IconButton
                aria-label="Refresh"
                icon={<Box as={RefreshCw} boxSize={4} />}
                size="sm"
                isLoading={isRefreshing}
                onClick={refreshSessionData}
              />
            )}
          </Flex>
          <Text fontSize="lg">
            {session.status === "IN_PROGRESS"
              ? `Auto-refresh: ${refreshInterval}s`
              : "Auto-refresh disabled"}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </Text>
        </Box>
      </Grid>

      {/* Main tabs content */}
      <Box
        p={6}
        bg="white"
        _dark={{ bg: "gray.800" }}
        borderRadius="lg"
        boxShadow="md"
        borderWidth="1px"
      >
        <Tabs
          index={activeTab}
          onChange={(index: number) => setActiveTab(index)}
        >
          <Tab flex="1" textAlign="center">
            Active Courts ({activeCourts.length})
          </Tab>
          <Tab flex="1" textAlign="center">
            Match History ({completedMatches.length})
          </Tab>
          <Tab flex="1" textAlign="center">
            All Players ({session.players.length})
          </Tab>
          <Tab flex="1" textAlign="center">
            Bulk Add Players
          </Tab>
          <Tab flex="1" textAlign="center">
            Management
          </Tab>

          <TabPanels>
            {/* Tab 1: Active Courts */}
            <TabPanel>
              <Flex justifyContent="space-between" mb={4}>
                <Heading size="md">Active Courts</Heading>

                {session.status === "IN_PROGRESS" && (
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      leftIcon={<Box as={Plus} boxSize={4} />}
                      onClick={() => {
                        if (!showMatchCreation) {
                          setShowMatchCreation(true);
                          setMatchMode("manual");
                          setSelectedPlayers([]);
                        } else {
                          cancelMatchCreation();
                        }
                      }}
                      colorScheme={showMatchCreation ? "red" : "blue"}
                      variant={showMatchCreation ? "outline" : "solid"}
                    >
                      {showMatchCreation ? "Cancel" : "New Match"}
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<Box as={Shuffle} boxSize={4} />}
                      onClick={autoAssignPlayers}
                    >
                      Auto Assign
                    </Button>
                  </HStack>
                )}
              </Flex>

              {session.status !== "IN_PROGRESS" && (
                <Text fontSize="lg" color="gray.500" textAlign="center" mt={4}>
                  {session.status === "PREPARING"
                    ? "Start the session to begin matches"
                    : "Session has ended"}
                </Text>
              )}

              {session.status === "IN_PROGRESS" &&
                activeCourts.length === 0 && (
                  <Text
                    fontSize="lg"
                    color="gray.500"
                    textAlign="center"
                    mt={4}
                  >
                    No active courts. Create a new match to start playing.
                  </Text>
                )}

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={4}>
                {session.courts.map((court) => {
                  const currentMatch = getCurrentMatch(court.id);
                  const isActive = court.status === "IN_USE";

                  return (
                    <Card key={court.id} variant="outline">
                      <CardHeader
                        bg={isActive ? "green.50" : "gray.50"}
                        p={4}
                        borderBottom="1px"
                        borderColor={isActive ? "green.200" : "gray.200"}
                      >
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Heading
                            size="md"
                            color={isActive ? "green.700" : "gray.700"}
                          >
                            Court {court.courtNumber}
                          </Heading>
                          <HStack spacing={2}>
                            {currentMatch && (
                              <Badge
                                colorScheme="blue"
                                variant="solid"
                                display="flex"
                                alignItems="center"
                                gap={1}
                              >
                                <Clock size={12} />
                                {calculateElapsedTime(currentMatch.startTime)}
                              </Badge>
                            )}
                            <Badge
                              colorScheme={isActive ? "green" : "gray"}
                              variant={isActive ? "solid" : "outline"}
                            >
                              {isActive ? "IN USE" : "EMPTY"}
                            </Badge>
                          </HStack>
                        </Flex>
                      </CardHeader>
                      <CardBody p={4}>
                        {isActive && court.currentPlayers.length > 0 ? (
                          <VStack spacing={4}>
                            {/* Court Visual */}
                            <BadmintonCourt
                              players={court.currentPlayers}
                              isActive={isActive}
                              elapsedTime={
                                currentMatch
                                  ? formatCourtElapsedTime(
                                      currentMatch.startTime
                                    )
                                  : "Playing..."
                              }
                              courtName={getCourtDisplayName(
                                court.courtName,
                                court.courtNumber
                              )}
                              width="100%"
                              height="180px"
                              showTimeInCenter={true}
                            />

                            {/* Player details below court */}
                            <VStack spacing={2} width="100%">
                              {/* <Text
                                fontSize="sm"
                                fontWeight="medium"
                                color="gray.700"
                              >
                                Current Players
                              </Text> */}
                              {/* <SimpleGrid columns={2} spacing={2} width="100%">
                                {court.currentPlayers.map((player) => (
                                  <Box
                                    key={player.id}
                                    p={2}
                                    bg="gray.50"
                                    borderRadius="md"
                                    textAlign="center"
                                  >
                                    <Text fontSize="xs" fontWeight="bold">
                                      #{player.playerNumber}
                                    </Text>
                                    <Text
                                      fontSize="xs"
                                      overflow="hidden"
                                      textOverflow="ellipsis"
                                      whiteSpace="nowrap"
                                    >
                                      {player.name ||
                                        `Player ${player.playerNumber}`}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {player.level}{" "}
                                      {player.gender === "MALE" ? "♂" : "♀"}
                                    </Text>
                                  </Box>
                                ))}
                              </SimpleGrid> */}

                              {session.status === "IN_PROGRESS" && (
                                <Button
                                  width="full"
                                  colorScheme="red"
                                  size="sm"
                                  leftIcon={<Box as={Square} boxSize={4} />}
                                  onClick={() =>
                                    endMatch(court.currentMatchId!)
                                  }
                                >
                                  End Match
                                </Button>
                              )}
                            </VStack>
                          </VStack>
                        ) : (
                          <VStack
                            spacing={4}
                            align="center"
                            justify="center"
                            minH="200px"
                          >
                            {/* Empty court visual */}
                            <BadmintonCourt
                              players={[]}
                              isActive={false}
                              courtName={getCourtDisplayName(
                                court.courtName,
                                court.courtNumber
                              )}
                              width="100%"
                              //   height="120px"
                              height="180px"
                              showTimeInCenter={false}
                            />

                            {session.status === "IN_PROGRESS" && (
                              <VStack spacing={2}>
                                <Button
                                  colorScheme="green"
                                  leftIcon={<Box as={Shuffle} boxSize={4} />}
                                  onClick={() =>
                                    autoAssignPlayersToSpecificCourt(court.id)
                                  }
                                  size="sm"
                                  width="full"
                                >
                                  Auto Assign Match
                                </Button>
                                <Button
                                  colorScheme="blue"
                                  leftIcon={<Box as={Plus} boxSize={4} />}
                                  onClick={() =>
                                    startManualMatchCreation(court.id)
                                  }
                                  size="sm"
                                  width="full"
                                  variant="outline"
                                >
                                  Manual Selection
                                </Button>
                              </VStack>
                            )}
                          </VStack>
                        )}
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>

              {/* Waiting Players Section */}
              {waitingPlayers.length > 0 && (
                <Box mt={8}>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={4}
                  >
                    <Heading size="md">
                      Waiting Players ({waitingPlayers.length})
                    </Heading>
                    <Badge
                      colorScheme="orange"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      Ready to play
                    </Badge>
                  </Flex>

                  <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
                    {waitingPlayers.map((player, index) => {
                      // Calculate background opacity based on queue position (first player has highest opacity)
                      const bgOpacity = Math.max(0.1, 1 - index * 0.15);
                      const borderOpacity = Math.max(0.3, 1 - index * 0.1);

                      return (
                        <Card
                          key={player.id}
                          variant="outline"
                          size="sm"
                          cursor={
                            session.status === "IN_PROGRESS"
                              ? "pointer"
                              : "default"
                          }
                          transition="all 0.2s"
                          borderRadius="md" // More angular corners
                          borderWidth="2px"
                          borderColor={
                            showMatchCreation &&
                            selectedPlayers.includes(player.id)
                              ? "blue.400"
                              : `rgba(251, 146, 60, ${borderOpacity})`
                          } // Orange color
                          bg={
                            showMatchCreation &&
                            selectedPlayers.includes(player.id)
                              ? "blue.100"
                              : `rgba(251, 146, 60, ${bgOpacity})`
                          } // Orange color
                          _hover={
                            session.status === "IN_PROGRESS"
                              ? {
                                  transform: "translateY(-2px)",
                                  boxShadow: "lg",
                                  borderColor: "orange.400",
                                  bg: "orange.50",
                                }
                              : {}
                          }
                          onClick={() => {
                            if (
                              session.status === "IN_PROGRESS" &&
                              showMatchCreation &&
                              matchMode === "manual"
                            ) {
                              togglePlayerSelection(player.id);
                            }
                          }}
                        >
                          <CardBody p={3} position="relative">
                            {/* Priority indicator */}
                            <Box
                              position="absolute"
                              top={1}
                              right={1}
                              w={2}
                              h={2}
                              borderRadius="full"
                              bg={
                                index === 0
                                  ? "red.400"
                                  : index === 1
                                  ? "orange.400"
                                  : index === 2
                                  ? "yellow.400"
                                  : "gray.300"
                              }
                            />

                            <VStack spacing={2} align="start">
                              <Flex
                                justifyContent="space-between"
                                width="100%"
                                alignItems="start"
                              >
                                <Text
                                  fontWeight="bold"
                                  color="orange.700"
                                  fontSize="md"
                                >
                                  #{player.playerNumber}
                                </Text>
                                <Badge
                                  colorScheme={
                                    player.currentWaitTime > 15
                                      ? "red"
                                      : player.currentWaitTime > 5
                                      ? "yellow"
                                      : "green"
                                  }
                                  variant="solid"
                                  fontSize="xs"
                                  borderRadius="md"
                                >
                                  {formatWaitTime(player.currentWaitTime)}
                                </Badge>
                              </Flex>

                              <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                                color="gray.800"
                                title={
                                  player.name || `Player ${player.playerNumber}`
                                }
                              >
                                {player.name || `Player ${player.playerNumber}`}
                              </Text>

                              <Flex
                                justifyContent="space-between"
                                width="100%"
                                alignItems="center"
                              >
                                <Badge
                                  variant="outline"
                                  colorScheme="orange"
                                  fontSize="xs"
                                  borderRadius="sm"
                                >
                                  {player.level || "N/A"}
                                </Badge>
                                <Text fontSize="lg" color="gray.600">
                                  {player.gender === "MALE"
                                    ? "♂"
                                    : player.gender === "FEMALE"
                                    ? "♀"
                                    : ""}
                                </Text>
                              </Flex>

                              <Text
                                fontSize="xs"
                                color="gray.600"
                                fontWeight="medium"
                              >
                                {player.matchesPlayed} matches • Position{" "}
                                {index + 1}
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </SimpleGrid>

                  {session.status === "IN_PROGRESS" && !showMatchCreation && (
                    <Text
                      fontSize="sm"
                      color="gray.500"
                      textAlign="center"
                      mt={4}
                    >
                      Use "Manual Selection" on any court to select players for
                      a match
                    </Text>
                  )}
                </Box>
              )}

              {/* Manual Match Creation Interface */}
              {showMatchCreation && matchMode === "manual" && selectedCourt && (
                <Box
                  mt={8}
                  p={6}
                  bg="blue.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="blue.200"
                >
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={4}
                  >
                    <Heading size="md" color="blue.700">
                      Create Match - Court{" "}
                      {
                        session.courts.find((c) => c.id === selectedCourt)
                          ?.courtNumber
                      }
                    </Heading>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelMatchCreation}
                      color="gray.500"
                    >
                      Cancel
                    </Button>
                  </Flex>

                  <Text fontSize="sm" color="blue.600" mb={4}>
                    Select exactly 4 players from the waiting queue above.
                    Selected players are highlighted in blue.
                  </Text>

                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={4}
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      Selected Players: {selectedPlayers.length}/4
                    </Text>
                    {selectedPlayers.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPlayers([])}
                        colorScheme="gray"
                      >
                        Clear Selection
                      </Button>
                    )}
                  </Flex>

                  {selectedPlayers.length > 0 && (
                    <Box mb={4}>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Selected:
                      </Text>
                      <Flex wrap="wrap" gap={2}>
                        {selectedPlayers.map((playerId) => {
                          const player = waitingPlayers.find(
                            (p) => p.id === playerId
                          );
                          return player ? (
                            <Badge
                              key={playerId}
                              colorScheme="blue"
                              px={2}
                              py={1}
                              borderRadius="md"
                              display="flex"
                              alignItems="center"
                              gap={1}
                            >
                              #{player.playerNumber}{" "}
                              {player.name || `Player ${player.playerNumber}`}
                              <Box
                                as="button"
                                ml={1}
                                onClick={() => togglePlayerSelection(playerId)}
                                _hover={{ bg: "blue.600" }}
                                borderRadius="full"
                                w={4}
                                h={4}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="xs"
                              >
                                ×
                              </Box>
                            </Badge>
                          ) : null;
                        })}
                      </Flex>
                    </Box>
                  )}

                  <Flex gap={2} justifyContent="flex-end">
                    <Button
                      colorScheme="blue"
                      onClick={confirmManualMatch}
                      disabled={selectedPlayers.length !== 4}
                      leftIcon={<Box as={Play} boxSize={4} />}
                    >
                      Start Match ({selectedPlayers.length}/4)
                    </Button>
                  </Flex>
                </Box>
              )}
            </TabPanel>

            {/* Tab 3: Match History */}
            <TabPanel>
              <Heading size="md" mb={4}>
                Match History
              </Heading>

              {completedMatches.length === 0 ? (
                <Text fontSize="lg" color="gray.500" textAlign="center" mt={4}>
                  No completed matches yet
                </Text>
              ) : (
                completedMatches.map((match) => {
                  const court = session.courts.find(
                    (c) => c.id === match.courtId
                  );
                  const matchDuration = match.endTime
                    ? formatDuration(match.startTime, match.endTime)
                    : "In progress";

                  return (
                    <Card key={match.id} mb={4} variant="outline">
                      <CardHeader bg="gray.50" p={4}>
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Heading size="sm">
                            Court {court?.courtNumber} -{" "}
                            {formatTime(match.startTime)}
                          </Heading>
                          <Text fontSize="sm" color="gray.500">
                            Duration: {matchDuration}
                          </Text>
                        </Flex>
                      </CardHeader>
                      <CardBody p={4}>
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
                          {match.players
                            .sort((a, b) => a.position - b.position)
                            .map((matchPlayer) => (
                              <Box
                                key={matchPlayer.id}
                                p={2}
                                bg="gray.50"
                                borderRadius="md"
                              >
                                <Text fontWeight="bold">
                                  #{matchPlayer.player.playerNumber}
                                </Text>
                                <Text>
                                  {matchPlayer.player.name ||
                                    `Player ${matchPlayer.player.playerNumber}`}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  {matchPlayer.player.level}
                                  {matchPlayer.player.gender === "MALE"
                                    ? "♂"
                                    : "♀"}
                                </Text>
                              </Box>
                            ))}
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  );
                })
              )}
            </TabPanel>

            {/* Tab 4: All Players */}
            <TabPanel>
              <Flex justifyContent="space-between" mb={4}>
                <Heading size="md">All Players</Heading>

                {session.status === "IN_PROGRESS" && (
                  <Button
                    size="sm"
                    leftIcon={<Box as={Plus} boxSize={4} />}
                    onClick={playerModalDisclosure.onOpen}
                  >
                    Add Player
                  </Button>
                )}
              </Flex>

              {session.players.length === 0 ? (
                <Text fontSize="lg" color="gray.500" textAlign="center" mt={4}>
                  No players have joined this session
                </Text>
              ) : (
                <Table variant="simple" mt={4}>
                  <Thead>
                    <Tr>
                      <Th>#</Th>
                      <Th>Name</Th>
                      <Th>Status</Th>
                      <Th>Wait Time</Th>
                      <Th>Matches</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {session.players
                      .sort((a, b) => a.playerNumber - b.playerNumber)
                      .map((player) => (
                        <Tr key={player.id}>
                          <Td>{player.playerNumber}</Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">
                                {player.name || `Player ${player.playerNumber}`}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {player.level}{" "}
                                {player.gender === "MALE" ? "♂" : "♀"}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                player.status === "PLAYING"
                                  ? "blue"
                                  : player.status === "WAITING"
                                  ? "yellow"
                                  : "gray"
                              }
                            >
                              {player.status}
                            </Badge>
                          </Td>
                          <Td>{formatWaitTime(player.totalWaitTime)}</Td>
                          <Td>{player.matchesPlayed}</Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              )}
            </TabPanel>

            {/* Tab 5: Bulk Add Players */}
            <TabPanel>
              <Box mb={4}>
                <Heading size="md" mb={4}>
                  Bulk Add Players
                </Heading>
                <Text mb={4}>
                  Use this form to add multiple players to the session at once.
                  You can either enter players manually or import from CSV.
                </Text>
                <BulkPlayersForm
                  sessionId={session.id}
                  onSuccess={refreshSessionData}
                />
              </Box>
            </TabPanel>

            {/* Tab 6: Management */}
            <TabPanel>
              <SessionManagement
                sessionId={session.id}
                session={
                  {
                    ...session,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  } as any
                }
                onSessionUpdate={() => refreshSessionData()}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}
