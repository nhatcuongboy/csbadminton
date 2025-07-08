"use client";

import {
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  Select,
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
import { PlayerGrid } from "@/components/player/PlayerGrid";
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
import TopBar from "@/components/ui/TopBar";
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
  Edit,
  Play,
  Plus,
  RefreshCw,
  Save,
  Shuffle,
  Square,
  Trash2,
  Users,
} from "lucide-react";
import CourtsTab from "@/components/session/CourtsTab";
import PlayersTab from "@/components/session/PlayersTab";
import ManageTab from "@/components/session/ManageTab";
import SettingsTab from "@/components/session/SettingsTab";

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
  const [playerFilter, setPlayerFilter] = useState<
    "ALL" | "PLAYING" | "WAITING"
  >("ALL");

  // Player management states
  const [editingPlayers, setEditingPlayers] = useState<{
    [key: string]: Player;
  }>({});
  const [newPlayers, setNewPlayers] = useState<
    Array<{
      playerNumber: number;
      name: string;
      gender: string;
      level: string;
    }>
  >([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
        return "Start";
      case "IN_PROGRESS":
        return "End";
      case "FINISHED":
        return "Ended";
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

  // Player management functions
  const addNewPlayerRow = () => {
    const nextPlayerNumber =
      Math.max(...session.players.map((p) => p.playerNumber), 0) + 1;
    setNewPlayers([
      ...newPlayers,
      {
        playerNumber: nextPlayerNumber,
        name: "",
        gender: "MALE",
        level: "BEGINNER",
      },
    ]);
  };

  const removeNewPlayerRow = (index: number) => {
    setNewPlayers(newPlayers.filter((_, i) => i !== index));
  };

  const updateNewPlayer = (index: number, field: string, value: string) => {
    setNewPlayers((prev) =>
      prev.map((player, i) =>
        i === index ? { ...player, [field]: value } : player
      )
    );
  };

  const startEditingPlayer = (player: Player) => {
    setEditingPlayers((prev) => ({
      ...prev,
      [player.id]: { ...player },
    }));
  };

  const cancelEditingPlayer = (playerId: string) => {
    setEditingPlayers((prev) => {
      const newState = { ...prev };
      delete newState[playerId];
      return newState;
    });
  };

  const updateEditingPlayer = (
    playerId: string,
    field: string,
    value: string
  ) => {
    setEditingPlayers((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      },
    }));
  };

  const savePlayerChanges = async () => {
    try {
      setIsSaving(true);

      // Prepare data for API
      const playersToUpdate = Object.values(editingPlayers);
      const playersToCreate = newPlayers.filter((p) => p.name.trim() !== "");

      const requests = [];

      // Update existing players
      if (playersToUpdate.length > 0) {
        requests.push(
          fetch(`/api/sessions/${session.id}/players/bulk-update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ players: playersToUpdate }),
          })
        );
      }

      // Create new players
      if (playersToCreate.length > 0) {
        requests.push(
          fetch(`/api/sessions/${session.id}/players/bulk-create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ players: playersToCreate }),
          })
        );
      }

      const results = await Promise.all(requests);
      const responses = await Promise.all(results.map((r) => r.json()));

      const hasErrors = responses.some((r) => !r.success);

      if (hasErrors) {
        throw new Error("Some updates failed");
      }

      // Clear editing states
      setEditingPlayers({});
      setNewPlayers([]);

      // Refresh session data
      await refreshSessionData();

      toast.toast({
        title: "Players updated successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving player changes:", error);
      toast.toast({
        title: "Failed to save player changes",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveIndividualPlayer = async (playerId: string) => {
    try {
      setIsSaving(true);

      const playerToUpdate = editingPlayers[playerId];
      if (!playerToUpdate) {
        throw new Error("No player data to update");
      }

      const response = await fetch(
        `/api/sessions/${session.id}/players/${playerId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(playerToUpdate),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to update player");
      }

      // Remove from editing state
      setEditingPlayers((prev) => {
        const newState = { ...prev };
        delete newState[playerId];
        return newState;
      });

      // Refresh session data
      await refreshSessionData();

      toast.toast({
        title: "Player updated successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating player:", error);
      toast.toast({
        title: "Failed to update player",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deletePlayer = async (playerId: string) => {
    try {
      const response = await fetch(
        `/api/sessions/${session.id}/players/${playerId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        await refreshSessionData();
        toast.toast({
          title: "Player deleted successfully",
          status: "success",
          duration: 3000,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error deleting player:", error);
      toast.toast({
        title: "Failed to delete player",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <TopBar title={session.name} showBackButton={true} backHref="/host" />
      <Container maxW="7xl" py={8} pt={20}>
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
            <Flex align="center" justify="space-between" mb={2}>
              <Flex align="center">
                <Box as={Clock} boxSize={5} color="blue.500" mr={2} />
                <Heading size="md">Session Time</Heading>
              </Flex>
              <Button
                colorScheme={mapSessionStatusToColor(session.status)}
                onClick={toggleSessionStatus}
                disabled={session.status === "FINISHED"}
                size="sm"
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
            <VStack align="start" spacing={2}>
              {session.status === "PREPARING" ? (
                <Text fontSize="lg" color="gray.500">
                  Not started yet
                </Text>
              ) : session.status === "IN_PROGRESS" ? (
                <>
                  <Text fontWeight="medium">
                    Start Time: {formatTime(session.startTime!)}
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    Status: In Progress
                  </Text>
                </>
              ) : (
                <>
                  <Text fontWeight="medium">
                    Start Time: {formatTime(session.startTime!)}
                  </Text>
                  {session.endTime && (
                    <Text fontWeight="medium">
                      End Time: {formatTime(session.endTime)}
                    </Text>
                  )}
                  {session.startTime && session.endTime && (
                    <Text fontSize="sm" color="gray.600">
                      Duration:{" "}
                      {formatDuration(session.startTime, session.endTime)}
                    </Text>
                  )}
                </>
              )}
            </VStack>
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

        {/* Bottom Navigation Bar for Tabs */}
        <Box minH="60vh" pb="80px">
          {activeTab === 0 && (
            <CourtsTab
              session={session}
              activeCourts={activeCourts}
              showMatchCreation={showMatchCreation}
              setShowMatchCreation={setShowMatchCreation}
              matchMode={matchMode}
              setMatchMode={setMatchMode}
              selectedPlayers={selectedPlayers}
              setSelectedPlayers={setSelectedPlayers}
              selectedCourt={selectedCourt}
              setSelectedCourt={setSelectedCourt}
              waitingPlayers={waitingPlayers}
              getCurrentMatch={getCurrentMatch}
              formatCourtElapsedTime={formatCourtElapsedTime}
              getCourtDisplayName={getCourtDisplayName}
              cancelMatchCreation={cancelMatchCreation}
              confirmManualMatch={confirmManualMatch}
              togglePlayerSelection={togglePlayerSelection}
              autoAssignPlayers={autoAssignPlayers}
              endMatch={endMatch}
              autoAssignPlayersToSpecificCourt={
                autoAssignPlayersToSpecificCourt
              }
              startManualMatchCreation={startManualMatchCreation}
            />
          )}
          {activeTab === 1 && (
            <PlayersTab
              sessionPlayers={session.players}
              playerFilter={playerFilter}
              setPlayerFilter={setPlayerFilter}
              formatWaitTime={formatWaitTime}
            />
          )}
          {activeTab === 2 && (
            <ManageTab
              session={session}
              newPlayers={newPlayers}
              editingPlayers={editingPlayers}
              isSaving={isSaving}
              addNewPlayerRow={addNewPlayerRow}
              removeNewPlayerRow={removeNewPlayerRow}
              updateNewPlayer={updateNewPlayer}
              startEditingPlayer={startEditingPlayer}
              cancelEditingPlayer={cancelEditingPlayer}
              updateEditingPlayer={updateEditingPlayer}
              savePlayerChanges={savePlayerChanges}
              saveIndividualPlayer={saveIndividualPlayer}
              deletePlayer={deletePlayer}
            />
          )}
          {activeTab === 3 && <SettingsTab session={session} />}
        </Box>

        {/* Bottom Navigation Bar */}
        <Box
          position="fixed"
          left={0}
          right={0}
          bottom={0}
          zIndex={100}
          bg="white"
          borderTopWidth="1px"
          boxShadow="md"
          display="flex"
          justifyContent="space-around"
          alignItems="center"
          height="64px"
        >
          <Box
            as="button"
            flex={1}
            py={2}
            onClick={() => setActiveTab(0)}
            display="flex"
            flexDirection="column"
            alignItems="center"
            color={activeTab === 0 ? "blue.500" : "gray.500"}
            fontWeight={activeTab === 0 ? "bold" : "normal"}
          >
            <Box as={Users} boxSize={6} mb={1} />
            Courts
          </Box>
          <Box
            as="button"
            flex={1}
            py={2}
            onClick={() => setActiveTab(1)}
            display="flex"
            flexDirection="column"
            alignItems="center"
            color={activeTab === 1 ? "blue.500" : "gray.500"}
            fontWeight={activeTab === 1 ? "bold" : "normal"}
          >
            <Box as={Users} boxSize={6} mb={1} />
            Players
          </Box>
          <Box
            as="button"
            flex={1}
            py={2}
            onClick={() => setActiveTab(2)}
            display="flex"
            flexDirection="column"
            alignItems="center"
            color={activeTab === 2 ? "blue.500" : "gray.500"}
            fontWeight={activeTab === 2 ? "bold" : "normal"}
          >
            <Box as={RefreshCw} boxSize={6} mb={1} />
            Manage
          </Box>
          <Box
            as="button"
            flex={1}
            py={2}
            onClick={() => setActiveTab(3)}
            display="flex"
            flexDirection="column"
            alignItems="center"
            color={activeTab === 3 ? "blue.500" : "gray.500"}
            fontWeight={activeTab === 3 ? "bold" : "normal"}
          >
            <Box as={/* icon for settings */ RefreshCw} boxSize={6} mb={1} />
            Settings
          </Box>
        </Box>
      </Container>
    </>
  );
}
