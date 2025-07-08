import {
  Button,
  Card,
  CardBody,
  SimpleGrid,
  useToast,
} from "@/components/ui/chakra-compat";
import * as SessionActions from "@/lib/api/session-actions";
import { Box, Heading, HStack, Input, Text } from "@chakra-ui/react";
import React, { useState } from "react";

interface SettingsTabProps {
  session: any;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ session }) => {
  // Show session summary cards like Management tab
  const maxPlayers = session.numberOfCourts * session.maxPlayersPerCourt;
  const availableSlots = maxPlayers - session.players.length;
  const courtsCount = session.numberOfCourts;

  // State for quick actions
  const [strategy, setStrategy] = useState("fairness");
  const [waitTimeIncrement, setWaitTimeIncrement] = useState(1);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [isUpdatingWait, setIsUpdatingWait] = useState(false);
  const toast = useToast();
  const showToast = typeof toast === "function" ? toast : toast.toast;

  // Real API handlers
  const handleAutoAssign = async () => {
    setIsAutoAssigning(true);
    try {
      await SessionActions.autoAssignPlayers(session.id, strategy);
      showToast({ title: "Auto-assign complete", status: "success" });
    } catch (e: any) {
      showToast({
        title: "Auto-assign failed",
        description: e.message,
        status: "error",
      });
    } finally {
      setIsAutoAssigning(false);
    }
  };
  const handleUpdateWait = async () => {
    setIsUpdatingWait(true);
    try {
      await SessionActions.updateWaitTimes(session.id, waitTimeIncrement);
      showToast({ title: "Wait times updated", status: "success" });
    } catch (e: any) {
      showToast({
        title: "Update failed",
        description: e.message,
        status: "error",
      });
    } finally {
      setIsUpdatingWait(false);
    }
  };
  const handleResetWait = async () => {
    try {
      await SessionActions.resetWaitTimes(session.id);
      showToast({ title: "Wait times reset", status: "info" });
    } catch (e: any) {
      showToast({
        title: "Reset failed",
        description: e.message,
        status: "error",
      });
    }
  };

  return (
    <Box maxW="4xl" mx="auto">
      {/* Quick Actions UI */}
      <Box bg="gray.50" p={8} borderRadius="xl" mb={8}>
        <Heading size="md" mb={4}>
          Quick Actions
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
          {/* Auto-assign strategy */}
          <Box>
            <Text fontWeight="medium" mb={2}>
              Auto-assign Strategy
            </Text>
            <select
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #E2E8F0",
              }}
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
            >
              <option value="fairness">Fairness (longest wait first)</option>
              <option value="speed">Speed (fill courts quickly)</option>
              <option value="level_balance">Level Balance</option>
            </select>
            <Button
              mt={4}
              width="100%"
              colorScheme="blackAlpha"
              leftIcon={<span style={{ fontSize: 18 }}>◎</span>}
              onClick={handleAutoAssign}
              loading={isAutoAssigning}
            >
              Auto-assign Players
            </Button>
          </Box>
          {/* Wait time increment */}
          <Box>
            <Text fontWeight="medium" mb={2}>
              Wait Time Increment (minutes)
            </Text>
            <Input
              type="number"
              min={1}
              value={waitTimeIncrement}
              onChange={(e) => setWaitTimeIncrement(Number(e.target.value))}
              width="100%"
              mb={4}
            />
            <HStack>
              <Button
                flex={1}
                colorScheme="blackAlpha"
                leftIcon={<span style={{ fontSize: 18 }}>🕒</span>}
                onClick={handleUpdateWait}
                loading={isUpdatingWait}
                mr={2}
              >
                Update Wait Times
              </Button>
              <Button
                flexShrink={0}
                minW="110px"
                variant="outline"
                leftIcon={<span style={{ fontSize: 18 }}>↻</span>}
                onClick={handleResetWait}
              >
                Reset
              </Button>
            </HStack>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default SettingsTab;
