import React from "react";
import { Flex, Heading, Box, Text, Input, Textarea, Checkbox } from "@chakra-ui/react";
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
import { Level } from "@/lib/api";

interface Player {
  id: string;
  playerNumber: number;
  name: string;
  gender?: string;
  level?: Level;
  status: string;
  currentWaitTime: number;
  totalWaitTime: number;
  matchesPlayed: number;
  currentCourtId?: string;
  preFilledByHost: boolean;
  confirmedByPlayer: boolean;
  levelDescription?: string; // New field
  requireConfirmInfo?: boolean; // New field
}

interface ManageTabProps {
  session: any;
  newPlayers: Array<{
    playerNumber: number;
    name: string;
    gender: string;
    level: Level;
    levelDescription?: string;
    requireConfirmInfo?: boolean;
  }>;
  editingPlayers: { [key: string]: Player };
  isSaving: boolean;
  addNewPlayerRow: () => void;
  removeNewPlayerRow: (index: number) => void;
  updateNewPlayer: (index: number, field: string, value: string | boolean) => void;
  startEditingPlayer: (player: Player) => void;
  cancelEditingPlayer: (playerId: string) => void;
  updateEditingPlayer: (playerId: string, field: string, value: string | boolean) => void;
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
  // Calculate maximum players based on courts and players per court
  const maxPlayers = session.numberOfCourts * session.maxPlayersPerCourt;
  const currentPlayerCount = session.players.length + newPlayers.length;
  const isMaxPlayersReached = currentPlayerCount >= maxPlayers;

  // Function to get next available player number
  const getNextPlayerNumber = () => {
    const existingNumbers = [
      ...session.players.map((p: any) => p.playerNumber),
      ...newPlayers.map((p: any) => p.playerNumber),
    ];

    // Find the smallest number that isn't used yet
    let nextNumber = 1;
    while (existingNumbers.includes(nextNumber)) {
      nextNumber++;
    }

    return nextNumber;
  };

  // Override addNewPlayerRow to use the next available player number
  const handleAddNewPlayer = () => {
    addNewPlayerRow();
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header with session info */}
      <Box p={4} bg="blue.50" borderRadius="lg" borderWidth="1px" borderColor="blue.200">
        <Flex justify="space-between" align="center" mb={2}>
          <Heading size="md" color="blue.700">
            Player Management
          </Heading>
          <Text fontSize="sm" color="blue.600" fontWeight="medium">
            {session.name}
          </Text>
        </Flex>
        <Flex justify="space-between" align="center" fontSize="sm" color="blue.600">
          <Text>
            <strong>{session.numberOfCourts}</strong> courts • <strong>{session.maxPlayersPerCourt}</strong> players per court
          </Text>
          <Text>
            Capacity: <strong>{currentPlayerCount}/{maxPlayers}</strong> players
          </Text>
        </Flex>
      </Box>

      {/* Action buttons */}

      <HStack spacing={2} justifyContent="flex-end">
        <Button
          size="sm"
          leftIcon={<Box as={Plus} boxSize={4} />}
          onClick={handleAddNewPlayer}
          colorScheme="green"
          disabled={isMaxPlayersReached}
          title={
            isMaxPlayersReached
              ? `Maximum players reached (${maxPlayers})`
              : `Add new player (${currentPlayerCount}/${maxPlayers})`
          }
        >
          Add Player{" "}
          {!isMaxPlayersReached && `(${currentPlayerCount}/${maxPlayers})`}
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

      {/* Max players reached notification */}
      {isMaxPlayersReached && (
        <Box
          p={3}
          bg="orange.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="orange.200"
        >
          <Text fontSize="sm" color="orange.700">
            <strong>Maximum players reached!</strong> You have{" "}
            {currentPlayerCount} players for {session.numberOfCourts} courts (
            {session.maxPlayersPerCourt} players per court). Remove existing
            players to add new ones.
          </Text>
        </Box>
      )}

      {/* New Players Section - Updated with improved UI */}
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
          <VStack spacing={4}>
            {newPlayers.map((player, index) => (
              <Card key={index} width="100%" variant="outline">
                <CardBody p={4}>
                  <VStack spacing={3} align="stretch">
                    {/* First row with basic info */}
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
                        <option value="">Select Level</option>
                        <option value={Level.Y_MINUS}>Y-</option>
                        <option value={Level.Y}>Y</option>
                        <option value={Level.Y_PLUS}>Y+</option>
                        <option value={Level.TBY}>TBY</option>
                        <option value={Level.TB_MINUS}>TB-</option>
                        <option value={Level.TB}>TB</option>
                        <option value={Level.TB_PLUS}>TB+</option>
                        <option value={Level.K}>K</option>
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
                    
                    {/* Second row with level description */}
                    <Flex gap={4}>
                      <Box minW="60px"></Box> {/* For alignment */}
                      <Box flex="1">
                        <Text fontSize="sm" mb={1} color="gray.600">Level Description:</Text>
                        <Textarea 
                          placeholder="Optional level description or notes"
                          size="sm"
                          value={player.levelDescription || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            updateNewPlayer(index, "levelDescription", e.target.value)
                          }
                          rows={2}
                        />
                      </Box>
                    </Flex>
                    
                    {/* Third row with confirmation checkbox */}
                    <Flex gap={4}>
                      <Box minW="60px"></Box> {/* For alignment */}
                      <Box display="flex" alignItems="center">
                        <input
                          type="checkbox"
                          id={`requireConfirm-${index}`}
                          checked={player.requireConfirmInfo || false}
                          onChange={(e) =>
                            updateNewPlayer(index, "requireConfirmInfo", e.target.checked)
                          }
                          style={{ marginRight: '8px' }}
                        />
                        <label 
                          htmlFor={`requireConfirm-${index}`} 
                          style={{ fontSize: '14px', marginLeft: '8px' }}
                        >
                          Require player to confirm information
                        </label>
                      </Box>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </Box>
      )}

      {/* Existing Players - Enhanced UI */}
      <Box>
        <Flex justify="space-between" align="center" mb={4}>
          <VStack align="start" spacing={1}>
            <Heading size="sm" color="gray.700">
              Existing Players ({session.players.length})
            </Heading>
            <Text fontSize="xs" color="gray.500">
              Click Edit to modify player information including level description and confirmation requirements
            </Text>
          </VStack>
          <VStack align="end" spacing={1}>
            <Text
              fontSize="sm"
              color={isMaxPlayersReached ? "red.500" : "gray.600"}
              fontWeight={isMaxPlayersReached ? "semibold" : "medium"}
            >
              {currentPlayerCount}/{maxPlayers} players
            </Text>
            {isMaxPlayersReached && (
              <Text fontSize="xs" color="red.500" fontWeight="medium">
                Maximum reached
              </Text>
            )}
          </VStack>
        </Flex>
        {session.players.length === 0 ? (
          <Card variant="outline" bg="gray.50">
            <CardBody p={8}>
              <VStack spacing={4}>
                <Text fontSize="4xl">👥</Text>
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="medium" color="gray.600">
                    No players in this session yet
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Add some players using the "Add Player" button above to get started!
                  </Text>
                </VStack>
                <Button
                  size="md"
                  leftIcon={<Box as={Plus} boxSize={4} />}
                  onClick={handleAddNewPlayer}
                  colorScheme="green"
                  disabled={isMaxPlayersReached}
                >
                  Add Your First Player
                </Button>
              </VStack>
            </CardBody>
          </Card>
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
                        // Editing mode - Enhanced with levelDescription and requireConfirmInfo
                        <VStack spacing={3} align="stretch">
                          {/* First row - Basic info */}
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
                              placeholder="Player name"
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
                              <option value="">Select Level</option>
                              <option value={Level.Y_MINUS}>Y-</option>
                              <option value={Level.Y}>Y</option>
                              <option value={Level.Y_PLUS}>Y+</option>
                              <option value={Level.TBY}>TBY</option>
                              <option value={Level.TB_MINUS}>TB-</option>
                              <option value={Level.TB}>TB</option>
                              <option value={Level.TB_PLUS}>TB+</option>
                              <option value={Level.K}>K</option>
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
                          
                          {/* Second row - Level description */}
                          <Flex gap={4}>
                            <Box minW="60px"></Box> {/* For alignment */}
                            <Box flex="1">
                              <Text fontSize="sm" mb={1} color="gray.600">Level Description:</Text>
                              <Textarea 
                                placeholder="Optional level description or notes"
                                size="sm"
                                value={isEditing.levelDescription || ''}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                  updateEditingPlayer(player.id, "levelDescription", e.target.value)
                                }
                                rows={2}
                              />
                            </Box>
                          </Flex>
                          
                          {/* Third row - Require confirmation */}
                          <Flex gap={4}>
                            <Box minW="60px"></Box> {/* For alignment */}
                            <Box display="flex" alignItems="center">
                              <input
                                type="checkbox"
                                id={`requireConfirm-edit-${player.id}`}
                                checked={isEditing.requireConfirmInfo || false}
                                onChange={(e) =>
                                  updateEditingPlayer(player.id, "requireConfirmInfo", e.target.checked)
                                }
                                style={{ marginRight: '8px' }}
                              />
                              <label 
                                htmlFor={`requireConfirm-edit-${player.id}`} 
                                style={{ fontSize: '14px', marginLeft: '8px' }}
                              >
                                Require player to confirm information
                              </label>
                            </Box>
                          </Flex>
                        </VStack>
                      ) : (
                        // Display mode - Enhanced with more player info
                        <VStack spacing={3} align="stretch">
                          {/* First row - Basic info */}
                          <Flex gap={4} align="center" justify="space-between">
                            <Flex gap={4} align="center" flex="1">
                              <Box minW="60px">
                                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                  #{player.playerNumber}
                                </Text>
                              </Box>
                              <Box flex="2">
                                <Text fontWeight="medium" fontSize="md">
                                  {player.name || `Player ${player.playerNumber}`}
                                </Text>
                              </Box>
                              <Box flex="1">
                                <Flex align="center" gap={1}>
                                  <Text
                                    fontSize="sm"
                                    color={
                                      player.gender === "MALE"
                                        ? "blue.600"
                                        : "pink.600"
                                    }
                                    fontWeight="medium"
                                  >
                                    {player.gender === "MALE" ? "♂" : "♀"}
                                  </Text>
                                  <Text fontSize="sm">
                                    {player.gender === "MALE" ? "Male" : "Female"}
                                  </Text>
                                </Flex>
                              </Box>
                              <Box flex="1">
                                <Text 
                                  fontSize="sm" 
                                  fontWeight="semibold"
                                  color="purple.600"
                                  bg="purple.50"
                                  px={2}
                                  py={1}
                                  borderRadius="md"
                                  textAlign="center"
                                >
                                  {player.level || "N/A"}
                                </Text>
                              </Box>
                              <Box flex="1">
                                <Text
                                  fontSize="sm"
                                  fontWeight="medium"
                                  color={
                                    player.status === "PLAYING"
                                      ? "green.600"
                                      : player.status === "WAITING"
                                      ? "yellow.600"
                                      : "gray.500"
                                  }
                                  bg={
                                    player.status === "PLAYING"
                                      ? "green.50"
                                      : player.status === "WAITING"
                                      ? "yellow.50"
                                      : "gray.50"
                                  }
                                  px={2}
                                  py={1}
                                  borderRadius="md"
                                  textAlign="center"
                                >
                                  {player.status}
                                </Text>
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
                          
                          {/* Second row - Additional info */}
                          {(player.levelDescription || player.requireConfirmInfo) && (
                            <Flex gap={4} pl="60px">
                              <VStack align="stretch" spacing={2} flex="1">
                                {player.levelDescription && (
                                  <Box>
                                    <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>
                                      Level Description:
                                    </Text>
                                    <Text fontSize="sm" color="gray.700" p={2} bg="gray.50" borderRadius="md">
                                      {player.levelDescription}
                                    </Text>
                                  </Box>
                                )}
                                {player.requireConfirmInfo && (
                                  <Flex align="center" gap={2}>
                                    <Box 
                                      w={2} 
                                      h={2} 
                                      bg="orange.400" 
                                      borderRadius="full"
                                    />
                                    <Text fontSize="xs" color="orange.600" fontWeight="medium">
                                      Requires confirmation from player
                                    </Text>
                                  </Flex>
                                )}
                              </VStack>
                            </Flex>
                          )}
                        </VStack>
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
