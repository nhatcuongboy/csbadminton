"use client";

import { CourtService, Level, MatchService, SessionService } from "@/lib/api";
import {
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
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
// Import compatibility components
import CourtsTab from "@/components/session/CourtsTab";
import PlayersTab, { PlayerFilter } from "@/components/session/PlayersTab";
import SessionHistoryList from "@/components/session/SessionHistoryList";
import SettingsTab from "@/components/session/SettingsTab";
import {
  Button,
  IconButton,
  useToast,
  VStack,
} from "@/components/ui/chakra-compat";
import TopBar from "@/components/ui/TopBar";
import {
  formatDuration,
  formatTime,
  getCourtDisplayName,
} from "@/lib/api/sessions";
import dayjs from "@/lib/dayjs";
import { Clock, Play, RefreshCw, Square, Trophy, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import WaitTimeUpdater from "./WaitTimeUpdater";

// Types for session data and related entities
interface Player {
  id: string;
  playerNumber: number;
  name: string;
  gender?: string;
  level?: Level;
  status: string;
  currentWaitTime: number;
  totalWaitTime: number;
  matchesPlayed: number;
  currentCourtId?: string;
  preFilledByHost: boolean;
  confirmedByPlayer: boolean;
  levelDescription?: string;
  requireConfirmInfo?: boolean;
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

export default function SessionDetailContent({
  sessionData,
}: {
  sessionData: SessionData;
}) {
  const t = useTranslations("SessionDetail");
  const [session, setSession] = useState<SessionData>(sessionData);
  const [refreshInterval, setRefreshInterval] = useState<number>(60);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [matchMode, setMatchMode] = useState<"auto" | "manual">("auto");
  const [showMatchCreation, setShowMatchCreation] = useState<boolean>(false);
  const [playerFilter, setPlayerFilter] = useState<PlayerFilter>("ALL");
  const [isToggleStatusLoading, setIsToggleStatusLoading] =
    useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<string>("");

  const toast = useToast();

  // Get waiting players (players with status WAITING)
  const waitingPlayers = session.players
    .filter((player) => player.status === "WAITING")
    .sort((a, b) => b.currentWaitTime - a.currentWaitTime);

  // Get active courts (with current matches)
  const activeCourts = session.courts
    .filter((court) => court.status === "IN_USE")
    .map((court) => ({
      ...court,
      status: court.status as "READY" | "IN_USE" | "EMPTY",
    }));

  // Helper function to format elapsed time for court display (more readable)
  const formatCourtElapsedTime = (startTime: string): string => {
    const start = new Date(startTime);
    const elapsedMs = currentTime.getTime() - start.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);

    if (elapsedMinutes === 0) {
      return t("lessThanMinute");
    } else if (elapsedMinutes === 1) {
      return t("oneMinute");
    } else {
      return t("minutes", { minutes: elapsedMinutes });
    }
  };

  // Helper function to get current match for a court
  const getCurrentMatch = (courtId: string): Match | null => {
    // Ensure session.matches is an array before using find
    if (!Array.isArray(session.matches)) {
      console.warn("session.matches is not an array:", session.matches);
      return null;
    }

    // First try to find by courtId and status
    let match = session.matches.find(
      (match) => match.courtId === courtId && match.status === "IN_PROGRESS"
    );

    // If not found, try to find by currentMatchId from court
    if (!match) {
      const courtData = session.courts.find((c) => c.id === courtId);
      if (courtData?.currentMatchId) {
        match = session.matches.find(
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
      // Get session and matches to match SessionData shape
      const data = await SessionService.getSession(session.id);
      // Fetch matches if not present (api.ts Session type may not include matches)
      let matches: any[] = [];
      try {
        const matchesResult = await SessionService.getSessionMatches(
          session.id
        );
        // Ensure matches is always an array
        matches = Array.isArray(matchesResult) ? matchesResult : [];
      } catch (error) {
        console.error("Error fetching matches:", error);
        matches = [];
      }
      // Convert startTime/endTime to string for SessionData
      setSession({
        ...data,
        players: (data.players || []).map((p: any) => ({
          ...p,
          name: p.name || "",
        })),
        courts: (data.courts || []).map((c: any) => ({
          ...c,
          currentPlayers: c.currentPlayers || [],
        })),
        startTime: data.startTime
          ? new Date(data.startTime).toISOString()
          : null,
        endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
        matches: matches,
      });
      setLastRefreshed(new Date());
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
    // Determine the next status
    let nextStatus = session.status;
    if (session.status === "PREPARING") {
      nextStatus = "IN_PROGRESS";
    } else if (session.status === "IN_PROGRESS") {
      nextStatus = "FINISHED";
    } else {
      return; // No change if already FINISHED
    }

    // Show confirmation dialog for ending session
    if (nextStatus === "FINISHED") {
      setPendingAction("end");
      setShowConfirmDialog(true);
      return;
    }

    // Execute the status change directly for starting session
    await executeStatusChange(nextStatus);
  };

  // Execute the actual status change
  const executeStatusChange = async (nextStatus: string) => {
    try {
      setIsToggleStatusLoading(true);

      if (nextStatus === "FINISHED") {
        // Use endSession API for comprehensive cleanup
        const result = await SessionService.endSession(session.id);

        // Update state with session data from endSession result
        setSession((prev) => ({
          ...prev,
          status: result.session.status,
          startTime: result.session.startTime
            ? new Date(result.session.startTime).toISOString()
            : null,
          endTime: result.session.endTime
            ? new Date(result.session.endTime).toISOString()
            : null,
        }));

        // Refresh session data to get updated players, courts, matches
        await refreshSessionData();
      } else {
        // For starting session, use updateSessionStatus
        const updatedSession = await SessionService.updateSessionStatus(
          session.id,
          nextStatus
        );

        // Update state with new data from server
        setSession((prev) => ({
          ...prev,
          status: updatedSession.status,
          startTime: updatedSession.startTime
            ? new Date(updatedSession.startTime).toISOString()
            : null,
          endTime: updatedSession.endTime
            ? new Date(updatedSession.endTime).toISOString()
            : null,
        }));
      }

      toast.toast({
        title:
          nextStatus === "IN_PROGRESS"
            ? t("sessionStarted")
            : t("sessionEnded"),
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating session status:", error);
      toast.toast({
        title: t("errorUpdatingSessionStatus"),
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsToggleStatusLoading(false);
    }
  };

  // Handle confirmation dialog
  const handleConfirmAction = async () => {
    setShowConfirmDialog(false);
    if (pendingAction === "end") {
      await executeStatusChange("FINISHED");
    }
    setPendingAction("");
  };

  const handleCancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction("");
  };

  // Map session status to UI text
  const mapSessionStatusToUI = (status: string) => {
    switch (status) {
      case "PREPARING":
        return t("start");
      case "IN_PROGRESS":
        return t("end");
      case "FINISHED":
        return t("ended");
      default:
        return t("unknownStatus");
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
      return t("hoursMinutes", { hours, minutes });
    }

    return t("minutesShort", { minutes });
  };

  // End a match
  const endMatch = async (matchId: string) => {
    try {
      await MatchService.endMatch(session.id, matchId);
      await refreshSessionData();

      toast.toast({
        title: t("matchEndedSuccessfully"),
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error ending match:", error);
      toast.toast({
        title: t("errorEndingMatch"),
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
          title: t("notEnoughPlayers"),
          description: t("need4PlayersToStartMatch"),
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Select the top 4 waiting players (those with longest wait time)
      const selectedPlayerIds = waitingPlayers.slice(0, 4).map((p) => p.id);

      // First, assign players to the court
      await CourtService.selectPlayers(courtId, selectedPlayerIds);

      // Then, start the match
      await CourtService.startMatch(courtId);

      await refreshSessionData();

      toast.toast({
        title: t("matchStartedSuccessfully"),
        description: t("4PlayersAutoAssigned"),
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error auto-assigning players:", error);
      toast.toast({
        title: t("errorAutoAssigningPlayers"),
        status: "error",
        duration: 3000,
      });
    }
  };

  // Auto-assign players to empty courts
  const autoAssignPlayers = async () => {
    try {
      await MatchService.autoAssignPlayers(session.id);
      await refreshSessionData();

      toast.toast({
        title: t("playersAutoAssignedSuccessfully"),
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error auto-assigning players:", error);
      toast.toast({
        title: t("errorAutoAssigningPlayers"),
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
        title: t("selectExactly4Players"),
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await MatchService.createMatch(session.id, {
        courtId: selectedCourt,
        playerIds: selectedPlayers,
      });

      // Clear selections and refresh data
      cancelMatchCreation();
      await refreshSessionData();

      toast.toast({
        title: t("matchStartedSuccessfully"),
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error starting match:", error);
      toast.toast({
        title: t("errorStartingMatch"),
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <>
      {/* Add WaitTimeUpdater to automatically update wait times every minute */}
      <WaitTimeUpdater />
      <TopBar
        title={session.name}
        showBackButton={true}
        backHref="/host/sessions"
      />
      <Container maxW="7xl" py={20}>
        {/* Session Status Cards */}
        <Grid templateColumns="repeat(3, 1fr)" gap={{ base: 2, md: 6 }} mb={8}>
          <Box
            p={{ base: 3, md: 6 }}
            bg="white"
            _dark={{ bg: "gray.800" }}
            borderRadius="lg"
            boxShadow="md"
            borderWidth="1px"
          >
            <Flex
              align="center"
              justify="space-between"
              mb={{ base: 1, md: 2 }}
            >
              <Flex align="center">
                <Box
                  as={Clock}
                  boxSize={{ base: 4, md: 5 }}
                  color="blue.500"
                  mr={{ base: 1, md: 2 }}
                />
                <Heading
                  size={{ base: "sm", md: "md" }}
                  display={{ base: "none", md: "block" }}
                >
                  {t("sessionTime")}
                </Heading>
                <Heading size="xs" display={{ base: "block", md: "none" }}>
                  {t("sessionTime")}
                </Heading>
              </Flex>
              <Button
                colorScheme={mapSessionStatusToColor(session.status)}
                onClick={toggleSessionStatus}
                disabled={session.status === "FINISHED"}
                loading={isToggleStatusLoading}
                size={{ base: "xs", md: "sm" }}
                padding={0}
              >
                <Flex alignItems="center">
                  <Box
                    as={session.status === "IN_PROGRESS" ? Square : Play}
                    boxSize={{ base: 3, md: 4 }}
                    // mr={{ base: 1, md: 2 }}
                  />
                </Flex>
              </Button>
            </Flex>
            <Box display={{ base: "none", md: "block" }}>
              <VStack align="start" spacing={2}>
                <Text fontWeight="medium">
                  {`${formatTime(session.startTime!)}-${formatTime(
                    session.endTime!
                  )} (${
                    session.startTime
                      ? dayjs(session.startTime).format("DD/MM/YY")
                      : ""
                  })`}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {t("duration")}:{" "}
                  {formatDuration(session.startTime!, session.endTime!)}
                </Text>
              </VStack>
            </Box>
            {/* Mobile simplified view */}
            <Box display={{ base: "block", md: "none" }}>
              <Text fontSize={"xs"}>
                {`${formatTime(session.startTime!)}-${formatTime(
                  session.endTime!
                )} (${
                  session.startTime
                    ? dayjs(session.startTime).format("DD/MM/YY")
                    : ""
                })`}
              </Text>
            </Box>
          </Box>

          <Box
            p={{ base: 3, md: 6 }}
            bg="white"
            _dark={{ bg: "gray.800" }}
            borderRadius="lg"
            boxShadow="md"
            borderWidth="1px"
          >
            <Flex align="center" mb={{ base: 1, md: 2 }}>
              <Box
                as={Users}
                boxSize={{ base: 4, md: 5 }}
                color="blue.500"
                mr={{ base: 1, md: 2 }}
              />
              <Heading size={{ base: "xs", md: "md" }}>{t("players")}</Heading>
            </Flex>
            <Text fontSize={{ base: "sm", md: "lg" }}>
              {session.players.length} {t("total")}
            </Text>
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              color="gray.500"
              display={{ base: "none", md: "block" }}
            >
              {session.players.filter((p) => p.status === "PLAYING").length}{" "}
              {t("playing")} /{" "}
              {session.players.filter((p) => p.status === "WAITING").length}{" "}
              {t("waiting")}
            </Text>
            {/* Mobile simplified view */}
            <Text
              fontSize="xs"
              color="gray.500"
              display={{ base: "block", md: "none" }}
            >
              {session.players.filter((p) => p.status === "PLAYING").length}P/{" "}
              {session.players.filter((p) => p.status === "WAITING").length}W
            </Text>
          </Box>

          <Box
            p={{ base: 3, md: 6 }}
            bg="white"
            _dark={{ bg: "gray.800" }}
            borderRadius="lg"
            boxShadow="md"
            borderWidth="1px"
          >
            <Flex
              align="center"
              mb={{ base: 1, md: 2 }}
              justifyContent="space-between"
            >
              <Flex align="center">
                <Box
                  as={RefreshCw}
                  boxSize={{ base: 4, md: 5 }}
                  color="blue.500"
                  mr={{ base: 1, md: 2 }}
                />
                <Heading
                  size={{ base: "xs", md: "md" }}
                  display={{ base: "none", md: "block" }}
                >
                  {t("updates")}
                </Heading>
                <Heading size="xs" display={{ base: "block", md: "none" }}>
                  {t("refresh")}
                </Heading>
              </Flex>
              {session.status === "IN_PROGRESS" && (
                <IconButton
                  aria-label="Refresh"
                  icon={<Box as={RefreshCw} boxSize={{ base: 3, md: 4 }} />}
                  size={{ base: "xs", md: "sm" }}
                  isLoading={isRefreshing}
                  onClick={refreshSessionData}
                />
              )}
            </Flex>
            <Box display={{ base: "none", md: "block" }}>
              <Text fontSize="lg">
                {session.status === "IN_PROGRESS"
                  ? t("autoRefresh", { seconds: refreshInterval })
                  : t("autoRefreshDisabled")}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {t("lastUpdated")}: {lastRefreshed.toLocaleTimeString()}
              </Text>
            </Box>
            {/* Mobile simplified view */}
            <Box display={{ base: "block", md: "none" }}>
              <Text fontSize="xs" color="gray.500">
                {session.status === "IN_PROGRESS"
                  ? `${refreshInterval}s`
                  : t("off")}
              </Text>
            </Box>
          </Box>
        </Grid>

        {/* Bottom Navigation Bar for Tabs */}
        <Box minH="60vh" pb="80px">
          {session.status !== "IN_PROGRESS" && (
            <Text fontSize="lg" color="gray.500" textAlign="center" mt={4}>
              {session.status === "PREPARING"
                ? t("courtsTab.startSessionToBeginMatches")
                : t("courtsTab.sessionHasEnded")}
            </Text>
          )}
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
              onDataRefresh={refreshSessionData}
              isRefreshing={isRefreshing}
              formatWaitTime={formatWaitTime}
            />
          )}
          {activeTab === 1 && (
            <PlayersTab
              sessionPlayers={session.players}
              playerFilter={playerFilter}
              setPlayerFilter={setPlayerFilter}
              formatWaitTime={formatWaitTime}
              sessionId={session.id}
            />
          )}
          {activeTab === 2 && <SessionHistoryList sessionId={session.id} />}
          {activeTab === 3 && (
            <SettingsTab
              session={session}
              refreshSessionData={refreshSessionData}
            />
          )}
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
            <Box as={Square} boxSize={6} mb={1} />
            {t("courts")}
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
            {t("players")}
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
            <Box as={Trophy} boxSize={6} mb={1} />
            {t("matchs.tabTitle")}
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
            <Box as={RefreshCw} boxSize={6} mb={1} />
            {t("settings")}
          </Box>
        </Box>
      </Container>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={handleCancelAction}
        >
          <Box
            bg="white"
            _dark={{ bg: "gray.800" }}
            borderRadius="lg"
            boxShadow="xl"
            p={6}
            maxW="md"
            mx={4}
            onClick={(e) => e.stopPropagation()}
          >
            <Heading size="md" mb={4} color="red.500">
              {t("confirmEndSession")}
            </Heading>
            <Text mb={6} color="gray.600" _dark={{ color: "gray.300" }}>
              {t("confirmEndSessionMessage")}
            </Text>
            <Flex gap={3} justifyContent="flex-end">
              <Button
                variant="outline"
                onClick={handleCancelAction}
                disabled={isToggleStatusLoading}
              >
                {t("cancel")}
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmAction}
                loading={isToggleStatusLoading}
              >
                {t("endSession")}
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  );
}
