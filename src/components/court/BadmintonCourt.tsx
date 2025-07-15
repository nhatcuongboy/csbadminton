"use client";

import { Player } from "@/types/session";
import { getLevelLabel } from "@/utils/level-mapping";
import { Box, Text, Portal, Spinner } from "@chakra-ui/react";
import { Clock, Mars, User, Venus } from "lucide-react";
import { useState, useRef } from "react";

interface BadmintonCourtPlayer extends Player {
  pairNumber?: number; // Add pair number for explicit pair assignment
  isCurrentPlayer?: boolean; // Add highlighting for current player
}

// Helper functions
function getGenderColor(gender?: string): string {
  if (gender === "MALE") return "#3182ce";
  if (gender === "FEMALE") return "#d53f8c";
  return "#718096";
}

function getGenderIcon(gender?: string) {
  if (gender === "MALE") return Mars;
  if (gender === "FEMALE") return Venus;
  return User;
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

function formatWaitTime(waitTimeInMinutes?: number): string {
  if (!waitTimeInMinutes) return "0m";
  const hours = Math.floor(waitTimeInMinutes / 60);
  const minutes = waitTimeInMinutes % 60;
  if (hours > 0) {
    return `${hours}h${minutes}m`;
  }
  return `${minutes}m`;
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
  mode?: "manage" | "view";
  courtColor?: string;
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
  mode = "manage",
  courtColor = "#179a3b",
}: BadmintonCourtProps) {
  const [clickedPlayer, setClickedPlayer] = useState<string | null>(null);
  const aspectRatio = 13.4 / 6.1;
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
      // boxShadow={status === "READY" ? "0 0 0 4px #fef08a" : undefined}
    >
      {/* Outer boundary */}
      <Box
        position="absolute"
        top="0%"
        left="0%"
        right="0%"
        bottom="0%"
        pointerEvents="all"
        zIndex={1}
        bg={
          status === "READY"
            ? "#fef3c7" // light yellow background for READY state
            : status === "IN_USE" || isActive
            ? courtColor // use prop
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
        top="0%"
        bottom="0%"
        left="50%"
        width="0"
        borderLeft="2px dashed #fff"
        zIndex={2}
      />
      {/* Center horizontal line (across the court, at 50%) */}
      <Box
        position="absolute"
        left="0%"
        right="0%"
        top="50%"
        height="0"
        borderTop="2px solid #fff"
        zIndex={2}
      />
      {/* Top and bottom doubles service lines */}
      <Box
        position="absolute"
        top="10%"
        left="0%"
        right="0%"
        height="0"
        borderTop="2px solid #fff"
        zIndex={2}
      />
      <Box
        position="absolute"
        bottom="10%"
        left="0%"
        right="0%"
        height="0"
        borderTop="2px solid #fff"
        zIndex={2}
      />
      {/* Left and right doubles sidelines */}
      <Box
        position="absolute"
        top="0%"
        bottom="0%"
        left="8%"
        width="0"
        borderLeft="2px solid #fff"
        zIndex={2}
      />
      <Box
        position="absolute"
        top="0%"
        bottom="0%"
        right="8%"
        width="0"
        borderLeft="2px solid #fff"
        zIndex={2}
      />
      {/* Center service lines (vertical, from net to service lines) */}
      <Box
        position="absolute"
        top="0%"
        bottom="50%"
        left="40%"
        width="0"
        borderLeft="2px solid #fff"
        zIndex={2}
      />
      <Box
        position="absolute"
        top="0%"
        bottom="50%"
        right="40%"
        width="0"
        borderLeft="2px solid #fff"
        zIndex={2}
      />
      <Box
        position="absolute"
        top="50%"
        bottom="0%"
        left="40%"
        width="0"
        borderLeft="2px solid #fff"
        zIndex={2}
      />
      <Box
        position="absolute"
        top="50%"
        bottom="0%"
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
          zIndex={9998}
          onClick={() => setClickedPlayer(null)}
        />
      )}

      {/* Player positions: center of each doubles service box */}
      {players &&
        players.length > 0 &&
        players.map((player, index) => (
          <CourtPlayer
            key={player.id}
            player={player}
            index={index}
            players={players}
            mode={mode}
            isClicked={clickedPlayer === player.id}
            onPlayerClick={setClickedPlayer}
          />
        ))}

      {/* Loading indicator */}
      {isLoading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="blackAlpha.800"
          color="white"
          px={2}
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
          <Spinner size="md" />
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
            zIndex={2}
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

// CourtPlayer component
interface CourtPlayerProps {
  player: BadmintonCourtPlayer;
  index: number;
  players: BadmintonCourtPlayer[];
  mode: "manage" | "view";
  isClicked: boolean;
  onPlayerClick: (id: string | null) => void;
}

function CourtPlayer({
  player,
  index,
  players,
  mode,
  isClicked,
  onPlayerClick,
}: CourtPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);

  // Skip if player is invalid
  if (!player || !player.id) {
    console.warn(`Invalid player at index ${index}:`, player);
    return null;
  }

  // Calculate player position
  let pairNumber = player.pairNumber;
  if (!pairNumber) {
    pairNumber = index < 2 ? 1 : 2;
  }

  const playersInPair = players.filter((p, i) => {
    const playerPairNumber = p.pairNumber || (i < 2 ? 1 : 2);
    return playerPairNumber === pairNumber;
  });
  const indexInPair = playersInPair.indexOf(player);

  let positionIndex;
  if (pairNumber === 1) {
    positionIndex = indexInPair === 0 ? 0 : 2;
  } else {
    positionIndex = indexInPair === 0 ? 1 : 3;
  }

  if (positionIndex < 0 || positionIndex > 3) {
    console.warn(
      `Invalid position index ${positionIndex} for player ${player.id}, using fallback`
    );
    positionIndex = index % 4;
  }

  // Calculate positions: 4 centers of 4 equal parts of the court
  // Each part: width 50%, height 50%
  // Centers: (25%,25%), (25%,75%), (75%,25%), (75%,75%)
  const positions = [
    { top: "30%", left: "25%" }, // Top-left
    { top: "30%", left: "75%" }, // Top-right
    { top: "72%", left: "25%" }, // Bottom-left
    { top: "72%", left: "75%" }, // Bottom-right
  ];
  const position = positions[positionIndex] || positions[0];
  const pairColors = getPairColor(player, index);
  const GenderIcon = getGenderIcon(player.gender);

  // Calculate tooltip position based on player position
  const getTooltipPosition = () => {
    if (!playerRef.current) return { left: "50%", top: "50%" };

    const rect = playerRef.current.getBoundingClientRect();
    const tooltipWidth = 280; // maxW="280px"
    const tooltipHeight = 200; // approximate height

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    let top = rect.top - tooltipHeight - 10; // 10px gap above player

    // Adjust if tooltip goes outside viewport
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    if (top < 10) {
      // If not enough space above, show below
      top = rect.bottom + 10;
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  };

  return (
    <>
      <Box
        ref={playerRef}
        position="absolute"
        {...position}
        transform="translate(-50%, -50%)"
        zIndex={3}
      >
        <Box
          position="relative"
          bg={pairColors.bg}
          borderRadius="full"
          border="3px solid"
          borderColor={pairColors.border}
          p={1}
          w="50px"
          h="50px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          boxShadow="md"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            transform: "scale(1.1)",
            boxShadow: "xl",
          }}
          zIndex={2}
          onClick={(e) => {
            e.stopPropagation();
            onPlayerClick(isClicked ? null : player.id);
          }}
        >
          {/* Current player effect */}
          {player.isCurrentPlayer && (
            <Box
              position="absolute"
              top="-4px"
              left="-4px"
              right="-4px"
              bottom="-4px"
              borderRadius="full"
              boxShadow="0 0 0 8px #fef08a99, 0 0 16px 0 #facc15"
              zIndex={2}
              pointerEvents="none"
              animation="currentPlayerPulse 1.5s infinite"
            />
          )}
          <style jsx global>{`
            @keyframes currentPlayerPulse {
              0% {
                box-shadow: 0 0 0 4px #fef08a99, 0 0 8px 0 #facc15;
              }
              50% {
                box-shadow: 0 0 0 8px #fef08a44, 0 0 16px 0 #facc15;
              }
              100% {
                box-shadow: 0 0 0 4px #fef08a99, 0 0 8px 0 #facc15;
              }
            }
          `}</style>
          {/* Player Number */}
          <Text
            fontSize="xs"
            fontWeight="bold"
            color={player.isCurrentPlayer ? "yellow.700" : pairColors.border}
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

        {mode === "manage" && (
          <Box
            position="absolute"
            top="-10px"
            right="-12px"
            bg={pairColors.border}
            color="white"
            borderRadius="full"
            w="35px"
            h="22px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xs"
            fontWeight="bold"
            border="2px solid white"
            zIndex={4}
          >
            {getLevelLabel(player.level, "?")}
          </Box>
        )}
      </Box>

      {/* Tooltip rendered using Portal */}
      {isClicked && (
        <Portal>
          <Box
            position="fixed"
            {...getTooltipPosition()}
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
                  {getLevelLabel(player.level, "Unknown")}
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
                <Text fontSize="xs" color={pairColors.border} fontWeight="bold">
                  Pair {pairNumber}
                </Text>
              </Box>
            </Box>
          </Box>
        </Portal>
      )}
    </>
  );
}
