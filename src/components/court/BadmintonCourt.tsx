"use client";

import { Box, Text } from "@chakra-ui/react";
import { Clock, User, UserCheck, Venus, Mars } from "lucide-react";
import React, { useState } from "react";
import { Player } from "@/types/session";

interface BadmintonCourtPlayer extends Player {
  pairNumber?: number; // Add pair number for explicit pair assignment
  isCurrentPlayer?: boolean; // Add highlighting for current player
}

interface BadmintonCourtProps {
  players: BadmintonCourtPlayer[];
  isActive: boolean;
  elapsedTime?: string;
  courtName?: string;
  courtNumber?: number;
  width?: string;
  showTimeInCenter?: boolean;
  isLoading?: boolean;
  status?: "IN_USE" | "READY" | "EMPTY";
}

export default function BadmintonCourt({
  players,
  isActive,
  elapsedTime,
  courtName,
  courtNumber,
  width = "100%",
  showTimeInCenter = true,
  isLoading = false,
  status,
}: BadmintonCourtProps) {
  const [clickedPlayer, setClickedPlayer] = useState<string | null>(null);

  // Real court ratio: 13.4m / 6.1m ≈ 2.1967
  const aspectRatio = 13.4 / 6.1;

  // Helper function to get gender color
  const getGenderColor = (gender?: string) => {
    if (gender === "MALE") return "#3182ce"; // blue
    if (gender === "FEMALE") return "#d53f8c"; // pink
    return "#718096"; // gray for unknown
  };

  // Helper function to get gender icon
  const getGenderIcon = (gender?: string) => {
    if (gender === "MALE") return Mars;
    if (gender === "FEMALE") return Venus;
    return User; // default for unknown
  };

  // Helper function to get pair colors (for visual distinction)
  const getPairColor = (
    player?: BadmintonCourtPlayer,
    playerIndex?: number
  ) => {
    // Use explicit pair number if provided, otherwise assign based on index
    let pairNumber = player?.pairNumber;
    if (!pairNumber && playerIndex !== undefined) {
      // For players without explicit pair assignment, distribute evenly:
      // First 2 players go to pair 1, next 2 to pair 2
      pairNumber = playerIndex < 2 ? 1 : 2;
    } else if (!pairNumber) {
      pairNumber = 1; // fallback
    }

    const pairIndex = pairNumber - 1; // Convert 1,2 to 0,1

    const pairColors = [
      { bg: "blue.50", border: "blue.500", name: "Blue" }, // Pair 1
      { bg: "orange.50", border: "orange.500", name: "Orange" }, // Pair 2
    ];

    return pairColors[pairIndex] || pairColors[0];
  };

  // Helper function to format wait time
  const formatWaitTime = (waitTimeInMinutes?: number) => {
    if (!waitTimeInMinutes) return "0m";
    const hours = Math.floor(waitTimeInMinutes / 60);
    const minutes = waitTimeInMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  return (
    <Box
      width={width}
      aspectRatio={aspectRatio}
      position="relative"
      borderColor={
        status === "READY"
          ? "#facc15" // yellow border for READY
          : status === "IN_USE" || isActive
          ? "#b6e2c6"
          : "gray.300"
      }
      borderRadius="md"
      overflow="visible"
      boxShadow={status === "READY" ? "0 0 0 4px #fef08a" : undefined}
    >
      {/* Outer boundary */}
      <Box
        position="absolute"
        top="2%"
        left="2%"
        right="2%"
        bottom="2%"
        pointerEvents="all"
        zIndex={1}
        bg={
          status === "READY"
            ? "#fef3c7" // light yellow background for READY state
            : status === "IN_USE" || isActive
            ? "#179a3b"
            : "#e6e6e6"
        }
        border="4px solid"
        borderColor={
          status === "READY"
            ? "#facc15" // yellow border for READY
            : status === "IN_USE" || isActive
            ? "#b6e2c6"
            : "gray.300"
        }
        onClick={(e) => {
          e.stopPropagation();
          setClickedPlayer(null);
        }}
      />
      {/* Net (center dashed line) */}
      <Box
        position="absolute"
        top="2%"
        bottom="2%"
        left="50%"
        width="0"
        borderLeft="2px dashed #fff"
        zIndex={2}
      />
      {/* Center horizontal line (across the court, at 50%) */}
      <Box
        position="absolute"
        left="2%"
        right="2%"
        top="50%"
        height="0"
        borderTop="2px solid #fff"
        zIndex={2}
      />
      {/* Top and bottom doubles service lines */}
      <Box
        position="absolute"
        top="10%"
        left="2%"
        right="2%"
        height="0"
        borderTop="2px solid #fff"
        zIndex={2}
      />
      <Box
        position="absolute"
        bottom="10%"
        left="2%"
        right="2%"
        height="0"
        borderTop="2px solid #fff"
        zIndex={2}
      />
      {/* Left and right doubles sidelines */}
      <Box
        position="absolute"
        top="2%"
        bottom="2%"
        left="8%"
        width="0"
        borderLeft="2px solid #fff"
        zIndex={2}
      />
      <Box
        position="absolute"
        top="2%"
        bottom="2%"
        right="8%"
        width="0"
        borderLeft="2px solid #fff"
        zIndex={2}
      />
      {/* Center service lines (vertical, from net to service lines) */}
      <Box
        position="absolute"
        top="2%"
        bottom="50%"
        left="40%"
        width="0"
        borderLeft="2px solid #fff"
        zIndex={2}
      />
      <Box
        position="absolute"
        top="2%"
        bottom="50%"
        right="40%"
        width="0"
        borderLeft="2px solid #fff"
        zIndex={2}
      />
      <Box
        position="absolute"
        top="50%"
        bottom="2%"
        left="40%"
        width="0"
        borderLeft="2px solid #fff"
        zIndex={2}
      />
      <Box
        position="absolute"
        top="50%"
        bottom="2%"
        right="40%"
        width="0"
        borderLeft="2px solid #fff"
        zIndex={2}
      />
      {/* Click outside backdrop to close tooltip */}
      {clickedPlayer && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex={14}
          onClick={() => setClickedPlayer(null)}
        />
      )}

      {/* Player positions: center of each doubles service box */}
      {players &&
        players.length > 0 &&
        players.map((player, index) => {
          // Skip if player is invalid
          if (!player || !player.id) {
            console.warn(`Invalid player at index ${index}:`, player);
            return null;
          }

          // Position players based on their pair number and index within pair
          // Pair 1 (Blue): Top-left (0), Bottom-left (2)
          // Pair 2 (Orange): Top-right (1), Bottom-right (3)

          // If no explicit pair number, assign based on index for proper distribution
          let pairNumber = player.pairNumber;
          if (!pairNumber) {
            // For players without explicit pair assignment, distribute evenly:
            // First 2 players go to pair 1, next 2 to pair 2
            pairNumber = index < 2 ? 1 : 2;
          }

          const playersInPair = players.filter((p, i) => {
            const playerPairNumber = p.pairNumber || (i < 2 ? 1 : 2);
            return playerPairNumber === pairNumber;
          });
          const indexInPair = playersInPair.indexOf(player);

          // Calculate position based on pair number and position within pair
          let positionIndex;
          if (pairNumber === 1) {
            // Pair 1: positions 0 (top-left), 2 (bottom-left)
            positionIndex = indexInPair === 0 ? 0 : 2;
          } else {
            // Pair 2: positions 1 (top-right), 3 (bottom-right)
            positionIndex = indexInPair === 0 ? 1 : 3;
          }

          // Ensure we have a valid position index
          if (positionIndex < 0 || positionIndex > 3) {
            console.warn(
              `Invalid position index ${positionIndex} for player ${player.id}, using fallback`
            );
            positionIndex = index % 4; // Fallback to simple index-based positioning
          }

          // 4 positions: top-left, top-right, bottom-left, bottom-right (centered in each service box)
          const positions = [
            { top: "27%", left: "25%" }, // Top-left (Pair 1, Position 1)
            { top: "27%", right: "10%" }, // Top-right (Pair 2, Position 1)
            { bottom: "0px", left: "25%" }, // Bottom-left (Pair 1, Position 2)
            { bottom: "0px", right: "10%" }, // Bottom-right (Pair 2, Position 2)
          ];
          const position = positions[positionIndex] || positions[0];
          const pairColors = getPairColor(player, index);
          const isClicked = clickedPlayer === player.id;
          const showTooltip = isClicked;

          const GenderIcon = getGenderIcon(player.gender);

          return (
            <Box
              key={player.id}
              position="absolute"
              {...position}
              transform="translate(-50%, -50%)"
              zIndex={3}
            >
              {/* Player Circle */}
              <Box
                bg={player.isCurrentPlayer ? "yellow.100" : pairColors.bg}
                borderRadius="full"
                border="3px solid"
                borderColor={
                  player.isCurrentPlayer ? "yellow.500" : pairColors.border
                }
                p={1}
                w="50px"
                h="50px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                boxShadow={player.isCurrentPlayer ? "lg" : "md"}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  transform: "scale(1.1)",
                  boxShadow: "xl",
                }}
                // onClick={(e) => {
                //   e.stopPropagation();
                //   setClickedPlayer(isClicked ? null : player.id);
                // }}
              >
                {/* Player Number */}
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color={
                    player.isCurrentPlayer ? "yellow.700" : pairColors.border
                  }
                  lineHeight="1"
                  mb={0.5}
                >
                  #{player.playerNumber}
                </Text>

                {/* Gender indicator */}
                <Box
                  bg={getGenderColor(player.gender)}
                  color="white"
                  borderRadius="full"
                  w="16px"
                  h="16px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xs"
                  fontWeight="bold"
                >
                  <Box as={GenderIcon} boxSize="10px" />
                </Box>
              </Box>

              {/* Pair indicator */}
              <Box
                position="absolute"
                top="-8px"
                right="-8px"
                bg={pairColors.border}
                color="white"
                borderRadius="full"
                w="18px"
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="2xs"
                fontWeight="bold"
                border="2px solid white"
                zIndex={4}
              >
                {pairNumber}
              </Box>

              {/* Custom Tooltip */}
              {showTooltip && (
                <>
                  <Box
                    position="absolute"
                    top={positionIndex < 2 ? "60px" : "-140px"}
                    left="50%"
                    transform="translateX(-50%)"
                    bg="gray.800"
                    color="white"
                    p={4}
                    borderRadius="md"
                    boxShadow="xl"
                    fontSize="sm"
                    zIndex={15}
                    minW="240px"
                    maxW="280px"
                    border="1px solid"
                    borderColor="gray.600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Text fontWeight="bold" mb={2} fontSize="md">
                      Player #{player.playerNumber}
                    </Text>

                    <Box mb={2}>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="blue.300"
                      >
                        {player.name || `Player ${player.playerNumber}`}
                      </Text>
                    </Box>

                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Text fontSize="xs" color="gray.300">
                          Gender:
                        </Text>
                        <Text fontSize="xs" color="white">
                          {player.gender || "Unknown"}
                        </Text>
                      </Box>

                      <Box display="flex" justifyContent="space-between">
                        <Text fontSize="xs" color="gray.300">
                          Level:
                        </Text>
                        <Text fontSize="xs" color="white">
                          {player.level || "Unknown"}
                        </Text>
                      </Box>

                      <Box display="flex" justifyContent="space-between">
                        <Text fontSize="xs" color="gray.300">
                          Status:
                        </Text>
                        <Text fontSize="xs" color="white">
                          {player.status || "Unknown"}
                        </Text>
                      </Box>

                      <Box display="flex" justifyContent="space-between">
                        <Text fontSize="xs" color="gray.300">
                          Matches Played:
                        </Text>
                        <Text fontSize="xs" color="white">
                          {player.matchesPlayed || 0}
                        </Text>
                      </Box>

                      <Box display="flex" justifyContent="space-between">
                        <Text fontSize="xs" color="gray.300">
                          Wait Time:
                        </Text>
                        <Text fontSize="xs" color="white">
                          {formatWaitTime(player.currentWaitTime)}
                        </Text>
                      </Box>

                      <Box display="flex" justifyContent="space-between">
                        <Text fontSize="xs" color="gray.300">
                          Pair:
                        </Text>
                        <Text
                          fontSize="xs"
                          color={pairColors.border}
                          fontWeight="bold"
                        >
                          Pair {pairNumber}
                        </Text>
                      </Box>
                    </Box>
                  </Box>

                  {/* Tooltip Arrow */}
                  <Box
                    position="absolute"
                    top={positionIndex < 2 ? "54px" : "-6px"}
                    left="50%"
                    transform="translateX(-50%)"
                    w="0"
                    h="0"
                    borderLeft="6px solid transparent"
                    borderRight="6px solid transparent"
                    borderBottom={positionIndex < 2 ? "6px solid" : "none"}
                    borderTop={positionIndex < 2 ? "none" : "6px solid"}
                    borderBottomColor={
                      positionIndex < 2 ? "gray.800" : "transparent"
                    }
                    borderTopColor={
                      positionIndex < 2 ? "transparent" : "gray.800"
                    }
                    zIndex={16}
                  />
                </>
              )}
            </Box>
          );
        })}

      {/* Loading indicator */}
      {isLoading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="blackAlpha.800"
          color="white"
          px={4}
          py={2}
          borderRadius="full"
          fontSize="sm"
          fontWeight="bold"
          boxShadow="lg"
          zIndex={5}
          display="flex"
          alignItems="center"
          gap={2}
        >
          {/* <Box
            w={3}
            h={3}
            bg="white"
            borderRadius="full"
            animation="pulse 1.5s ease-in-out infinite"
          />
          <Box
            w={3}
            h={3}
            bg="white"
            borderRadius="full"
            animation="pulse 1.5s ease-in-out 0.2s infinite"
          />
          <Box
            w={3}
            h={3}
            bg="white"
            borderRadius="full"
            animation="pulse 1.5s ease-in-out 0.4s infinite"
          /> */}
          <Text ml={2}>Loading...</Text>
        </Box>
      )}

      {/* Match Time/Status Display - Center */}
      {status === "READY" &&
        showTimeInCenter && ( // Only show badge when status is READY
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="#facc15"
            color="#92400e"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
            fontWeight="bold"
            boxShadow="lg"
            zIndex={4}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <Clock size={14} />
            Ready
          </Box>
        )}
    </Box>
  );
}
