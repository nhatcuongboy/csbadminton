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
import { Play, X, ArrowLeft } from "lucide-react";
import BadmintonCourt from "../court/BadmintonCourt";
import { Button as CompatButton } from "@/components/ui/chakra-compat";
import { Player, Court } from "@/types/session";
import { Level } from "@/lib/api";

interface MatchPreviewModalProps {
  isOpen: boolean;
  court: Court | null;
  selectedPlayers: Player[];
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onBack?: () => void; // Optional back button for manual selection flow
  getCourtDisplayName: (
    courtName: string | undefined,
    courtNumber: number
  ) => string;
  title?: string; // Custom title for the modal
  description?: string; // Custom description text
}

const MatchPreviewModal: React.FC<MatchPreviewModalProps> = ({
  isOpen,
  court,
  selectedPlayers,
  isLoading,
  onConfirm,
  onCancel,
  onBack,
  getCourtDisplayName,
  title,
  description,
}) => {
  if (!isOpen || !court) return null;

  const modalTitle = title || `Auto Assign Match - Court ${court.courtNumber}`;
  const modalDescription =
    description || "The following players will be assigned to this court:";

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
          <Heading size="md">{modalTitle}</Heading>
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
            {modalDescription}
          </Text>

          <Box mb={4}>
            <BadmintonCourt
              players={selectedPlayers.map((player, index) => ({
                id: player.id,
                playerNumber: player.playerNumber,
                name: player.name,
                gender: player.gender,
                level: player.level,
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
            {selectedPlayers.map((player) => (
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
          {onBack && (
            <CompatButton
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
            >
              <Box as={ArrowLeft} boxSize={4} mr={1} />
              Back
            </CompatButton>
          )}
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

export default MatchPreviewModal;
