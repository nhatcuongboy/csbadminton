"use client";

import { Player } from "@/types/session";
import { Box, Spinner } from "@chakra-ui/react";
import { Clock } from "lucide-react";
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
