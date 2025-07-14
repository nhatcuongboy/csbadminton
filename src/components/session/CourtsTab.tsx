import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useDisclosure,
} from "@chakra-ui/react";
import { Plus, Shuffle, Square, Play, X, Clock } from "lucide-react";
import BadmintonCourt from "../court/BadmintonCourt";
import MatchPreviewModal from "./MatchPreviewModal";
import ManualSelectPlayersModal from "./ManualSelectPlayersModal";
import { PlayerGrid } from "../player/PlayerGrid";
import {
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Button as CompatButton,
  useToast,
} from "@/components/ui/chakra-compat";
import { CourtService, SuggestedPlayersResponse } from "@/lib/api";
import { Player, Court, Match, MatchPlayer } from "@/types/session";
import { useTranslations } from "next-intl";

interface CourtsTabProps {
  session: any;
  activeCourts: Court[];
  showMatchCreation: boolean;
  setShowMatchCreation: (show: boolean) => void;
  matchMode: "auto" | "manual";
  setMatchMode: (mode: "auto" | "manual") => void;
  selectedPlayers: string[];
  setSelectedPlayers: (ids: string[]) => void;
  selectedCourt: string | null;
  setSelectedCourt: (id: string | null) => void;
  autoAssignPlayers: () => void;
  cancelMatchCreation: () => void;
  confirmManualMatch: () => void;
  waitingPlayers: Player[];
  togglePlayerSelection: (id: string) => void;
  getCurrentMatch: (courtId: string) => Match | null;
  formatCourtElapsedTime: (startTime: string) => string;
  getCourtDisplayName: (
    courtName: string | undefined,
    courtNumber: number
  ) => string;
  mode?: "manage" | "view"; // New prop: "manage" (default) allows actions, "view" is read-only
  endMatch?: (matchId: string) => void;
  autoAssignPlayersToSpecificCourt?: (courtId: string) => void;
  startManualMatchCreation?: (courtId: string) => void;
  onDataRefresh?: () => void;
  isRefreshing?: boolean;
  formatWaitTime: (waitTimeInMinutes: number) => string;
}

const CourtsTab: React.FC<
  CourtsTabProps & {
    endMatch?: (matchId: string) => void;
    autoAssignPlayersToSpecificCourt?: (courtId: string) => void;
    startManualMatchCreation?: (courtId: string) => void;
    onDataRefresh?: () => void;
  }
> = ({
  session,
  activeCourts,
  showMatchCreation,
  setShowMatchCreation,
  matchMode,
  setMatchMode,
  selectedPlayers,
  setSelectedPlayers,
  selectedCourt,
  setSelectedCourt,
  autoAssignPlayers,
  cancelMatchCreation,
  confirmManualMatch,
  waitingPlayers,
  togglePlayerSelection,
  getCurrentMatch,
  formatCourtElapsedTime,
  getCourtDisplayName,
  mode = "manage", // Default to manage mode if not provided
  endMatch,
  autoAssignPlayersToSpecificCourt,
  startManualMatchCreation,
  onDataRefresh,
  isRefreshing = false,
  formatWaitTime,
}) => {
  const t = useTranslations("SessionDetail");
  const [loadingEndMatchId, setLoadingEndMatchId] = React.useState<
    string | null
  >(null);
  const [loadingStartMatchCourtId, setLoadingStartMatchCourtId] =
    React.useState<string | null>(null);
  const [loadingCancelCourtId, setLoadingCancelCourtId] = React.useState<
    string | null
  >(null);
  const toast = useToast();

  // Auto-assign modal state
  const [autoAssignModalOpen, setAutoAssignModalOpen] = React.useState(false);
  const [selectedAutoAssignCourt, setSelectedAutoAssignCourt] =
    React.useState<Court | null>(null);
  const [loadingConfirmAutoAssign, setLoadingConfirmAutoAssign] =
    React.useState(false);
  const [currentTopCount, setCurrentTopCount] = React.useState(
    waitingPlayers.length || 4
  );

  // Update currentTopCount when waitingPlayers count changes
  React.useEffect(() => {
    if (waitingPlayers.length > 0) {
      setCurrentTopCount(waitingPlayers.length);
    }
  }, [waitingPlayers.length]);

  // Manual selection modal state
  const [manualSelectModalOpen, setManualSelectModalOpen] =
    React.useState(false);
  const [selectedManualCourt, setSelectedManualCourt] =
    React.useState<Court | null>(null);
  const [manualSelectedPlayers, setManualSelectedPlayers] = React.useState<
    string[]
  >([]);
  const [confirmingManualMatch, setConfirmingManualMatch] =
    React.useState(false);

  // Handle auto-assign match button click
  const handleAutoAssignClick = (court: Court) => {
    setSelectedAutoAssignCourt(court);
    setAutoAssignModalOpen(true);
  };

  // Handle confirm from modal with suggested players
  const handleConfirmAutoAssign = async (
    suggestedPlayers: SuggestedPlayersResponse
  ) => {
    if (!selectedAutoAssignCourt) return;

    try {
      setLoadingConfirmAutoAssign(true);

      const playerIds = [
        ...suggestedPlayers.pair1.players.map((p: Player) => p.id),
        ...suggestedPlayers.pair2.players.map((p: Player) => p.id),
      ];

      // Select the players for the specified court
      await CourtService.selectPlayers(selectedAutoAssignCourt.id, playerIds);

      // Close modal and reset state
      setAutoAssignModalOpen(false);
      setSelectedAutoAssignCourt(null);

      // Refresh parent data
      if (onDataRefresh) {
        onDataRefresh();
      }

      toast.toast({
        title: t("courtsTab.playersAssignedToCourt"),
        description: t("courtsTab.pleaseStartMatchManually"),
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error selecting players for court:", error);
      toast.toast({
        title: t("courtsTab.errorAssigningPlayers"),
        description: t("courtsTab.pleaseRetryLater"),
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoadingConfirmAutoAssign(false);
    }
  };

  // Select players for court (used by both auto-assign and manual selection)
  const handleChoosePlayersForCourt = async (
    playerIds: string[],
    courtId: string
  ) => {
    try {
      setLoadingConfirmAutoAssign(true);
      setConfirmingManualMatch(true);

      // Select the players for the specified court
      await CourtService.selectPlayers(courtId, playerIds);

      // Close modals and reset state
      setAutoAssignModalOpen(false);
      setManualSelectModalOpen(false);
      setSelectedAutoAssignCourt(null);
      setSelectedManualCourt(null);
      setManualSelectedPlayers([]);

      // Refresh parent data
      if (onDataRefresh) {
        onDataRefresh();
      }

      toast.toast({
        title: t("courtsTab.playersAssignedToCourt"),
        description: t("courtsTab.pleaseStartMatchManually"),
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error selecting players for court:", error);
      toast.toast({
        title: t("courtsTab.errorAssigningPlayers"),
        description: t("courtsTab.pleaseRetryLater"),
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoadingConfirmAutoAssign(false);
      setConfirmingManualMatch(false);
    }
  };

  // Cancel auto-assign modal
  const handleCancelAutoAssign = () => {
    setAutoAssignModalOpen(false);
    setSelectedAutoAssignCourt(null);
  };

  // Handle manual selection button click
  const handleManualSelectionClick = (court: Court) => {
    setSelectedManualCourt(court);
    setManualSelectedPlayers([]);
    setManualSelectModalOpen(true);
  };

  // Handle player toggle in manual selection
  const handleManualPlayerToggle = (playerId: string) => {
    setManualSelectedPlayers((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      } else if (prev.length < 4) {
        return [...prev, playerId];
      }
      return prev;
    });
  };

  // Cancel manual selection
  const handleCancelManualSelection = () => {
    setManualSelectModalOpen(false);
    setSelectedManualCourt(null);
    setManualSelectedPlayers([]);
  };

  return (
    <>
      <Flex justifyContent="space-between" mb={4}>
        <Heading size="md">{t("courtsTab.activeCourts")}</Heading>
        {session.status === "IN_PROGRESS" && (
          <HStack gap={2}>
            {/* <CompatButton size="sm" onClick={autoAssignPlayers}>
              <Box as={Shuffle} boxSize={4} mr={1} />
              Auto Assign
            </CompatButton> */}
          </HStack>
        )}
      </Flex>
      {session.status !== "IN_PROGRESS" && mode === "manage" && (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={4}>
          {session.status === "PREPARING"
            ? t("courtsTab.startSessionToBeginMatches")
            : t("courtsTab.sessionHasEnded")}
        </Text>
      )}
      {/* {session.status === "IN_PROGRESS" && activeCourts.length === 0 && (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={4}>
          No active courts. Create a new match to start playing.
        </Text>
      )} */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mt={4}>
        {session.courts.map((court: Court) => {
          const currentMatch = getCurrentMatch(court.id);
          const isActive =
            court.status === "IN_USE" || court.status === "READY";
          const isCourtReady = court.status === "READY";
          return (
            <Card key={court.id} variant="outline">
              <CardHeader
                bg={
                  isCourtReady ? "yellow.50" : isActive ? "green.50" : "gray.50"
                }
                p={4}
                borderBottom="1px"
                borderColor={
                  isCourtReady
                    ? "yellow.200"
                    : isActive
                    ? "green.200"
                    : "gray.200"
                }
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading
                    size="md"
                    color={
                      isCourtReady
                        ? "yellow.700"
                        : isActive
                        ? "green.700"
                        : "gray.700"
                    }
                  >
                    {t("courtsTab.courtNumber", { number: court.courtNumber })}
                  </Heading>
                  <HStack gap={2}>
                    {currentMatch && court.status === "IN_USE" && (
                      <Badge
                        colorScheme="blue"
                        variant="solid"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Box as={Clock} boxSize={4} />
                        {currentMatch.startTime
                          ? formatCourtElapsedTime(currentMatch.startTime)
                          : "-"}
                      </Badge>
                    )}
                    <Badge
                      colorScheme={
                        isCourtReady ? "yellow" : isActive ? "green" : "gray"
                      }
                      variant={isActive ? "solid" : "outline"}
                    >
                      {isCourtReady
                        ? t("courtsTab.ready")
                        : isActive
                        ? t("courtsTab.inUse")
                        : t("courtsTab.empty")}
                    </Badge>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody py={4} px={0}>
                {isActive && court.currentPlayers.length > 0 ? (
                  <VStack gap={4}>
                    <BadmintonCourt
                      players={court.currentPlayers}
                      isActive={isActive}
                      elapsedTime={
                        currentMatch
                          ? formatCourtElapsedTime(currentMatch.startTime)
                          : t("courtsTab.playing")
                      }
                      courtName={getCourtDisplayName(
                        court.courtName,
                        court.courtNumber
                      )}
                      width="100%"
                      //   height="180px"
                      showTimeInCenter={true}
                      isLoading={isRefreshing}
                      status={court.status}
                      mode={mode}
                    />
                    {/* Show Start Match button if court is IN_USE but no match has started */}
                    {session.status === "IN_PROGRESS" &&
                      mode === "manage" &&
                      court.status === "READY" && (
                        <VStack gap={2} width="100%">
                          <CompatButton
                            size="sm"
                            width={{ base: "100%", md: "auto" }}
                            colorScheme="green"
                            loading={loadingStartMatchCourtId === court.id}
                            onClick={async () => {
                              setLoadingStartMatchCourtId(court.id);
                              try {
                                await CourtService.startMatch(court.id);
                                if (onDataRefresh) onDataRefresh();
                                toast.toast({
                                  title: t(
                                    "courtsTab.matchStartedSuccessfully"
                                  ),
                                  description: t("courtsTab.matchHasStarted"),
                                  status: "success",
                                  duration: 3000,
                                });
                              } finally {
                                setLoadingStartMatchCourtId(null);
                              }
                            }}
                          >
                            <Box as={Play} boxSize={4} mr={1} />
                            {t("startMatch")}
                          </CompatButton>
                          <CompatButton
                            size="sm"
                            width={{ base: "100%", md: "auto" }}
                            colorScheme="red"
                            variant="outline"
                            loading={loadingCancelCourtId === court.id}
                            onClick={async () => {
                              setLoadingCancelCourtId(court.id);
                              try {
                                await CourtService.deselectPlayers(court.id);
                                if (onDataRefresh) onDataRefresh();
                                toast.toast({
                                  title: t("courtsTab.playersDeselected"),
                                  description: t(
                                    "courtsTab.courtAvailableForPlay"
                                  ),
                                  status: "success",
                                  duration: 3000,
                                });
                              } catch (error) {
                                console.error(
                                  "Error deselecting players:",
                                  error
                                );
                              } finally {
                                setLoadingCancelCourtId(null);
                              }
                            }}
                          >
                            <Box as={X} boxSize={4} mr={1} />
                            {t("courtsTab.cancel")}
                          </CompatButton>
                        </VStack>
                      )}
                    <VStack gap={2} width="100%">
                      {session.status === "IN_PROGRESS" &&
                        endMatch &&
                        court.currentMatchId &&
                        mode === "manage" &&
                        court.status !== "READY" && ( // Ensure button does not show for READY status
                          <CompatButton
                            size="sm"
                            width={{ base: "100%", md: "auto" }}
                            colorScheme="red"
                            onClick={async () => {
                              if (!court.currentMatchId) return;
                              setLoadingEndMatchId(court.currentMatchId);
                              try {
                                await CourtService.endMatch(court.id); // Call endMatch API
                                if (onDataRefresh) onDataRefresh(); // Refresh data after ending match
                                toast.toast({
                                  title: t("courtsTab.matchEndedSuccessfully"),
                                  description: t(
                                    "courtsTab.courtAvailableForPlay"
                                  ),
                                  status: "success",
                                  duration: 3000,
                                });
                              } catch (error) {
                                console.error("Error ending match:", error);
                                toast.toast({
                                  title: t("courtsTab.errorEndingMatch"),
                                  description: t("courtsTab.pleaseRetryLater"),
                                  status: "error",
                                  duration: 3000,
                                });
                              } finally {
                                setLoadingEndMatchId(null);
                              }
                            }}
                            loading={loadingEndMatchId === court.currentMatchId}
                          >
                            <Box as={Square} boxSize={4} mr={1} />
                            {t("courtsTab.endMatch")}
                          </CompatButton>
                        )}
                    </VStack>
                  </VStack>
                ) : (
                  <VStack gap={4} align="center" justify="center" minH="200px">
                    <BadmintonCourt
                      players={[]}
                      isActive={false}
                      courtName={getCourtDisplayName(
                        court.courtName,
                        court.courtNumber
                      )}
                      width="100%"
                      //   height="180px"
                      showTimeInCenter={false}
                      isLoading={isRefreshing}
                      status="EMPTY"
                    />
                    {session.status === "IN_PROGRESS" && mode === "manage" ? (
                      <VStack gap={2}>
                        <CompatButton
                          colorScheme="green"
                          onClick={() => handleAutoAssignClick(court)}
                          size="sm"
                          width="full"
                          // loading={
                          //   selectedAutoAssignCourt?.id === court.id &&
                          //   loadingAutoAssign
                          // }
                        >
                          <Box as={Shuffle} boxSize={4} mr={1} />
                          {t("courtsTab.autoAssignMatch")}
                        </CompatButton>
                        {startManualMatchCreation && (
                          <CompatButton
                            colorScheme="blue"
                            onClick={() => handleManualSelectionClick(court)}
                            size="sm"
                            width="full"
                            variant="outline"
                          >
                            <Box as={Plus} boxSize={4} mr={1} />
                            {t("courtsTab.manualSelection")}
                          </CompatButton>
                        )}
                      </VStack>
                    ) : session.status === "IN_PROGRESS" ? (
                      <Text
                        fontSize="sm"
                        color="gray.500"
                        textAlign="center"
                        mt={2}
                      >
                        {t("courtsTab.courtAvailableForPlay")}
                      </Text>
                    ) : null}
                  </VStack>
                )}
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Auto Assign Match Modal */}
      <MatchPreviewModal
        isOpen={autoAssignModalOpen}
        court={selectedAutoAssignCourt}
        waitingPlayersCount={waitingPlayers.length}
        currentTopCount={currentTopCount}
        onConfirm={handleConfirmAutoAssign}
        onCancel={handleCancelAutoAssign}
        getCourtDisplayName={getCourtDisplayName}
        title={
          selectedAutoAssignCourt
            ? t("courtsTab.autoAssignMatchTitle", {
                courtNumber: selectedAutoAssignCourt.courtNumber,
              })
            : undefined
        }
        description={t("courtsTab.autoAssignMatchDescription")}
      />

      {/* Manual Selection Modal */}
      <ManualSelectPlayersModal
        isOpen={manualSelectModalOpen}
        court={selectedManualCourt}
        waitingPlayers={waitingPlayers}
        selectedPlayers={manualSelectedPlayers}
        onPlayerToggle={handleManualPlayerToggle}
        onConfirm={() => {
          if (selectedManualCourt) {
            handleChoosePlayersForCourt(
              manualSelectedPlayers,
              selectedManualCourt.id
            );
          }
        }}
        onCancel={handleCancelManualSelection}
        isLoading={confirmingManualMatch} // Pass loading state for manual selection
        formatWaitTime={(minutes) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          if (hours > 0) {
            return `${hours}h ${mins}m`;
          }
          return `${mins}m`;
        }}
      />

      {/* Waiting Players Grid */}
      {waitingPlayers.length > 0 && (
        <Box mt={8}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md">
              {t("courtsTab.waitingPlayers")} ({waitingPlayers.length})
            </Heading>
            {/* {waitingPlayers.length > 0 && (
              <Badge colorScheme="blue" fontSize="md" py={1} px={2}>
                {waitingPlayers.length}
              </Badge>
            )} */}
          </Flex>
          <PlayerGrid
            players={waitingPlayers}
            playerFilter="WAITING"
            formatWaitTime={formatWaitTime}
            selectedPlayers={selectedPlayers}
            mode={mode}
            // onPlayerToggle={onPlayerToggle}
            // selectionMode={true}
          />
        </Box>
      )}
    </>
  );
};

export default CourtsTab;
