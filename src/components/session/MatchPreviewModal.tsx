import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import {
  Play,
  X,
  ArrowLeft,
  User,
  UserCheck,
  RefreshCw,
  Mars,
  Venus,
} from "lucide-react";
import BadmintonCourt from "../court/BadmintonCourt";
import { Button as CompatButton } from "@/components/ui/chakra-compat";
import { Player, Court } from "@/types/session";
import { Level, SuggestedPlayersResponse, CourtService } from "@/lib/api";
import { getLevelLabel } from "@/utils/level-mapping";
import { useTranslations } from "next-intl";

interface MatchPreviewModalProps {
  isOpen: boolean;
  court: Court | null;
  waitingPlayersCount?: number; // Total number of waiting players (optional if no topCount selection)
  currentTopCount?: number; // Current topCount value
  onConfirm: (suggestedPlayers: SuggestedPlayersResponse) => void; // Updated to pass suggestedPlayers
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
  waitingPlayersCount,
  currentTopCount = waitingPlayersCount || 4,
  onConfirm,
  onCancel,
  onBack,
  getCourtDisplayName,
  title,
  description,
}) => {
  const t = useTranslations("SessionDetail");

  // Internal state for managing suggested players and loading
  const [suggestedPlayers, setSuggestedPlayers] =
    React.useState<SuggestedPlayersResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [topCount, setTopCount] = React.useState(currentTopCount);
  const [isConfirming, setIsConfirming] = React.useState(false);

  // Fetch suggested players when modal opens or topCount changes
  const fetchSuggestedPlayers = React.useCallback(
    async (courtId: string, count: number) => {
      try {
        setIsLoading(true);
        const response = await CourtService.getSuggestedPlayersForCourt(
          courtId,
          count
        );
        setSuggestedPlayers(response);
      } catch (error) {
        console.error("Error getting suggested players:", error);
        // You might want to add error handling here
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Effect to fetch data when modal opens or court changes
  React.useEffect(() => {
    if (isOpen && court?.id) {
      setTopCount(currentTopCount);
      fetchSuggestedPlayers(court.id, currentTopCount);
    } else if (!isOpen) {
      // Reset state when modal closes
      setSuggestedPlayers(null);
      setIsLoading(false);
      setIsConfirming(false);
    }
  }, [isOpen, court?.id, currentTopCount, fetchSuggestedPlayers]);

  // Handle topCount change
  const handleTopCountChange = (newTopCount: number) => {
    if (!court?.id) return;
    setTopCount(newTopCount);
    fetchSuggestedPlayers(court.id, newTopCount);
  };

  // Handle confirm
  const handleConfirm = async () => {
    if (!suggestedPlayers) return;

    setIsConfirming(true);
    try {
      await onConfirm(suggestedPlayers);
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen || !court) return null;

  // Show loading state if no data yet
  // if (!suggestedPlayers) {
  //   return (
  //     <Box
  //       position="fixed"
  //       top={0}
  //       left={0}
  //       right={0}
  //       bottom={0}
  //       bg="blackAlpha.600"
  //       zIndex={1000}
  //       display="flex"
  //       alignItems="center"
  //       justifyContent="center"
  //       p={4}
  //     >
  //       <Box
  //         bg="white"
  //         borderRadius="lg"
  //         boxShadow="xl"
  //         maxW="md"
  //         w="full"
  //         p={8}
  //         textAlign="center"
  //       >
  //         <VStack gap={4}>
  //           <Box
  //             as={RefreshCw}
  //             boxSize={8}
  //             color="blue.500"
  //             className="animate-spin"
  //           />
  //           <Text>{t("courtsTab.loadingSuggestedPlayers")}</Text>
  //         </VStack>
  //       </Box>
  //     </Box>
  //   );
  // }

  // Combine players from both pairs
  const allPlayers = suggestedPlayers
    ? [...suggestedPlayers.pair1.players, ...suggestedPlayers.pair2.players]
    : [];

  const modalTitle =
    title ||
    t("courtsTab.autoAssignMatchTitle", { courtNumber: court.courtNumber });
  const modalDescription =
    description || t("courtsTab.autoAssignMatchDescription");

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

        <Box p={4} pt={0} flex="1" overflowY="auto">
          {/* <Text fontSize="sm" color="gray.600" mb={4}>
            {modalDescription}
          </Text> */}
          {/* TopCount Selection */}
          {waitingPlayersCount && (
            <Box bg="gray.50" p={3} borderRadius="md">
              <HStack gap={3} align="center">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  {t("courtsTab.playersToConsider")}:
                </Text>
                <Box flex="1" maxW="130px">
                  <select
                    style={{
                      fontSize: "14px",
                      backgroundColor: "white",
                      borderColor: "#d1d5db",
                      borderWidth: "1px",
                      borderRadius: "6px",
                      padding: "8px",
                      width: "100%",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.6 : 1,
                    }}
                    value={topCount}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleTopCountChange(parseInt(e.target.value))
                    }
                    disabled={isLoading}
                  >
                    {Array.from(
                      { length: Math.max(0, waitingPlayersCount - 3) },
                      (_, i) => i + 4
                    ).map((count) => (
                      <option key={count} value={count}>
                        {count} {t("courtsTab.players")}
                      </option>
                    ))}
                  </select>
                </Box>
                <Box fontSize="sm" color="gray.500">
                  {t("courtsTab.longestWait")}
                </Box>
              </HStack>
            </Box>
          )}
          <Box>
            <BadmintonCourt
              players={allPlayers.map((player: Player, index: number) => ({
                ...player, // Include all properties from the original player
                pairNumber: index % 2 === 0 ? 1 : 2, // Column-based pairing: left (0,2) = pair 1, right (1,3) = pair 2
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
          {/* Display pair information */}
          <VStack gap={2} mt={2}>
            {!isLoading && suggestedPlayers && (
              <HStack
                justify="space-between"
                width="full"
                px={4}
                align="center"
              >
                <HStack gap={2} justify="center" flex="1">
                  <Badge colorPalette="blue" variant="solid" fontSize="sm">
                    {t("courtsTab.pair1")}
                  </Badge>
                </HStack>

                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="gray.600"
                  minW="80px"
                  textAlign="center"
                >
                  Vs
                </Text>

                <HStack gap={2} justify="center" flex="1">
                  <Badge colorPalette="orange" variant="solid" fontSize="sm">
                    {t("courtsTab.pair2")}
                  </Badge>
                </HStack>
              </HStack>
            )}

            {!isLoading && suggestedPlayers ? (
              <Box
                bg="gray.50"
                borderRadius="lg"
                p={3}
                border="1px solid"
                borderColor="gray.200"
                maxHeight="280px"
                overflowY="auto"
                width="full"
              >
                <HStack gap={2} width="full" justify="center" align="stretch">
                  {/* Pair 1 */}
                  <Box
                    bg="blue.50"
                    border="2px solid"
                    borderColor="blue.200"
                    borderRadius="lg"
                    p={3}
                    textAlign="center"
                    flex="1"
                    minW="140px"
                    position="relative"
                  >
                    <Badge
                      colorPalette="yellow"
                      variant="solid"
                      fontSize="xs"
                      position="absolute"
                      top={2}
                      right={2}
                      borderRadius="full"
                    >
                      {suggestedPlayers.pair1.totalLevelScore}
                    </Badge>
                    <VStack gap={1.5}>
                      {suggestedPlayers.pair1.players.map((player: Player) => (
                        <Box
                          key={player.id}
                          bg="white"
                          borderRadius="md"
                          p={2}
                          border="1px solid"
                          borderColor="blue.100"
                          width="full"
                        >
                          <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color="gray.800"
                          >
                            #{player.playerNumber}
                          </Text>
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            mb={1}
                            overflow="hidden"
                            whiteSpace="nowrap"
                            textOverflow="ellipsis"
                          >
                            {player.name ||
                              t("courtsTab.playerFallback", {
                                number: player.playerNumber,
                              })}
                          </Text>
                          <HStack justify="center" gap={1}>
                            {player.gender && (
                              <Box
                                as={
                                  player.gender === "MALE"
                                    ? Mars
                                    : player.gender === "FEMALE"
                                    ? Venus
                                    : User
                                }
                                boxSize={3}
                                color={
                                  player.gender === "MALE"
                                    ? "#3182ce"
                                    : player.gender === "FEMALE"
                                    ? "#d53f8c"
                                    : "#718096"
                                }
                              />
                            )}
                            {player.level && (
                              <Badge
                                colorPalette="red"
                                size="sm"
                                variant="solid"
                                fontSize="xs"
                              >
                                {getLevelLabel(player.level)}
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  {/* Gap indicator */}
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    minW="60px"
                  >
                    <Text
                      fontSize="sm"
                      // fontWeight="bold"
                      color="gray.600"
                      // minW="80px"
                      textAlign="center"
                      mb={1}
                    >
                      {t("courtsTab.gapLabel")}
                    </Text>
                    <Badge
                      colorPalette="yellow"
                      variant="solid"
                      fontSize="xs"
                      // borderRadius="full"
                    >
                      {suggestedPlayers.scoreDifference}
                    </Badge>
                  </Flex>

                  {/* Pair 2 */}
                  <Box
                    bg="orange.50"
                    border="2px solid"
                    borderColor="orange.200"
                    borderRadius="lg"
                    p={3}
                    textAlign="center"
                    flex="1"
                    minW="140px"
                    position="relative"
                  >
                    <Badge
                      colorPalette="yellow"
                      variant="solid"
                      fontSize="xs"
                      position="absolute"
                      top={2}
                      left={2}
                      borderRadius="full"
                    >
                      {suggestedPlayers.pair2.totalLevelScore}
                    </Badge>
                    <VStack gap={1.5}>
                      {suggestedPlayers.pair2.players.map((player: Player) => (
                        <Box
                          key={player.id}
                          bg="white"
                          borderRadius="md"
                          p={2}
                          border="1px solid"
                          borderColor="orange.100"
                          width="full"
                        >
                          <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color="gray.800"
                          >
                            #{player.playerNumber}
                          </Text>
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            mb={1}
                            overflow="hidden"
                            whiteSpace="nowrap"
                            textOverflow="ellipsis"
                          >
                            {player.name ||
                              t("courtsTab.playerFallback", {
                                number: player.playerNumber,
                              })}
                          </Text>
                          <HStack justify="center" gap={1}>
                            {player.gender && (
                              <Box
                                as={
                                  player.gender === "MALE"
                                    ? Mars
                                    : player.gender === "FEMALE"
                                    ? Venus
                                    : User
                                }
                                boxSize={3}
                                color={
                                  player.gender === "MALE"
                                    ? "#3182ce"
                                    : player.gender === "FEMALE"
                                    ? "#d53f8c"
                                    : "#718096"
                                }
                              />
                            )}
                            {player.level && (
                              <Badge
                                colorPalette="red"
                                size="sm"
                                variant="solid"
                                fontSize="xs"
                              >
                                {getLevelLabel(player.level)}
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </HStack>
              </Box>
            ) : (
              <Flex justify="center" py={4}>
                <Spinner color="blue.500" />
              </Flex>
            )}
          </VStack>
        </Box>

        <Flex
          justify="flex-end"
          gap={2}
          p={4}
          borderTop="1px"
          borderColor="gray.200"
          position="sticky"
          bottom={0}
          bg="white"
          zIndex={1}
        >
          {onBack && (
            <CompatButton
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
            >
              <Box as={ArrowLeft} boxSize={4} mr={1} />
              {t("courtsTab.back")}
            </CompatButton>
          )}
          <CompatButton
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isConfirming}
          >
            {t("courtsTab.cancel")}
          </CompatButton>
          <CompatButton
            // colorPalette="green"
            onClick={handleConfirm}
            loading={isConfirming}
            disabled={isLoading}
          >
            <Box as={Play} boxSize={4} mr={1} />
            {t("courtsTab.confirmMatch")}
          </CompatButton>
        </Flex>
      </Box>
    </Box>
  );
};

export default MatchPreviewModal;
