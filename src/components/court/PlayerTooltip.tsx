"use client";

import { Player } from "@/types/session";
import { getLevelLabel } from "@/utils/level-mapping";
import { Box, Text, Portal } from "@chakra-ui/react";

interface BadmintonCourtPlayer extends Player {
  pairNumber?: number;
  isCurrentPlayer?: boolean;
  desire?: string;
  levelDescription?: string;
}

function formatWaitTime(waitTimeInMinutes?: number): string {
  if (!waitTimeInMinutes) return "0m";
  const hours = Math.floor(waitTimeInMinutes / 60);
  const minutes = waitTimeInMinutes % 60;
  if (hours > 0) {
    return `${hours}h${minutes}m`;
  }
  return `${minutes}m`;
}

function getPairColor(player?: BadmintonCourtPlayer, playerIndex?: number) {
  let pairNumber = player?.pairNumber;
  if (!pairNumber && playerIndex !== undefined) {
    pairNumber = playerIndex < 2 ? 1 : 2;
  } else if (!pairNumber) {
    pairNumber = 1;
  }
  const pairIndex = pairNumber - 1;
  const pairColors = [
    { bg: "blue.50", border: "blue.500", name: "Blue" },
    { bg: "orange.50", border: "orange.500", name: "Orange" },
  ];
  return pairColors[pairIndex] || pairColors[0];
}

interface PlayerTooltipProps {
  player: BadmintonCourtPlayer;
  index: number;
  isVisible: boolean;
  position: { left: string; top: string };
  mode?: "manage" | "view";
}

export default function PlayerTooltip({
  player,
  index,
  isVisible,
  position,
  mode = "manage",
}: PlayerTooltipProps) {
  if (!isVisible) return null;

  // Calculate player's pair info
  let pairNumber = player.pairNumber;
  if (!pairNumber) {
    pairNumber = index < 2 ? 1 : 2;
  }
  const pairColors = getPairColor(player, index);

  return (
    <Portal>
      <Box
        position="fixed"
        {...position}
        bg="gray.800"
        color="white"
        borderRadius="md"
        boxShadow="xl"
        fontSize="sm"
        zIndex={9999}
        minW="240px"
        maxW="280px"
        p={3}
      >
        <Text fontWeight="bold" mb={2} fontSize="md">
          Player #{player.playerNumber}
        </Text>
        <Box mb={2}>
          <Text fontSize="sm" fontWeight="semibold" color="blue.300">
            {player.name || `Player ${player.playerNumber}`}
          </Text>
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          {/* Gender - Always show */}
          <Box display="flex" justifyContent="space-between">
            <Text fontSize="xs" color="gray.300">
              Gender:
            </Text>
            <Text fontSize="xs" color="white">
              {player.gender || "Unknown"}
            </Text>
          </Box>

          {/* Level, Level Description, Desire - Only show in manage mode */}
          {mode === "manage" && (
            <>
              {/* Level */}
              <Box display="flex" justifyContent="space-between">
                <Text fontSize="xs" color="gray.300">
                  Level:
                </Text>
                <Text fontSize="xs" color="white">
                  {getLevelLabel(player.level, "Unknown")}
                </Text>
              </Box>
              {/* Level Description */}
              {player.levelDescription && (
                <Box display="flex" justifyContent="space-between">
                  <Text fontSize="xs" color="gray.300">
                    Level Description:
                  </Text>
                  <Text
                    fontSize="xs"
                    color="white"
                    maxW="150px"
                    textAlign="right"
                  >
                    {player.levelDescription}
                  </Text>
                </Box>
              )}
              {/* Desire */}
              {player.desire && (
                <Box display="flex" justifyContent="space-between">
                  <Text fontSize="xs" color="gray.300">
                    Desire:
                  </Text>
                  <Text
                    fontSize="xs"
                    color="white"
                    maxW="150px"
                    textAlign="right"
                  >
                    {player.desire}
                  </Text>
                </Box>
              )}
            </>
          )}

          <Box display="flex" justifyContent="space-between">
            <Text fontSize="xs" color="gray.300">
              Matches Played:
            </Text>
            <Text fontSize="xs" color="white">
              {player.matchesPlayed || 0}
            </Text>
          </Box>

          {mode === "manage" &&
            ["WAITING", "READY"].includes(player.status) && (
              <Box display="flex" justifyContent="space-between">
                <Text fontSize="xs" color="gray.300">
                  Wait Time:
                </Text>
                <Text fontSize="xs" color="white">
                  {formatWaitTime(player.currentWaitTime)}
                </Text>
              </Box>
            )}

          {/* Pair - Always show */}
          <Box display="flex" justifyContent="space-between">
            <Text fontSize="xs" color="gray.300">
              Pair:
            </Text>
            <Text fontSize="xs" color={pairColors.border} fontWeight="bold">
              Pair {pairNumber}
            </Text>
          </Box>
        </Box>
      </Box>
    </Portal>
  );
}

// Export types for reuse
export type { BadmintonCourtPlayer };
