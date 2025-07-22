"use client";

import { Box, Badge, Flex, Text, VStack } from "@chakra-ui/react";
import { Card, CardBody, SimpleGrid } from "@/components/ui/chakra-compat";
import { Level } from "@/lib/api";
import { getLevelLabel } from "@/utils/level-mapping";

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
  playerFilter: "ALL" | "PLAYING" | "WAITING" | "READY";
  formatWaitTime: (waitTimeInMinutes: number) => string;
  selectedPlayers?: string[];
  onPlayerToggle?: (playerId: string) => void;
  selectionMode?: boolean;
  mode?: "view" | "manage";
}

export const PlayerGrid = ({
  players,
  playerFilter,
  formatWaitTime,
  selectedPlayers = [],
  onPlayerToggle,
  selectionMode = false,
  mode = "manage",
}: PlayerGridProps) => {
  return (
    <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
      {players.map((player, index) => {
        // Color scheme based on status and filter
        let bgColor, borderColor, colorScheme;
        const isSelected = selectionMode && selectedPlayers.includes(player.id);

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
            cursor={selectionMode ? "pointer" : "default"}
            onClick={
              selectionMode ? () => onPlayerToggle?.(player.id) : undefined
            }
            _hover={
              selectionMode
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
                  justifyContent="space-between"
                  width="100%"
                  alignItems="center"
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
                  <Text fontSize="lg" color="white.600">
                    {player.gender === "MALE"
                      ? "♂"
                      : player.gender === "FEMALE"
                      ? "♀"
                      : ""}
                  </Text>
                </Flex>

                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  {player.matchesPlayed} matches
                </Text>
              </VStack>
            </CardBody>
          </Card>
        );
      })}
    </SimpleGrid>
  );
};
