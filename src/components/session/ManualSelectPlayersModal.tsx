import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import { X, Check, Users } from "lucide-react";
import { PlayerGrid } from "@/components/player/PlayerGrid";
import { Button as CompatButton } from "@/components/ui/chakra-compat";
import { Player, Court } from "@/types/session";
import BadmintonCourt from "@/components/court/BadmintonCourt";
import MatchPreviewModal from "./MatchPreviewModal";

interface ManualSelectPlayersModalProps {
  isOpen: boolean;
  court: Court | null;
  waitingPlayers: Player[];
  selectedPlayers: string[];
  onPlayerToggle: (playerId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  formatWaitTime: (waitTimeInMinutes: number) => string;
  getCourtDisplayName?: (
    courtName: string | undefined,
    courtNumber: number
  ) => string;
}

const ManualSelectPlayersModal: React.FC<ManualSelectPlayersModalProps> = ({
  isOpen,
  court,
  waitingPlayers,
  selectedPlayers,
  onPlayerToggle,
  onConfirm,
  onCancel,
  formatWaitTime,
  getCourtDisplayName = (name, number) => name || `Court ${number}`,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !court) return null;

  // Group selected players into pairs for court preview
  const getSelectedPlayersData = () => {
    return selectedPlayers
      .map((playerId, index) => {
        const player = waitingPlayers.find((p) => p.id === playerId);
        if (player) {
          // Assign pair numbers: first 2 players = pair 1, next 2 = pair 2
          const pairNumber = Math.floor(index / 2) + 1;
          return {
            ...player,
            pairNumber,
          };
        }
        return null;
      })
      .filter(Boolean) as (Player & { pairNumber: number })[];
  };

  // Get pair assignments for display
  const getPairAssignments = () => {
    const selectedPlayersData = getSelectedPlayersData();
    const pairs: { pair1: Player[]; pair2: Player[] } = {
      pair1: [],
      pair2: [],
    };

    selectedPlayersData.forEach((player, index) => {
      if (index < 2) {
        pairs.pair1.push(player);
      } else {
        pairs.pair2.push(player);
      }
    });

    return pairs;
  };

  const handleConfirmSelection = () => {
    if (selectedPlayers.length === 4) {
      setShowPreview(true);
    }
  };

  const handleConfirmPreview = () => {
    setIsLoading(true);
    onConfirm();
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
  };

  const pairs = getPairAssignments();
  const selectedPlayersData = getSelectedPlayersData();

  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        zIndex={1000}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          maxW="6xl"
          w="full"
          maxH="90vh"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <Flex
            justify="space-between"
            align="center"
            p={4}
            borderBottom="1px"
            borderColor="gray.200"
            flexShrink={0}
          >
            <Heading size="md">
              Manual Player Selection - Court {court.courtNumber}
            </Heading>
            <Box
              as="button"
              onClick={onCancel}
              p={1}
              borderRadius="md"
              _hover={{ bg: "gray.100" }}
            >
              <Box as={X} boxSize={5} />
            </Box>
          </Flex>

          <Box flexShrink={0} p={4}>
            {/* Court Preview and Selected Players Section */}
            {/* Selected Players Summary */}
            <Box flex={{ base: "1", lg: "0 0 280px" }} minW="0">
              <Text fontSize="sm" fontWeight="medium" mb={3}>
                Selected Players ({selectedPlayers.length}/4):
              </Text>

              {/* 2x2 Grid for Selected Players */}
              <SimpleGrid columns={2} gap={2} maxW="280px">
                {/* Create 4 slots for players */}
                {Array.from({ length: 4 }, (_, index) => {
                  const player = selectedPlayersData[index];
                  const pairNumber = Math.floor(index / 2) + 1;
                  const positionInPair = (index % 2) + 1;
                  const pairColor = pairNumber === 1 ? "blue" : "orange";

                  if (player) {
                    // Filled slot with player
                    return (
                      <Box
                        key={player.id}
                        borderWidth="2px"
                        borderColor={`${pairColor}.300`}
                        borderRadius="md"
                        p={3}
                        bg={`${pairColor}.50`}
                        cursor="pointer"
                        onClick={() => onPlayerToggle(player.id)}
                        _hover={{ bg: `${pairColor}.100` }}
                        minH="100px"
                        boxShadow="sm"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        position="relative"
                      >
                        {/* Remove button */}
                        <Box
                          position="absolute"
                          top={1}
                          right={1}
                          as="button"
                          bg={`${pairColor}.200`}
                          color={`${pairColor}.700`}
                          fontSize="sm"
                          fontWeight="bold"
                          _hover={{ bg: `${pairColor}.300`, color: `${pairColor}.900` }}
                          w={5}
                          h={5}
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          boxShadow="sm"
                        >
                          ×
                        </Box>

                        {/* Player info */}
                        <Text
                          fontSize="md"
                          fontWeight="bold"
                          textAlign="center"
                          mb={1}
                        >
                          #{player.playerNumber}
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          textAlign="center"
                          color="gray.800"
                          mb={1}
                          maxW="100%"
                          overflow="hidden"
                        >
                          {player.name || `Player ${player.playerNumber}`}
                        </Text>
                        <Badge
                          colorScheme={pairColor}
                          mb={1}
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          borderRadius="md"
                        >
                          P{pairNumber}-{positionInPair}
                        </Badge>
                        {player.level && (
                          <Badge
                            colorScheme="green"
                            fontSize="xs"
                            px={2}
                            variant="outline"
                          >
                            {player.level}
                          </Badge>
                        )}
                      </Box>
                    );
                  } else {
                    // Empty slot
                    return (
                      <Box
                        key={`empty-${index}`}
                        borderWidth="2px"
                        borderStyle="dashed"
                        borderColor={`${pairColor}.200`}
                        borderRadius="md"
                        p={3}
                        textAlign="center"
                        minH="100px"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        bg="gray.50"
                      >
                        <Badge
                          variant="subtle"
                          colorScheme={pairColor}
                          mb={2}
                          fontSize="xs"
                          px={2}
                          py={0.5}
                        >
                          Pair {pairNumber}
                        </Badge>
                        <Text fontSize="xs" fontWeight="medium" color="gray.500" mb={1}>
                          Position {positionInPair}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Select player
                        </Text>
                      </Box>
                    );
                  }
                })}
              </SimpleGrid>
            </Box>
          </Box>

          <Box flex={1} overflow="auto" p={4}>
            {/* Available Players */}
            <Box>
              <Text fontSize="md" fontWeight="medium" mb={3}>
                Available Players:
              </Text>
              {waitingPlayers.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
                  No players are currently waiting
                </Text>
              ) : (
                <PlayerGrid
                  players={waitingPlayers}
                  playerFilter="WAITING"
                  formatWaitTime={formatWaitTime}
                  selectedPlayers={selectedPlayers}
                  onPlayerToggle={onPlayerToggle}
                  selectionMode={true}
                />
              )}
            </Box>
          </Box>

          <Flex
            justify="flex-end"
            gap={2}
            p={4}
            borderTop="1px"
            borderColor="gray.200"
            flexShrink={0}
          >
            <CompatButton variant="outline" onClick={onCancel}>
              Cancel
            </CompatButton>
            <CompatButton
              colorScheme="blue"
              onClick={handleConfirmSelection}
              disabled={selectedPlayers.length !== 4}
            >
              <Box as={Check} boxSize={4} mr={1} />
              Start Match ({selectedPlayers.length}/4)
            </CompatButton>
          </Flex>
        </Box>
      </Box>

      {/* Match Preview Modal */}
      <MatchPreviewModal
        isOpen={showPreview}
        court={court}
        selectedPlayers={selectedPlayersData}
        isLoading={isLoading}
        onConfirm={handleConfirmPreview}
        onCancel={handleCancelPreview}
        onBack={handleCancelPreview}
        getCourtDisplayName={getCourtDisplayName}
        title={`Manual Match Preview - Court ${court.courtNumber}`}
        description="Review the selected players before starting the match:"
      />
    </>
  );
};

export default ManualSelectPlayersModal;
