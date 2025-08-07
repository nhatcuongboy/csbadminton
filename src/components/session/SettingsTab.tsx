import { useToast } from "@/components/ui/chakra-compat";
import { Box, Tabs, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import PlayerManagement from "./PlayerManagement";

interface SettingsTabProps {
  session: any;
  refreshSessionData: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  session,
  refreshSessionData,
}) => {
  // Show session summary cards like Management tab
  const maxPlayers = session.numberOfCourts * session.maxPlayersPerCourt;
  const availableSlots = maxPlayers - session.players.length;
  const courtsCount = session.numberOfCourts;

  // State for quick actions
  const toast = useToast();

  // Real API handlers

  return (
    <Box maxW="4xl" mx="auto">
      {/* <Heading size="md" mb={4} textAlign="center">
        Settings
      </Heading> */}
      <Tabs.Root defaultValue="player">
        <Tabs.List>
          <Tabs.Trigger value="player">Player Management</Tabs.Trigger>
          <Tabs.Trigger value="court">Court Management</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="player">
          <PlayerManagement
            session={session}
            onDataRefresh={refreshSessionData}
          />
        </Tabs.Content>
        <Tabs.Content value="court">
          <Text>Court management settings will be here.</Text>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

export default SettingsTab;
