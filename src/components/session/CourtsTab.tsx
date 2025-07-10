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
import {
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Button as CompatButton,
  useToast,
} from "@/components/ui/chakra-compat";
import { CourtService } from "@/lib/api";
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
}) => {
  const t = useTranslations("SessionDetail");
  const [loadingEndMatchId, setLoadingEndMatchId] = React.useState<
    string | null
  >(null);
  const [loadingStartMatchCourtId, setLoadingStartMatchCourtId] =
    React.useState<string | null>(null);
  const toast = useToast();

  // Auto-assign modal state
  const [autoAssignModalOpen, setAutoAssignModalOpen] = React.useState(false);
  const [selectedAutoAssignCourt, setSelectedAutoAssignCourt] =
    React.useState<Court | null>(null);
  const [suggestedPlayers, setSuggestedPlayers] = React.useState<Player[]>([]);
  const [loadingAutoAssign, setLoadingAutoAssign] = React.useState(false);
  const [loadingConfirmAutoAssign, setLoadingConfirmAutoAssign] =
    React.useState(false);

  // Manual selection modal state
  const [manualSelectModalOpen, setManualSelectModalOpen] =
    React.useState(false);
  const [selectedManualCourt, setSelectedManualCourt] =
    React.useState<Court | null>(null);
  const [manualSelectedPlayers, setManualSelectedPlayers] = React.useState<
    string[]
  >([]);
  const [showManualPreview, setShowManualPreview] = React.useState(false);
  const [confirmingManualMatch, setConfirmingManualMatch] =
    React.useState(false);

  // Handle auto-assign match button click
  const handleAutoAssignClick = async (court: Court) => {
    try {
      setLoadingAutoAssign(true);
      const players = await CourtService.getSuggestedPlayersForCourt(court.id);
      setSuggestedPlayers(players);
      setSelectedAutoAssignCourt(court);
      setAutoAssignModalOpen(true);
    } catch (error) {
      console.error("Error getting suggested players:", error);
      toast.toast({
        title: t("courtsTab.errorGettingSuggestedPlayers"),
        description: t("courtsTab.pleaseRetryLater"),
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoadingAutoAssign(false);
    }
  };

  // Confirm auto-assign and select players only
  const handleConfirmAutoAssign = async () => {
    if (!selectedAutoAssignCourt) return;

    try {
      setLoadingConfirmAutoAssign(true);
      // Only select the suggested players
      const playerIds = suggestedPlayers.map((p) => p.id);
      await CourtService.selectPlayers(selectedAutoAssignCourt.id, playerIds);
      // Close modal and reset state
      setAutoAssignModalOpen(false);
      setSelectedAutoAssignCourt(null);
      setSuggestedPlayers([]);
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
      console.error("Error confirming auto-assign:", error);
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

  // Cancel auto-assign modal
  const handleCancelAutoAssign = () => {
    setAutoAssignModalOpen(false);
    setSelectedAutoAssignCourt(null);
    setSuggestedPlayers([]);
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

  // Handle continue from manual selection to preview
  const handleManualSelectionContinue = () => {
    setManualSelectModalOpen(false);
    setShowManualPreview(true);
  };

  // Cancel manual selection
  const handleCancelManualSelection = () => {
    setManualSelectModalOpen(false);
    setSelectedManualCourt(null);
    setManualSelectedPlayers([]);
  };

  // Go back from preview to manual selection
  const handleBackToManualSelection = () => {
    setShowManualPreview(false);
    setManualSelectModalOpen(true);
  };

  // Confirm manual match
  const handleConfirmManualMatch = async () => {
    if (!selectedManualCourt || manualSelectedPlayers.length !== 4) return;

    try {
      setConfirmingManualMatch(true);
      // First select the manually chosen players
      await CourtService.selectPlayers(
        selectedManualCourt.id,
        manualSelectedPlayers
      );
      // Then start the match
      await CourtService.startMatch(selectedManualCourt.id);
      // Close modals and reset state
      setShowManualPreview(false);
      setSelectedManualCourt(null);
      setManualSelectedPlayers([]);
      // Refresh parent data
      if (onDataRefresh) {
        onDataRefresh();
      }
      toast.toast({
        title: t("courtsTab.matchStartedSuccessfully"),
        description: t("courtsTab.playersAssignedToCourt"),
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error confirming manual match:", error);
      toast.toast({
        title: t("courtsTab.errorStartingMatch"),
        description: t("courtsTab.pleaseRetryLater"),
        status: "error",
        duration: 3000,
      });
    } finally {
      setConfirmingManualMatch(false);
    }
  };

  // Cancel manual preview
  const handleCancelManualPreview = () => {
    setShowManualPreview(false);
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
          const isActive = court.status === "IN_USE";
          return (
            <Card key={court.id} variant="outline">
              <CardHeader
                bg={isActive ? "green.50" : "gray.50"}
                p={4}
                borderBottom="1px"
                borderColor={isActive ? "green.200" : "gray.200"}
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading
                    size="md"
                    color={isActive ? "green.700" : "gray.700"}
                  >
                    {t("courtsTab.courtNumber", { number: court.courtNumber })}
                  </Heading>
                  <HStack gap={2}>
                    {currentMatch && (
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
                      colorScheme={isActive ? "green" : "gray"}
                      variant={isActive ? "solid" : "outline"}
                    >
                      {isActive
                        ? currentMatch
                          ? t("courtsTab.inUse")
                          : t("courtsTab.ready")
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
                      status={currentMatch ? "playing" : "ready"}
                    />
                    {/* Show Start Match button if court is IN_USE but no match has started */}
                    {session.status === "IN_PROGRESS" &&
                      mode === "manage" &&
                      !currentMatch &&
                      court.currentPlayers.length === 4 && (
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
                                title: t("courtsTab.matchStartedSuccessfully"),
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
                      )}
                    <VStack gap={2} width="100%">
                      {session.status === "IN_PROGRESS" &&
                        endMatch &&
                        court.currentMatchId &&
                        mode === "manage" && (
                          <CompatButton
                            size="sm"
                            width={{ base: "100%", md: "auto" }}
                            colorScheme="red"
                            onClick={async () => {
                              if (!court.currentMatchId) return;
                              setLoadingEndMatchId(court.currentMatchId);
                              try {
                                await endMatch(court.currentMatchId);
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
        selectedPlayers={suggestedPlayers}
        isLoading={loadingConfirmAutoAssign}
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
        onConfirm={handleManualSelectionContinue}
        onCancel={handleCancelManualSelection}
        formatWaitTime={(minutes) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          if (hours > 0) {
            return `${hours}h ${mins}m`;
          }
          return `${mins}m`;
        }}
      />

      {/* Manual Match Preview Modal */}
      <MatchPreviewModal
        isOpen={showManualPreview}
        court={selectedManualCourt}
        selectedPlayers={waitingPlayers.filter((p) =>
          manualSelectedPlayers.includes(p.id)
        )}
        isLoading={confirmingManualMatch}
        onConfirm={handleConfirmManualMatch}
        onCancel={handleCancelManualPreview}
        onBack={handleBackToManualSelection}
        getCourtDisplayName={getCourtDisplayName}
        title={
          selectedManualCourt
            ? t("courtsTab.manualMatchPreviewTitle", {
                courtNumber: selectedManualCourt.courtNumber,
              })
            : undefined
        }
        description={t("courtsTab.manualMatchPreviewDescription")}
      />
    </>
  );
};

export default CourtsTab;
