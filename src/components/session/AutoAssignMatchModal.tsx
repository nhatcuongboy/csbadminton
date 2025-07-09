import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { Play, X } from "lucide-react";
import BadmintonCourt from "../court/BadmintonCourt";
import { Button as CompatButton } from "@/components/ui/chakra-compat";
import { Level } from "@/lib/api";

interface Player {
  id: string;
  playerNumber: number;
  name?: string;
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

interface Court {
  id: string;
  courtNumber: number;
  courtName?: string;
  status: string;
  currentMatchId?: string;
  currentPlayers: Player[];
}

interface AutoAssignMatchModalProps {
  isOpen: boolean;
  court: Court | null;
  suggestedPlayers: Player[];
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  getCourtDisplayName: (
    courtName: string | undefined,
    courtNumber: number
  ) => string;
}

const AutoAssignMatchModal: React.FC<AutoAssignMatchModalProps> = ({
  isOpen,
  court,
  suggestedPlayers,
  isLoading,
  onConfirm,
  onCancel,
  getCourtDisplayName,
}) => {
  if (!isOpen || !court) return null;

  return (
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
        maxW="md"
        w="full"
        maxH="80vh"
        overflow="auto"
      >
        <Flex
          justify="space-between"
          align="center"
          p={4}
          borderBottom="1px"
          borderColor="gray.200"
        >
          <Heading size="md">
            Auto Assign Match - Court {court.courtNumber}
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

        <Box p={4}>
          <Text fontSize="sm" color="gray.600" mb={4}>
            The following players will be assigned to this court:
          </Text>

          <Box mb={4}>
            <BadmintonCourt
              players={suggestedPlayers.map((player, index) => ({
                ...player, // Include all properties from the original player
                pairNumber: index < 2 ? 1 : 2, // Assign pair numbers based on index
                isCurrentPlayer: false,
              }))}
              isActive={true}
              courtName={getCourtDisplayName(
                court.courtName,
                court.courtNumber
              )}
              width="100%"
              showTimeInCenter={false}
              isLoading={isLoading}
            />
          </Box>

          <VStack gap={2} mb={4}>
            {suggestedPlayers.map((player) => (
              <Flex
                key={player.id}
                justify="space-between"
                align="center"
                p={2}
                bg="gray.50"
                borderRadius="md"
                w="full"
              >
                <Text fontWeight="medium">
                  #{player.playerNumber}{" "}
                  {player.name || `Player ${player.playerNumber}`}
                </Text>
                <HStack gap={2}>
                  {player.gender && (
                    <Badge colorScheme="blue" size="sm">
                      {player.gender}
                    </Badge>
                  )}
                  {player.level && (
                    <Badge colorScheme="green" size="sm">
                      {player.level}
                    </Badge>
                  )}
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Box>

        <Flex
          justify="flex-end"
          gap={2}
          p={4}
          borderTop="1px"
          borderColor="gray.200"
        >
          <CompatButton
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </CompatButton>
          <CompatButton
            colorScheme="green"
            onClick={onConfirm}
            loading={isLoading}
          >
            <Box as={Play} boxSize={4} mr={1} />
            Confirm & Start Match
          </CompatButton>
        </Flex>
      </Box>
    </Box>
  );
};

export default AutoAssignMatchModal;
