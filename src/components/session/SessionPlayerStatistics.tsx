import { PlayerStatistics, SessionService } from "@/lib/api";
import { Box, Center, Spinner, Table, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

interface SessionPlayerStatisticsProps {
  sessionId: string;
}

const SessionPlayerStatistics: React.FC<SessionPlayerStatisticsProps> = ({
  sessionId,
}) => {
  const [stats, setStats] = useState<PlayerStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const result = await SessionService.getPlayerStatistics(sessionId);
        setStats(result.playerStats);
        setLastUpdated(result.lastUpdated);
      } catch (err) {
        setError("Failed to load player statistics.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [sessionId]);

  return (
    <Box>
      {loading ? (
        <Center py={8}>
          <Spinner size="lg" />
        </Center>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : stats.length === 0 ? (
        <Text>No player statistics available.</Text>
      ) : (
        <Box>
          <Table.Root size="sm" variant="outline" colorScheme="gray">
            <Table.Caption>Player statistics for this session</Table.Caption>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>No.</Table.ColumnHeader>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Matches</Table.ColumnHeader>
                <Table.ColumnHeader>Wins</Table.ColumnHeader>
                <Table.ColumnHeader>Losses</Table.ColumnHeader>
                <Table.ColumnHeader>Win Rate</Table.ColumnHeader>
                <Table.ColumnHeader>Avg Score</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {stats.map((p, idx) => (
                <Table.Row key={p.playerId}>
                  <Table.Cell>{p.playerNumber}</Table.Cell>
                  <Table.Cell>{p.name || "Unnamed"}</Table.Cell>
                  <Table.Cell>{p.totalMatches}</Table.Cell>
                  <Table.Cell>{p.wins}</Table.Cell>
                  <Table.Cell>{p.losses}</Table.Cell>
                  <Table.Cell>{p.winRate}%</Table.Cell>
                  <Table.Cell>{p.averageScore}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
          <Text fontSize="xs" color="gray.500" mt={2}>
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default SessionPlayerStatistics;
