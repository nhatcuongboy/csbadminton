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
      Comming soon...
    </Box>
  );
};

export default SettingsTab;
