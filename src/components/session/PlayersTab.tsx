import React from "react";
import { VStack, Flex, Heading, HStack, Button, Text } from "@chakra-ui/react";
import { PlayerGrid } from "@/components/player/PlayerGrid";
import { Level } from "@/lib/api";

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

type PlayerFilter = "ALL" | "PLAYING" | "WAITING";

interface PlayersTabProps {
  sessionPlayers: Player[];
  playerFilter: PlayerFilter;
  setPlayerFilter: (filter: PlayerFilter) => void;
  formatWaitTime: (waitTimeInMinutes: number) => string;
}

const PlayersTab: React.FC<PlayersTabProps> = ({
  sessionPlayers,
  playerFilter,
  setPlayerFilter,
  formatWaitTime,
}) => {
  return (
    <VStack gap={6} align="stretch">
      {/* Header with Filter Buttons */}
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Players</Heading>
        <HStack gap={2}>
          <Button
            size="sm"
            onClick={() => setPlayerFilter("ALL")}
            colorScheme={playerFilter === "ALL" ? "orange" : "gray"}
            variant={playerFilter === "ALL" ? "solid" : "outline"}
          >
            All ({sessionPlayers.length})
          </Button>
          <Button
            size="sm"
            onClick={() => setPlayerFilter("PLAYING")}
            colorScheme={playerFilter === "PLAYING" ? "blue" : "gray"}
            variant={playerFilter === "PLAYING" ? "solid" : "outline"}
          >
            Playing (
            {sessionPlayers.filter((p) => p.status === "PLAYING").length})
          </Button>
          <Button
            size="sm"
            onClick={() => setPlayerFilter("WAITING")}
            colorScheme={playerFilter === "WAITING" ? "orange" : "gray"}
            variant={playerFilter === "WAITING" ? "solid" : "outline"}
          >
            Waiting (
            {sessionPlayers.filter((p) => p.status === "WAITING").length})
          </Button>
        </HStack>
      </Flex>
      {/* Filtered Players Grid */}
      {(() => {
        const filteredPlayers = sessionPlayers.filter((player) => {
          if (playerFilter === "ALL") return true;
          return player.status === playerFilter;
        });
        if (filteredPlayers.length === 0) {
          return (
            <Text fontSize="lg" color="gray.500" textAlign="center" py={8}>
              No players found for {playerFilter.toLowerCase()} status
            </Text>
          );
        }
        return (
          <PlayerGrid
            players={filteredPlayers}
            playerFilter={playerFilter}
            formatWaitTime={formatWaitTime}
          />
        );
      })()}
    </VStack>
  );
};

export default PlayersTab;
