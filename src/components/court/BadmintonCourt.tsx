"use client";

import { CourtDirection } from "@/lib/api";
import { Box, Spinner } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import CourtPlayer, { BadmintonCourtPlayer } from "./CourtPlayer";

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
  mode?: "manage" | "view" | "selection";
  courtColor?: string;
  // Selection mode props
  onPlayerSelect?: (player: BadmintonCourtPlayer, position: number) => void;
  onPlayerRemove?: (position: number) => void;
  currentPlayerPosition?: number; // 0-3, which position is currently being selected
  selectedPositions?: (BadmintonCourtPlayer | undefined)[]; // For selection mode
  direction?: CourtDirection; // Layout direction from API
  preSelectedPlayers?: Array<{
    playerId: string;
    position: number;
    player?: BadmintonCourtPlayer;
  }>; // Pre-selected players for next match
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
  onPlayerSelect,
  onPlayerRemove,
  currentPlayerPosition = 0,
  selectedPositions = [],
  direction = CourtDirection.HORIZONTAL,
  preSelectedPlayers = [],
}: BadmintonCourtProps) {
  const t = useTranslations("SessionDetail");
  const [clickedPlayer, setClickedPlayer] = useState<string | null>(null);
  const aspectRatio = 13.4 / 6.1;

  // Create placeholder players for selection mode
  const getDisplayPlayers = () => {
    if (mode !== "selection") {
      // For manage/view modes, sort players by their courtPosition if available
      const sortedPlayers = [...players].sort((a, b) => {
        const posA = a.courtPosition ?? 0;
        const posB = b.courtPosition ?? 0;
        return posA - posB;
      });

      // Visual mapping based on direction prop
      let visualMapping: number[];
      if (direction === CourtDirection.HORIZONTAL) {
        // Horizontal layout (columns first)
        // API position 0 → Visual index 0 (top-left)
        // API position 1 → Visual index 2 (bottom-left)
        // API position 2 → Visual index 1 (top-right)
        // API position 3 → Visual index 3 (bottom-right)
        visualMapping = [0, 2, 1, 3];
      } else {
        // Vertical layout (rows first)
        // API position 0 → Visual index 0 (top-left)
        // API position 1 → Visual index 1 (top-right)
        // API position 2 → Visual index 2 (bottom-left)
        // API position 3 → Visual index 3 (bottom-right)
        visualMapping = [0, 1, 2, 3];
      }
      const remappedPlayers: (BadmintonCourtPlayer | null)[] = [
        null,
        null,
        null,
        null,
      ];

      sortedPlayers.forEach((player, index) => {
        const visualIndex = visualMapping[index] ?? index;
        if (visualIndex < 4) {
          const pairNumber = visualIndex % 2 === 0 ? 1 : 2;
          remappedPlayers[visualIndex] = {
            ...player,
            // pairNumber, // Left column = pair 1, right column = pair 2
          };
        }
      });

      return remappedPlayers.filter(Boolean) as BadmintonCourtPlayer[];
    }

    // In selection mode, use selectedPositions array
    // Apply same visual mapping based on direction
    const displayPlayers: (BadmintonCourtPlayer | null)[] = [
      null,
      null,
      null,
      null,
    ];

    let mapping: number[];
    if (direction === CourtDirection.HORIZONTAL) {
      mapping = [0, 2, 1, 3];
    } else {
      mapping = [0, 1, 2, 3];
    }

    selectedPositions.forEach((player, i) => {
      const mappedIndex = mapping[i];
      if (mappedIndex < 4 && player) {
        // Assign pair by column: left (0,2) = pair 1, right (1,3) = pair 2
        const pairNumber = mappedIndex % 2 === 0 ? 1 : 2;
        const courtPlayer: BadmintonCourtPlayer = {
          ...player,
          pairNumber,
          // Highlight by selection order, not visual index
          isCurrentPlayer: i === currentPlayerPosition,
        };
        displayPlayers[mappedIndex] = courtPlayer;
      }
    });
    return displayPlayers;
  };

  const displayPlayers = getDisplayPlayers();

  // Handle player removal in selection mode
  const handlePlayerRemove = (position: number) => {
    if (mode === "selection" && onPlayerRemove) {
      onPlayerRemove(position);
    }
  };

  return (
    <Box
      width={width}
      aspectRatio={aspectRatio}
      position="relative"
      borderColor={
        status === "READY"
          ? "#facc15" // yellow border for READY
          : status === "IN_USE" || isActive || mode === "selection"
          ? "#b6e2c6" // green border for active courts and selection mode
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
            : status === "IN_USE" || isActive || mode === "selection"
            ? courtColor // use prop for active courts and selection mode
            : "#e6e6e6"
        }
        border="4px solid"
        borderColor={
          status === "READY"
            ? "#facc15" // yellow border for READY
            : status === "IN_USE" || isActive || mode === "selection"
            ? "#b6e2c6" // green border for active courts and selection mode
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
      {mode === "selection"
        ? // Selection mode: Show placeholders and highlight current position
          displayPlayers.map((player, index) => {
            if (player) {
              // Render actual player
              return (
                <CourtPlayer
                  key={`player-${index}-${player.id}`}
                  player={{
                    ...player,
                    isCurrentPlayer: index === currentPlayerPosition,
                  }}
                  index={index}
                  players={
                    displayPlayers.filter(Boolean) as BadmintonCourtPlayer[]
                  }
                  mode={mode}
                  isClicked={clickedPlayer === player.id}
                  onPlayerClick={setClickedPlayer}
                  onRemovePlayer={handlePlayerRemove}
                />
              );
            } else {
              // Render placeholder for empty position
              // Map index back to selection order for correct number
              let reverseMapping: number[];
              if (direction === CourtDirection.HORIZONTAL) {
                reverseMapping = [0, 2, 1, 3];
              } else {
                reverseMapping = [0, 1, 2, 3];
              }
              const selectionOrder = reverseMapping.findIndex(
                (v) => v === index
              );
              return (
                <Box
                  key={`placeholder-${index}`}
                  position="absolute"
                  {...(() => {
                    const positions = [
                      { top: "30%", left: "25%" }, // Top-left
                      { top: "30%", left: "75%" }, // Top-right
                      { top: "72%", left: "25%" }, // Bottom-left
                      { top: "72%", left: "75%" }, // Bottom-right
                    ];
                    return positions[index];
                  })()}
                  transform="translate(-50%, -50%)"
                  zIndex={3}
                >
                  <Box
                    position="relative"
                    bg={
                      selectionOrder === currentPlayerPosition
                        ? "yellow.100"
                        : "gray.100"
                    }
                    borderRadius="full"
                    border="3px dashed"
                    borderColor={
                      selectionOrder === currentPlayerPosition
                        ? "yellow.500"
                        : "gray.400"
                    }
                    w="50px"
                    h="50px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow={
                      selectionOrder === currentPlayerPosition ? "lg" : "sm"
                    }
                    transition="all 0.3s"
                    _hover={{
                      transform:
                        selectionOrder === currentPlayerPosition
                          ? "scale(1.1)"
                          : "scale(1.05)",
                    }}
                  >
                    {selectionOrder === currentPlayerPosition && (
                      <>
                        {/* Pulsing effect for current position */}
                        <Box
                          position="absolute"
                          top="-4px"
                          left="-4px"
                          right="-4px"
                          bottom="-4px"
                          borderRadius="full"
                          border="2px solid"
                          borderColor="yellow.500"
                          animation="currentPositionPulse 2s infinite"
                          pointerEvents="none"
                        />
                        <style jsx>{`
                          @keyframes currentPositionPulse {
                            0% {
                              transform: scale(1);
                              opacity: 1;
                            }
                            50% {
                              transform: scale(1.2);
                              opacity: 0.7;
                            }
                            100% {
                              transform: scale(1);
                              opacity: 1;
                            }
                          }
                        `}</style>
                      </>
                    )}
                    <Box
                      fontSize="lg"
                      fontWeight="bold"
                      color={
                        index === currentPlayerPosition
                          ? "yellow.700"
                          : "gray.500"
                      }
                    >
                      {selectionOrder + 1}
                    </Box>
                  </Box>
                </Box>
              );
            }
          })
        : // Normal mode: Render actual players from displayPlayers (sorted by courtPosition)
          displayPlayers &&
          displayPlayers.length > 0 &&
          (displayPlayers.filter(Boolean) as BadmintonCourtPlayer[]).map(
            (player, index) => (
              <CourtPlayer
                key={player.id}
                player={player}
                index={index}
                players={
                  displayPlayers.filter(Boolean) as BadmintonCourtPlayer[]
                }
                mode={mode}
                isClicked={clickedPlayer === player.id}
                onPlayerClick={setClickedPlayer}
              />
            )
          )}
      )
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
    </Box>
  );
}
