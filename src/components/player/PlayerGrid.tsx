"use client";

import { Box, Badge, Flex, Text, VStack } from "@chakra-ui/react";
import { Card, CardBody, SimpleGrid } from "@/components/ui/chakra-compat";
import { Level } from "@/lib/api";
import { getLevelLabel } from "@/utils/level-mapping";

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
  playerFilter: "ALL" | "PLAYING" | "WAITING";
  formatWaitTime: (waitTimeInMinutes: number) => string;
  selectedPlayers?: string[];
  onPlayerToggle?: (playerId: string) => void;
  selectionMode?: boolean;
}

export const PlayerGrid = ({
  players,
  playerFilter,
  formatWaitTime,
  selectedPlayers = [],
  onPlayerToggle,
  selectionMode = false,
}: PlayerGridProps) => {
  // Sort players by player number
  const sortedPlayers = [...players].sort(
    (a, b) => a.playerNumber - b.playerNumber
  );

  return (
    <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
      {sortedPlayers.map((player, index) => {
        // Color scheme based on status and filter
        let bgColor, borderColor, colorScheme;
        const isSelected = selectionMode && selectedPlayers.includes(player.id);

        if (isSelected) {
          // Blue color for selected players
          bgColor = "rgba(59, 130, 246, 0.3)";
          borderColor = "rgba(59, 130, 246, 0.8)";
          colorScheme = "blue";
        } else if (
          playerFilter === "WAITING" ||
          (playerFilter === "ALL" && player.status === "WAITING")
        ) {
          // Orange gradient for waiting players
          const bgOpacity = Math.max(0.1, 1 - index * 0.15);
          const borderOpacity = Math.max(0.3, 1 - index * 0.1);
          bgColor = `rgba(251, 146, 60, ${bgOpacity})`;
          borderColor = `rgba(251, 146, 60, ${borderOpacity})`;
          colorScheme = "orange";
        } else if (player.status === "PLAYING") {
          // Blue for playing players
          bgColor = "rgba(59, 130, 246, 0.1)";
          borderColor = "rgba(59, 130, 246, 0.3)";
          colorScheme = "blue";
        } else {
          // More saturated orange for all status
          bgColor = "rgba(251, 146, 60, 0.3)";
          borderColor = "rgba(251, 146, 60, 0.5)";
          colorScheme = "orange";
        }

        // Priority indicator color (for waiting queue)
        let priorityColor = "gray.300";
        if (
          playerFilter === "WAITING" ||
          (playerFilter === "ALL" && player.status === "WAITING")
        ) {
          if (index === 0) priorityColor = "red.400";
          else if (index === 1) priorityColor = "orange.400";
          else if (index === 2) priorityColor = "yellow.400";
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
              <Box
                position="absolute"
                top={1}
                right={1}
                w={2}
                h={2}
                borderRadius="full"
                bg={priorityColor}
              />

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
                  title={player.name || `Player ${player.playerNumber}`}
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
                    {getLevelLabel(player.level)}
                  </Badge>
                  <Text fontSize="lg" color="gray.600">
                    {player.gender === "MALE"
                      ? "♂"
                      : player.gender === "FEMALE"
                      ? "♀"
                      : ""}
                  </Text>
                </Flex>

                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  {player.matchesPlayed} matches
                  {(playerFilter === "WAITING" ||
                    (playerFilter === "ALL" && player.status === "WAITING")) &&
                    ` • Position ${index + 1}`}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        );
      })}
    </SimpleGrid>
  );
};
