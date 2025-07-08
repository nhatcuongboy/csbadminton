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
import { Plus, Shuffle, Square, Play } from "lucide-react";
import BadmintonCourt from "../court/BadmintonCourt";
import {
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Button as CompatButton,
} from "@/components/ui/chakra-compat";

// Types for courts and matches (should match parent props)
interface Player {
  id: string;
  playerNumber: number;
  name: string;
  gender?: string;
  level?: string;
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

interface MatchPlayer {
  id: string;
  matchId: string;
  playerId: string;
  position: number;
  player: Player;
}

interface Match {
  id: string;
  status: string;
  courtId: string;
  startTime: string;
  endTime?: string;
  players: MatchPlayer[];
}

interface CourtsTabProps {
  session: any;
  activeCourts: Court[];
  showMatchCreation: boolean;
  setShowMatchCreation: (show: boolean) => void;
  matchMode: "auto" | "manual";
  setMatchMode: (mode: "auto" | "manual") => void;
  selectedPlayers: string[];
  setSelectedPlayers: (ids: string[]) => void;
  selectedCourt: string | null;
  setSelectedCourt: (id: string | null) => void;
  autoAssignPlayers: () => void;
  cancelMatchCreation: () => void;
  confirmManualMatch: () => void;
  waitingPlayers: Player[];
  togglePlayerSelection: (id: string) => void;
  getCurrentMatch: (courtId: string) => Match | null;
  formatCourtElapsedTime: (startTime: string) => string;
  getCourtDisplayName: (
    courtName: string | undefined,
    courtNumber: number
  ) => string;
  endMatch?: (matchId: string) => void;
  autoAssignPlayersToSpecificCourt?: (courtId: string) => void;
  startManualMatchCreation?: (courtId: string) => void;
}

const CourtsTab: React.FC<
  CourtsTabProps & {
    endMatch?: (matchId: string) => void;
    autoAssignPlayersToSpecificCourt?: (courtId: string) => void;
    startManualMatchCreation?: (courtId: string) => void;
  }
> = ({
  session,
  activeCourts,
  showMatchCreation,
  setShowMatchCreation,
  matchMode,
  setMatchMode,
  selectedPlayers,
  setSelectedPlayers,
  selectedCourt,
  setSelectedCourt,
  autoAssignPlayers,
  cancelMatchCreation,
  confirmManualMatch,
  waitingPlayers,
  togglePlayerSelection,
  getCurrentMatch,
  formatCourtElapsedTime,
  getCourtDisplayName,
  endMatch,
  autoAssignPlayersToSpecificCourt,
  startManualMatchCreation,
}) => {
  const [loadingEndMatchId, setLoadingEndMatchId] = React.useState<
    string | null
  >(null);
  return (
    <>
      <Flex justifyContent="space-between" mb={4}>
        <Heading size="md">Active Courts</Heading>
        {session.status === "IN_PROGRESS" && (
          <HStack gap={2}>
            {/* <CompatButton size="sm" onClick={autoAssignPlayers}>
              <Box as={Shuffle} boxSize={4} mr={1} />
              Auto Assign
            </CompatButton> */}
          </HStack>
        )}
      </Flex>
      {session.status !== "IN_PROGRESS" && (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={4}>
          {session.status === "PREPARING"
            ? "Start the session to begin matches"
            : "Session has ended"}
        </Text>
      )}
      {session.status === "IN_PROGRESS" && activeCourts.length === 0 && (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={4}>
          No active courts. Create a new match to start playing.
        </Text>
      )}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mt={4}>
        {session.courts.map((court: Court) => {
          const currentMatch = getCurrentMatch(court.id);
          const isActive = court.status === "IN_USE";
          return (
            <Card key={court.id} variant="outline">
              <CardHeader
                bg={isActive ? "green.50" : "gray.50"}
                p={4}
                borderBottom="1px"
                borderColor={isActive ? "green.200" : "gray.200"}
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading
                    size="md"
                    color={isActive ? "green.700" : "gray.700"}
                  >
                    Court {court.courtNumber}
                  </Heading>
                  <HStack gap={2}>
                    {currentMatch && (
                      <Badge
                        colorScheme="blue"
                        variant="solid"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Box as={Square} boxSize={4} mr={1} />
                        {currentMatch.startTime
                          ? formatCourtElapsedTime(currentMatch.startTime)
                          : "-"}
                      </Badge>
                    )}
                    <Badge
                      colorScheme={isActive ? "green" : "gray"}
                      variant={isActive ? "solid" : "outline"}
                    >
                      {isActive ? "IN USE" : "EMPTY"}
                    </Badge>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody py={4} px={0}>
                {isActive && court.currentPlayers.length > 0 ? (
                  <VStack gap={4}>
                    <BadmintonCourt
                      players={court.currentPlayers}
                      isActive={isActive}
                      elapsedTime={
                        currentMatch
                          ? formatCourtElapsedTime(currentMatch.startTime)
                          : "Playing..."
                      }
                      courtName={getCourtDisplayName(
                        court.courtName,
                        court.courtNumber
                      )}
                      width="100%"
                      //   height="180px"
                      showTimeInCenter={true}
                    />
                    <VStack gap={2} width="100%">
                      {session.status === "IN_PROGRESS" &&
                        endMatch &&
                        court.currentMatchId && (
                          <CompatButton
                            size="sm"
                            width="full"
                            colorScheme="red"
                            onClick={async () => {
                              if (!court.currentMatchId) return;
                              setLoadingEndMatchId(court.currentMatchId);
                              try {
                                await endMatch(court.currentMatchId);
                              } finally {
                                setLoadingEndMatchId(null);
                              }
                            }}
                            loading={loadingEndMatchId === court.currentMatchId}
                          >
                            <Box as={Square} boxSize={4} mr={1} />
                            End Match
                          </CompatButton>
                        )}
                    </VStack>
                  </VStack>
                ) : (
                  <VStack gap={4} align="center" justify="center" minH="200px">
                    <BadmintonCourt
                      players={[]}
                      isActive={false}
                      courtName={getCourtDisplayName(
                        court.courtName,
                        court.courtNumber
                      )}
                      width="100%"
                      //   height="180px"
                      showTimeInCenter={false}
                    />
                    {session.status === "IN_PROGRESS" && (
                      <VStack gap={2}>
                        {autoAssignPlayersToSpecificCourt && (
                          <CompatButton
                            colorScheme="green"
                            onClick={() =>
                              autoAssignPlayersToSpecificCourt(court.id)
                            }
                            size="sm"
                            width="full"
                          >
                            <Box as={Shuffle} boxSize={4} mr={1} />
                            Auto Assign Match
                          </CompatButton>
                        )}
                        {startManualMatchCreation && (
                          <CompatButton
                            colorScheme="blue"
                            onClick={() => startManualMatchCreation(court.id)}
                            size="sm"
                            width="full"
                            variant="outline"
                          >
                            <Box as={Plus} boxSize={4} mr={1} />
                            Manual Selection
                          </CompatButton>
                        )}
                      </VStack>
                    )}
                  </VStack>
                )}
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>
      {/* Manual Match Creation Interface */}
      {showMatchCreation && matchMode === "manual" && selectedCourt && (
        <Box
          mt={8}
          p={6}
          bg="blue.50"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="blue.200"
        >
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md" color="blue.700">
              Create Match - Court{" "}
              {
                session.courts.find((c: Court) => c.id === selectedCourt)
                  ?.courtNumber
              }
            </Heading>
            <CompatButton
              size="sm"
              variant="ghost"
              onClick={cancelMatchCreation}
              colorScheme="gray"
            >
              Cancel
            </CompatButton>
          </Flex>
          <Text fontSize="sm" color="blue.600" mb={4}>
            Select exactly 4 players from the waiting queue above. Selected
            players are highlighted in blue.
          </Text>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="sm" fontWeight="medium">
              Selected Players: {selectedPlayers.length}/4
            </Text>
            {selectedPlayers.length > 0 && (
              <CompatButton
                size="sm"
                variant="outline"
                onClick={() => setSelectedPlayers([])}
                colorScheme="gray"
              >
                Clear Selection
              </CompatButton>
            )}
          </Flex>
          {selectedPlayers.length > 0 && (
            <Box mb={4}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Selected:
              </Text>
              <Flex wrap="wrap" gap={2}>
                {selectedPlayers.map((playerId) => {
                  const player = waitingPlayers.find((p) => p.id === playerId);
                  return player ? (
                    <Badge
                      key={playerId}
                      colorScheme="blue"
                      px={2}
                      py={1}
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      #{player.playerNumber}{" "}
                      {player.name || `Player ${player.playerNumber}`}
                      <Box
                        as="button"
                        ml={1}
                        onClick={() => togglePlayerSelection(playerId)}
                        _hover={{ bg: "blue.600" }}
                        borderRadius="full"
                        w={4}
                        h={4}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                      >
                        ×
                      </Box>
                    </Badge>
                  ) : null;
                })}
              </Flex>
            </Box>
          )}
          <Flex gap={2} justifyContent="flex-end">
            <CompatButton
              colorScheme="blue"
              onClick={confirmManualMatch}
              disabled={selectedPlayers.length !== 4}
            >
              <Box as={Play} boxSize={4} mr={1} />
              Start Match ({selectedPlayers.length}/4)
            </CompatButton>
          </Flex>
        </Box>
      )}
    </>
  );
};

export default CourtsTab;
