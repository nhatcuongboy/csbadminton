"use client";

import { Box, Badge, Flex, Text, VStack, Button } from "@chakra-ui/react";
import { Card, CardBody, SimpleGrid } from "@/components/ui/chakra-compat";
import { Level, SessionService } from "@/lib/api";
import { getLevelLabel } from "@/utils/level-mapping";
import { Mars, Pause, Play, User, UserCheck, Users, Venus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { PlayerDetailModal } from "./PlayerDetailModal";

// Color constants for different player states
const PLAYER_COLORS = {
  SELECTED: {
    bg: "rgba(59, 130, 246, 0.3)",
    border: "rgba(59, 130, 246, 0.8)",
    scheme: "blue",
  },
  READY: {
    bg: "#fae593",
    border: "#fae593",
    scheme: "green",
  },
  WAITING: {
    bg: "rgba(251, 146, 60, 0.9)", // Increased opacity from 0.2 to 0.4
    border: "rgba(251, 146, 60, 0.9)", // Increased opacity from 0.8 to 1 (full)
    scheme: "orange",
  },
  PLAYING: {
    bg: "rgba(72, 187, 120, 0.8)",
    border: "rgba(72, 187, 120, 0.8)",
    scheme: "blue",
  },
  INACTIVE: {
    bg: "rgb(214 216 220)",
    border: "rgb(214 216 220)",
    scheme: "gray",
  },
  DEFAULT: {
    bg: "rgba(251, 146, 60, 0.3)",
    border: "rgba(251, 146, 60, 0.5)",
    scheme: "orange",
  },
};

interface Player {
  id: string;
  playerNumber: number;
  name?: string; // Optional to match API
  gender?: string;
  level?: Level;
  status: string;
  currentWaitTime: number;
  totalWaitTime: number;
  matchesPlayed: number;
  currentCourtId?: string;
  preFilledByHost: boolean;
  confirmedByPlayer: boolean;
}

interface PlayerGridProps {
  players: Player[];
  playerFilter: "ALL" | "PLAYING" | "WAITING" | "READY" | "INACTIVE";
  formatWaitTime: (waitTimeInMinutes: number) => string;
  selectedPlayers?: string[];
  onPlayerToggle?: (playerId: string) => void;
  selectionMode?: boolean;
  mode?: "view" | "manage";
  sessionId?: string;
  onPlayerUpdate?: () => void;
}

export const PlayerGrid = ({
  players,
  playerFilter,
  formatWaitTime,
  selectedPlayers = [],
  onPlayerToggle,
  selectionMode = false,
  mode = "manage",
  sessionId,
  onPlayerUpdate,
}: PlayerGridProps) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    playerId: string;
    playerName: string;
    action: string;
  }>({ isOpen: false, playerId: "", playerName: "", action: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayerForDetail, setSelectedPlayerForDetail] = useState<Player | null>(null);

  const handleToggleInactive = async (playerId: string) => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      await SessionService.togglePlayerInactive(sessionId, playerId);
      onPlayerUpdate?.();
      setConfirmDialog({
        isOpen: false,
        playerId: "",
        playerName: "",
        action: "",
      });
    } catch (error) {
      console.error("Failed to toggle player inactive status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showConfirmDialog = (player: Player) => {
    const action = player.status === "WAITING" ? "pause" : "continue";
    setConfirmDialog({
      isOpen: true,
      playerId: player.id,
      playerName: player.name || `Player ${player.playerNumber}`,
      action,
    });
  };
  return (
    <>
      <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
        {players.map((player, index) => {
          // Color scheme based on status and filter
          let bgColor, borderColor, colorScheme;
          const isSelected =
            selectionMode && selectedPlayers.includes(player.id);

          if (isSelected) {
            // Blue color for selected players
            bgColor = PLAYER_COLORS.SELECTED.bg;
            borderColor = PLAYER_COLORS.SELECTED.border;
            colorScheme = PLAYER_COLORS.SELECTED.scheme;
          } else if (
            playerFilter === "READY" ||
            (playerFilter === "ALL" && player.status === "READY")
          ) {
            // Green for ready players
            bgColor = PLAYER_COLORS.READY.bg;
            borderColor = PLAYER_COLORS.READY.border;
            colorScheme = PLAYER_COLORS.READY.scheme;
          } else if (
            playerFilter === "WAITING" ||
            (playerFilter === "ALL" && player.status === "WAITING")
          ) {
            // Orange color for waiting players (increased intensity)
            bgColor = PLAYER_COLORS.WAITING.bg;
            borderColor = PLAYER_COLORS.WAITING.border;
            colorScheme = PLAYER_COLORS.WAITING.scheme;
          } else if (player.status === "PLAYING") {
            // Blue for playing players
            bgColor = PLAYER_COLORS.PLAYING.bg;
            borderColor = PLAYER_COLORS.PLAYING.border;
            colorScheme = PLAYER_COLORS.PLAYING.scheme;
          } else if (player.status === "INACTIVE") {
            // Gray for inactive players
            bgColor = PLAYER_COLORS.INACTIVE.bg;
            borderColor = PLAYER_COLORS.INACTIVE.border;
            colorScheme = PLAYER_COLORS.INACTIVE.scheme;
          } else {
            // Default color for other statuses
            bgColor = PLAYER_COLORS.DEFAULT.bg;
            borderColor = PLAYER_COLORS.DEFAULT.border;
            colorScheme = PLAYER_COLORS.DEFAULT.scheme;
          }

          // Priority indicator color (for waiting queue)
          let priorityColor = "gray.300";
          if (
            playerFilter === "WAITING" ||
            (playerFilter === "ALL" && player.status === "WAITING")
          ) {
            if (index < 4) priorityColor = "red.400";
          }

          return (
            <Card
              key={player.id}
              variant="outline"
              size="sm"
              borderRadius="md"
              borderWidth="2px"
              borderColor={borderColor}
              bg={bgColor}
              transition="all 0.2s"
              minH="140px"
              position="relative"
              cursor={selectionMode || mode === "manage" ? "pointer" : "default"}
              onClick={
                selectionMode 
                  ? () => onPlayerToggle?.(player.id) 
                  : mode === "manage" 
                  ? () => setSelectedPlayerForDetail(player)
                  : undefined
              }
              _hover={
                selectionMode || mode === "manage"
                  ? { transform: "scale(1.02)", boxShadow: "lg" }
                  : undefined
              }
            >
              <CardBody p={3} position="relative">
                {/* Priority indicator (top right) */}
                {/* <Box
                position="absolute"
                top={1}
                right={1}
                w={2}
                h={2}
                borderRadius="full"
                bg={priorityColor}
              /> */}

                {/* Selection indicator (top left) */}
                {selectionMode && isSelected && (
                  <Box
                    position="absolute"
                    top={1}
                    left={1}
                    w={4}
                    h={4}
                    borderRadius="full"
                    bg="blue.500"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    ✓
                  </Box>
                )}

                <VStack gap={2} align="start">
                  <Flex
                    justifyContent="space-between"
                    width="100%"
                    alignItems="start"
                  >
                    <Text fontWeight="bold" color="orange.700" fontSize="md">
                      #{player.playerNumber}
                    </Text>
                    {(player.status === "WAITING" ||
                      player.status === "READY") && (
                      <Badge
                        colorPalette={
                          player.currentWaitTime > 15
                            ? "red"
                            : player.currentWaitTime > 10
                            ? "yellow"
                            : "gray"
                        }
                        variant="solid"
                        fontSize="xs"
                        borderRadius="md"
                      >
                        {formatWaitTime(player.currentWaitTime)}
                      </Badge>
                    )}
                  </Flex>

                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    color="gray.800"
                    title={player.name || `Player ${player.playerNumber}`}
                  >
                    {player.name || `Player ${player.playerNumber}`}
                  </Text>

                  <Flex
                    // justifyContent="space-between"
                    width="100%"
                    alignItems="center"
                    gap={3}
                  >
                    {mode === "manage" && (
                      <Badge
                        variant="outline"
                        // colorPalette={"purple"}
                        background={"whiteAlpha.800"}
                        fontSize="xs"
                        borderRadius="sm"
                      >
                        {getLevelLabel(player.level)}
                      </Badge>
                    )}
                    <Badge
                      variant="solid"
                      colorPalette={
                        player.gender === "MALE"
                          ? "blue"
                          : player.gender === "FEMALE"
                          ? "pink"
                          : player.gender === "OTHER"
                          ? "purple"
                          : "gray"
                      }
                      fontSize="xs"
                      borderRadius="sm"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      {player.gender === "MALE" ? (
                        <Mars size={12} />
                      ) : player.gender === "FEMALE" ? (
                        <Venus size={12} />
                      ) : player.gender === "OTHER" ? (
                        <Users size={12} />
                      ) : (
                        <User size={12} />
                      )}
                    </Badge>
                  </Flex>

                  <Text fontSize="xs" color="gray.600" fontWeight="medium">
                    {player.matchesPlayed} matches
                  </Text>
                </VStack>

                {/* Pause/Continue Button */}
                {mode === "manage" &&
                  sessionId &&
                  (player.status === "WAITING" ||
                    player.status === "INACTIVE") && (
                    <Box position="absolute" bottom={2} right={2}>
                      <Button
                        size="xs"
                        colorPalette={
                          player.status === "WAITING" ? "red" : "gray"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirmDialog(player);
                        }}
                      >
                        {player.status === "WAITING" ? <Pause /> : <Play />}
                      </Button>
                    </Box>
                  )}
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
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
          onClick={() =>
            setConfirmDialog({
              isOpen: false,
              playerId: "",
              playerName: "",
              action: "",
            })
          }
        >
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="xl"
            p={6}
            maxW="md"
            mx={4}
            onClick={(e) => e.stopPropagation()}
          >
            <Text fontWeight="bold" mb={4}>
              {confirmDialog.action === "pause"
                ? "Pause Player"
                : "Continue Player"}
            </Text>
            <Text mb={6} color="gray.600">
              Are you sure you want to {confirmDialog.action}{" "}
              {confirmDialog.playerName}?
            </Text>
            <Flex gap={3} justifyContent="flex-end">
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() =>
                  setConfirmDialog({
                    isOpen: false,
                    playerId: "",
                    playerName: "",
                    action: "",
                  })
                }
              >
                Cancel
              </Button>
              <Button
                colorScheme={confirmDialog.action === "pause" ? "red" : "green"}
                loading={isLoading}
                onClick={() => handleToggleInactive(confirmDialog.playerId)}
              >
                {confirmDialog.action === "pause" ? "Pause" : "Continue"}
              </Button>
            </Flex>
          </Box>
        </Box>
      )}

      {/* Player Detail Modal */}
      {selectedPlayerForDetail && (
        <PlayerDetailModal
          isOpen={!!selectedPlayerForDetail}
          onClose={() => setSelectedPlayerForDetail(null)}
          player={selectedPlayerForDetail}
          sessionId={sessionId}
          formatWaitTime={formatWaitTime}
        />
      )}
    </>
  );
};
