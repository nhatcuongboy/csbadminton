import React from "react";
import { Flex, Heading, Box, Text, Input } from "@chakra-ui/react";
import {
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  IconButton,
} from "@/components/ui/chakra-compat";
import { Save, Plus, Trash2, Edit } from "lucide-react";

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

interface ManageTabProps {
  session: any;
  newPlayers: any[];
  editingPlayers: { [key: string]: Player };
  isSaving: boolean;
  addNewPlayerRow: () => void;
  removeNewPlayerRow: (index: number) => void;
  updateNewPlayer: (index: number, field: string, value: string) => void;
  startEditingPlayer: (player: Player) => void;
  cancelEditingPlayer: (playerId: string) => void;
  updateEditingPlayer: (playerId: string, field: string, value: string) => void;
  savePlayerChanges: () => void;
  saveIndividualPlayer: (playerId: string) => void;
  deletePlayer: (playerId: string) => void;
}

const ManageTab: React.FC<ManageTabProps> = ({
  session,
  newPlayers,
  editingPlayers,
  isSaving,
  addNewPlayerRow,
  removeNewPlayerRow,
  updateNewPlayer,
  startEditingPlayer,
  cancelEditingPlayer,
  updateEditingPlayer,
  savePlayerChanges,
  saveIndividualPlayer,
  deletePlayer,
}) => {
  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="center"></Flex>

      {/* Session Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card variant="outline">
          <CardBody textAlign="center" py={4}>
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {session.numberOfCourts * session.maxPlayersPerCourt}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Max Players
            </Text>
          </CardBody>
        </Card>
        <Card variant="outline">
          <CardBody textAlign="center" py={4}>
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {session.numberOfCourts * session.maxPlayersPerCourt -
                session.players.length}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Available Slots
            </Text>
          </CardBody>
        </Card>
        <Card variant="outline">
          <CardBody textAlign="center" py={4}>
            <Text fontSize="2xl" fontWeight="bold" color="purple.500">
              {(() => {
                const maxPlayers =
                  session.numberOfCourts * session.maxPlayersPerCourt;
                const occupiedNumbers = new Set(
                  session.players.map((p: any) => p.playerNumber)
                );
                const availableNumbers = [];
                for (let i = 1; i <= maxPlayers; i++) {
                  if (!occupiedNumbers.has(i)) {
                    availableNumbers.push(i);
                  }
                }
                return availableNumbers.length > 0
                  ? availableNumbers.slice(0, 3).join(", ") +
                      (availableNumbers.length > 3 ? "..." : "")
                  : "None";
              })()}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Available Player Numbers
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Description */}
      <Text color="gray.600">
        Manage existing players and add new ones. Click the edit icon to modify
        player details, or use "Add Player" to create new players.
      </Text>

      <HStack spacing={2} justifyContent="flex-end">
        <Button
          size="sm"
          leftIcon={<Box as={Plus} boxSize={4} />}
          onClick={addNewPlayerRow}
          colorScheme="green"
        >
          Add Player
        </Button>
        {newPlayers.length > 0 && (
          <Button
            size="sm"
            leftIcon={<Box as={Save} boxSize={4} />}
            onClick={savePlayerChanges}
            colorScheme="blue"
            loading={isSaving}
          >
            Save Changes
          </Button>
        )}
      </HStack>
      {/* New Players Section */}
      {newPlayers.length > 0 && (
        <Box
          p={4}
          bg="green.50"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="green.200"
        >
          <Heading size="sm" mb={4} color="green.700">
            New Players
          </Heading>
          <VStack spacing={3}>
            {newPlayers.map((player, index) => (
              <Card key={index} width="100%" variant="outline">
                <CardBody p={4}>
                  <Flex gap={4} align="center">
                    <Box minW="60px">
                      <Text fontSize="sm" fontWeight="bold">
                        #{player.playerNumber}
                      </Text>
                    </Box>
                    <Input
                      placeholder="Player name"
                      value={player.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateNewPlayer(index, "name", e.target.value)
                      }
                      flex="2"
                    />
                    <select
                      value={player.gender}
                      onChange={(e: any) =>
                        updateNewPlayer(index, "gender", e.target.value)
                      }
                      style={{
                        flex: "1",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #E2E8F0",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                    <select
                      value={player.level}
                      onChange={(e: any) =>
                        updateNewPlayer(index, "level", e.target.value)
                      }
                      style={{
                        flex: "1",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #E2E8F0",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                    <IconButton
                      aria-label="Remove player"
                      icon={<Box as={Trash2} boxSize={4} />}
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => removeNewPlayerRow(index)}
                    />
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </Box>
      )}

      {/* Existing Players */}
      <Box>
        <Heading size="sm" mb={4}>
          Existing Players ({session.players.length})
        </Heading>
        {session.players.length === 0 ? (
          <Text fontSize="lg" color="gray.500" textAlign="center" py={8}>
            No players in this session yet. Add some players above!
          </Text>
        ) : (
          <VStack spacing={3}>
            {session.players
              .sort((a: any, b: any) => a.playerNumber - b.playerNumber)
              .map((player: any) => {
                const isEditing = editingPlayers[player.id];
                return (
                  <Card key={player.id} width="100%" variant="outline">
                    <CardBody p={4}>
                      {isEditing ? (
                        // Editing mode
                        <Flex gap={4} align="center">
                          <Box minW="60px">
                            <Text fontSize="sm" fontWeight="bold">
                              #{player.playerNumber}
                            </Text>
                          </Box>
                          <Input
                            value={isEditing.name}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              updateEditingPlayer(
                                player.id,
                                "name",
                                e.target.value
                              )
                            }
                            flex="2"
                          />
                          <select
                            value={isEditing.gender}
                            onChange={(e: any) =>
                              updateEditingPlayer(
                                player.id,
                                "gender",
                                e.target.value
                              )
                            }
                            style={{
                              flex: "1",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #E2E8F0",
                              backgroundColor: "white",
                            }}
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                          </select>
                          <select
                            value={isEditing.level}
                            onChange={(e: any) =>
                              updateEditingPlayer(
                                player.id,
                                "level",
                                e.target.value
                              )
                            }
                            style={{
                              flex: "1",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #E2E8F0",
                              backgroundColor: "white",
                            }}
                          >
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                            <option value="EXPERT">Expert</option>
                          </select>
                          <HStack>
                            <IconButton
                              aria-label="Save changes"
                              icon={<Box as={Save} boxSize={4} />}
                              size="sm"
                              colorScheme="green"
                              onClick={() => saveIndividualPlayer(player.id)}
                              isLoading={isSaving}
                            />
                            <IconButton
                              aria-label="Cancel editing"
                              icon={<Text fontSize="sm">✕</Text>}
                              size="sm"
                              colorScheme="gray"
                              onClick={() => cancelEditingPlayer(player.id)}
                            />
                          </HStack>
                        </Flex>
                      ) : (
                        // Display mode
                        <Flex gap={4} align="center" justify="space-between">
                          <Flex gap={4} align="center" flex="1">
                            <Box minW="60px">
                              <Text fontSize="sm" fontWeight="bold">
                                #{player.playerNumber}
                              </Text>
                            </Box>
                            <Box flex="2">
                              <Text fontWeight="medium">
                                {player.name || `Player ${player.playerNumber}`}
                              </Text>
                            </Box>
                            <Box flex="1">
                              <span
                                style={{
                                  color:
                                    player.gender === "MALE"
                                      ? "#3182ce"
                                      : "#d53f8c",
                                }}
                              >
                                {player.gender === "MALE"
                                  ? "♂ Male"
                                  : "♀ Female"}
                              </span>
                            </Box>
                            <Box flex="1">
                              <span style={{ color: "#805ad5" }}>
                                {player.level}
                              </span>
                            </Box>
                            <Box flex="1">
                              <span
                                style={{
                                  color:
                                    player.status === "PLAYING"
                                      ? "#38a169"
                                      : player.status === "WAITING"
                                      ? "#ecc94b"
                                      : "#a0aec0",
                                }}
                              >
                                {player.status}
                              </span>
                            </Box>
                          </Flex>
                          <HStack>
                            <IconButton
                              aria-label="Edit player"
                              icon={<Box as={Edit} boxSize={4} />}
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => startEditingPlayer(player)}
                            />
                            <IconButton
                              aria-label="Delete player"
                              icon={<Box as={Trash2} boxSize={4} />}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => deletePlayer(player.id)}
                            />
                          </HStack>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
          </VStack>
        )}
      </Box>
    </VStack>
  );
};

export default ManageTab;
