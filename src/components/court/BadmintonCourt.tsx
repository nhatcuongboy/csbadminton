"use client";

import { Box, Text } from "@chakra-ui/react";
import { Clock } from "lucide-react";

interface Player {
  id: string;
  playerNumber: number;
  name?: string;
  gender?: string;
  level?: string;
  isCurrentPlayer?: boolean;
}

interface BadmintonCourtProps {
  players: Player[];
  isActive: boolean;
  elapsedTime?: string;
  courtName?: string;
  courtNumber?: number;
  width?: string;
  showTimeInCenter?: boolean;
}

export default function BadmintonCourt({
  players,
  isActive,
  elapsedTime,
  courtName,
  courtNumber,
  width = "100%",
  showTimeInCenter = true,
}: BadmintonCourtProps) {
  // Real court ratio: 13.4m / 6.1m ≈ 2.1967
  const aspectRatio = 13.4 / 6.1;
  return (
    <Box
      width={width}
      aspectRatio={aspectRatio}
      position="relative"
      // bg={isActive ? "#179a3b" : "#e6e6e6"}
      // border="4px solid"
      borderColor={isActive ? "#b6e2c6" : "gray.300"}
      borderRadius="md"
      overflow="hidden"
    >
      {/* Outer boundary */}
      <Box
        position="absolute"
        top="2%"
        left="2%"
        right="2%"
        bottom="2%"
        // border="2px solid #fff"
        // borderRadius="md"
        pointerEvents="none"
        zIndex={1}
        bg={isActive ? "#179a3b" : "#e6e6e6"}
        border="4px solid"
        borderColor={isActive ? "#b6e2c6" : "gray.300"}
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
      {/* Player positions: center of each doubles service box */}
      {players.map((player, index) => {
        // 4 positions: top-left, top-right, bottom-left, bottom-right (centered in each service box)
        const positions = [
          { top: "27%", left: "25%" }, // Top-left
          { top: "27%", right: "10%" }, // Top-right
          { bottom: "0px", left: "25%" }, // Bottom-left
          { bottom: "0px", right: "10%" }, // Bottom-right
        ];
        const position = positions[index] || positions[0];
        return (
          <Box
            key={player.id}
            position="absolute"
            {...position}
            transform="translate(-50%, -50%)"
            bg={player.isCurrentPlayer ? "blue.50" : "white"}
            borderRadius="full"
            border="3px solid"
            borderColor={player.isCurrentPlayer ? "blue.500" : "white"}
            p={2}
            w="60px"
            h="60px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            boxShadow={player.isCurrentPlayer ? "lg" : "md"}
            zIndex={3}
          >
            <Text
              fontSize="xs"
              fontWeight="bold"
              color={player.isCurrentPlayer ? "blue.700" : "#179a3b"}
              lineHeight="1"
            >
              #{player.playerNumber}
            </Text>
            <Text
              fontSize="3xs"
              color={player.isCurrentPlayer ? "blue.600" : "#179a3b"}
              lineHeight="1"
              textAlign="center"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              maxW="50px"
            >
              {player.name?.split(" ")[0] || `P${player.playerNumber}`}
            </Text>
          </Box>
        );
      })}
      {/* Match Time Display - Center */}
      {/* {showTimeInCenter && elapsedTime && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="#2563eb"
          color="white"
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
          {elapsedTime}
        </Box>
      )} */}
      {/* Empty court display */}
      {/* {players.length === 0 && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          color="white"
          fontSize="lg"
          fontWeight="medium"
          zIndex={5}
        >
          Court Empty
        </Box>
      )} */}
    </Box>
  );
}
