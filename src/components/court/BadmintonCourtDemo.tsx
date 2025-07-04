import BadmintonCourt from "./BadmintonCourt";
import { VStack, HStack } from "@/components/ui/chakra-compat";
import { Text, Box } from "@chakra-ui/react";

// Example usage of BadmintonCourt component
export default function BadmintonCourtDemo() {
  const samplePlayers = [
    {
      id: "1",
      playerNumber: 1,
      name: "John Doe",
      gender: "MALE" as const,
      level: "Y_PLUS",
    },
    {
      id: "2", 
      playerNumber: 2,
      name: "Jane Smith",
      gender: "FEMALE" as const,
      level: "Y",
    },
    {
      id: "3",
      playerNumber: 3,
      name: "Mike Johnson",
      gender: "MALE" as const,
      level: "TB_PLUS",
    },
    {
      id: "4",
      playerNumber: 4,
      name: "Sarah Wilson",
      gender: "FEMALE" as const,
      level: "TB",
    },
  ];

  return (
    <VStack spacing={8} p={6}>
      <Text fontSize="2xl" fontWeight="bold">BadmintonCourt Component Demo</Text>
      
      <HStack spacing={8} align="start">
        {/* Active court with players and time */}
        <VStack spacing={4}>
          <Text fontWeight="bold">Active Court (4 players, with time)</Text>
          <Box w="400px">
            <BadmintonCourt
              players={samplePlayers}
              isActive={true}
              elapsedTime="15 phút"
              width="100%"
              height="200px"
              showTimeInCenter={true}
            />
          </Box>
        </VStack>

        {/* Active court without time display */}
        <VStack spacing={4}>
          <Text fontWeight="bold">Active Court (4 players, no time)</Text>
          <Box w="400px">
            <BadmintonCourt
              players={samplePlayers}
              isActive={true}
              width="100%"
              height="200px"
              showTimeInCenter={false}
            />
          </Box>
        </VStack>
      </HStack>

      <HStack spacing={8} align="start">
        {/* Court with 2 players */}
        <VStack spacing={4}>
          <Text fontWeight="bold">Court with 2 players</Text>
          <Box w="400px">
            <BadmintonCourt
              players={samplePlayers.slice(0, 2)}
              isActive={true}
              elapsedTime="5 phút"
              width="100%"
              height="200px"
              showTimeInCenter={true}
            />
          </Box>
        </VStack>

        {/* Empty court */}
        <VStack spacing={4}>
          <Text fontWeight="bold">Empty Court</Text>
          <Box w="400px">
            <BadmintonCourt
              players={[]}
              isActive={false}
              width="100%"
              height="200px"
              showTimeInCenter={false}
            />
          </Box>
        </VStack>
      </HStack>

      {/* Smaller court sizes */}
      <HStack spacing={8} align="start">
        <VStack spacing={4}>
          <Text fontWeight="bold">Small Court (300x150)</Text>
          <Box w="300px">
            <BadmintonCourt
              players={samplePlayers}
              isActive={true}
              elapsedTime="20 phút"
              width="300px"
              height="150px"
              showTimeInCenter={true}
            />
          </Box>
        </VStack>

        <VStack spacing={4}>
          <Text fontWeight="bold">Mini Court (200x120)</Text>
          <Box w="200px">
            <BadmintonCourt
              players={samplePlayers.slice(0, 2)}
              isActive={true}
              elapsedTime="8 phút"
              width="200px"
              height="120px"
              showTimeInCenter={true}
            />
          </Box>
        </VStack>
      </HStack>
    </VStack>
  );
}
