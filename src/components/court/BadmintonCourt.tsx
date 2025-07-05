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
  height?: string;
  showTimeInCenter?: boolean;
}

export default function BadmintonCourt({
  players,
  isActive,
  elapsedTime,
  courtName,
  courtNumber,
  width = "100%",
  height = "180px",
  showTimeInCenter = true,
}: BadmintonCourtProps) {
  return (
    <Box
      position="relative"
      width={width}
      height={height}
      bg={isActive ? "green.50" : "gray.50"}
      border="2px solid"
      borderColor={isActive ? "green.300" : "gray.300"}
      borderRadius="md"
      overflow="hidden"
    >
      {/* Court Number and Name Display - Top Left */}
      {(courtNumber || courtName) && (
        <Box
          position="absolute"
          top="8px"
          left="8px"
          display="flex"
          alignItems="center"
          gap={2}
          zIndex={3}
        >
          {courtNumber && (
            <Box
              bg="blue.500"
              color="white"
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
              fontWeight="bold"
              boxShadow="sm"
            >
              Court {courtNumber}
            </Box>
          )}
        </Box>
      )}

      {/* Match Time Display - Center */}
      {showTimeInCenter && elapsedTime && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="blue.500"
          color="white"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="sm"
          fontWeight="bold"
          boxShadow="lg"
          zIndex={3}
          display="flex"
          alignItems="center"
          gap={1}
        >
          <Clock size={14} />
          {elapsedTime}
        </Box>
      )}

      {/* Court lines */}
      {/* Center net line */}
      <Box
        position="absolute"
        top="0"
        left="50%"
        transform="translateX(-50%)"
        width="2px"
        height="100%"
        bg={isActive ? "green.400" : "gray.400"}
        zIndex={1}
      />

      {/* Service lines */}
      <Box
        position="absolute"
        top="25%"
        left="0"
        right="0"
        height="1px"
        bg={isActive ? "green.300" : "gray.300"}
      />
      <Box
        position="absolute"
        bottom="25%"
        left="0"
        right="0"
        height="1px"
        bg={isActive ? "green.300" : "gray.300"}
      />

      {/* Side service lines */}
      <Box
        position="absolute"
        top="25%"
        bottom="25%"
        left="20%"
        width="1px"
        bg={isActive ? "green.300" : "gray.300"}
      />
      <Box
        position="absolute"
        top="25%"
        bottom="25%"
        right="20%"
        width="1px"
        bg={isActive ? "green.300" : "gray.300"}
      />

      {/* Players positioned on court - symmetrical positions */}
      {players.map((player, index) => {
        // Position players symmetrically around the court
        const positions = [
          { top: "25%", left: "20%" }, // Top-left
          { top: "25%", right: "0" }, // Top-right
          { bottom: "-20px", left: "20%" }, // Bottom-left
          { bottom: "-20px", right: "0" }, // Bottom-right
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
            borderColor={player.isCurrentPlayer ? "blue.500" : "green.500"}
            p={2}
            w="70px"
            h="70px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            boxShadow={player.isCurrentPlayer ? "lg" : "md"}
            zIndex={2}
            _before={
              player.isCurrentPlayer
                ? {
                    content: '""',
                    position: "absolute",
                    top: "-2px",
                    left: "-2px",
                    right: "-2px",
                    bottom: "-2px",
                    borderRadius: "full",
                    background: "linear-gradient(45deg, #3182ce, #63b3ed)",
                    zIndex: -1,
                    animation: "pulse 2s infinite",
                  }
                : undefined
            }
          >
            <Text
              fontSize="xs"
              fontWeight="bold"
              color={player.isCurrentPlayer ? "blue.700" : "green.700"}
              lineHeight="1"
            >
              #{player.playerNumber}
            </Text>
            <Text
              fontSize="3xs"
              color={player.isCurrentPlayer ? "blue.600" : "gray.600"}
              lineHeight="1"
              textAlign="center"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              maxW="50px"
            >
              {player.name?.split(" ")[0] || `P${player.playerNumber}`}
            </Text>
            {/* <Text
              fontSize="2xs"
              color={player.isCurrentPlayer ? "blue.500" : "gray.500"}
            >
              {player.level} {player.gender === "MALE" ? "♂" : "♀"}
            </Text> */}
          </Box>
        );
      })}

      {/* Empty court display */}
      {players.length === 0 && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          color="gray.500"
          fontSize="lg"
          fontWeight="medium"
          zIndex={2}
        >
          Court Empty
        </Box>
      )}
    </Box>
  );
}
