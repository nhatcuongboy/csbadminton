"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/config";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { NextLinkButton } from "@/components/ui/NextLinkButton";
import { ArrowLeft, Check, User } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/chakra-compat";
import { PlayerService, SessionService, type Player, type Session, Level } from "@/lib/api";
import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const playerNumber = searchParams.get("playerNumber");
  const playerId = searchParams.get("playerId");
  const t = useTranslations();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    gender: "" as "" | "MALE" | "FEMALE",
    level: "" as "" | Level,
    levelDescription: "",
    phone: "",
  });

  useEffect(() => {
    async function loadSessionAndPlayer() {
      try {
        if (!sessionId || !playerNumber) {
          toast.error("Missing session or player information");
          router.push("/join");
          return;
        }

        setIsLoading(true);
        // Fetch session details
        const sessionData = await SessionService.getSession(sessionId);
        setSession(sessionData);

        if (playerId) {
          // If we have a player ID, fetch the player directly
          const playerData = await PlayerService.getPlayer(playerId);
          setPlayer(playerData);

          // Pre-populate form with any existing data
          setFormData({
            name: playerData.name || "",
            gender: playerData.gender || "",
            level: playerData.level || "",
            levelDescription: playerData.levelDescription || "",
            phone: playerData.phone || "",
          });
        } else {
          // If we only have player number, find the player in the session
          const players = sessionData.players || [];
          const foundPlayer = players.find(
            (p) => p.playerNumber.toString() === playerNumber
          );

          if (foundPlayer) {
            setPlayer(foundPlayer);
            // Pre-populate form with any existing data
            setFormData({
              name: foundPlayer.name || "",
              gender: foundPlayer.gender || "",
              level: foundPlayer.level || "",
              levelDescription: foundPlayer.levelDescription || "",
              phone: foundPlayer.phone || "",
            });
          } else {
            toast.error("Player not found");
            router.push("/join");
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load player information");
      } finally {
        setIsLoading(false);
      }
    }

    loadSessionAndPlayer();
  }, [sessionId, playerNumber, playerId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player) {
      toast.error("Player information not found");
      return;
    }

    // Validate form data
    if (!formData.name || !formData.gender || !formData.level) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare data with proper types
      const playerData: Partial<Player> = {
        name: formData.name,
        gender: formData.gender as "MALE" | "FEMALE",
        level: formData.level as Level,
        levelDescription: formData.levelDescription || undefined,
        phone: formData.phone || undefined,
        confirmedByPlayer: true,
      };
      
      // Call the API to confirm the player
      await PlayerService.confirmPlayer(player.id, playerData);

      // Redirect to status page with player ID
      router.push(`/join/status?playerId=${player.id}`);
    } catch (error) {
      console.error("Error confirming player:", error);
      toast.error("Failed to confirm registration");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh">
        <TopBar showBackButton={true} backHref="/join" title="Confirm Details" />
        <Container maxW="md" py={12} pt={24}>
          <Flex justify="center" align="center" height="50vh" direction="column">
            <Spinner size="xl" color="blue.500" mb={4} />
            <Text>Loading player information...</Text>
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh">
      {/* Top Bar */}
      <TopBar showBackButton={true} backHref="/join" title="Confirm Details" />
      
      <Container maxW="md" py={12} pt={24}>
        <Box
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
          borderWidth="1px"
          bg="white"
          _dark={{ bg: "gray.800" }}
        >
          {/* Card Header */}
          <Box
            bg="blue.50"
            _dark={{ bg: "blue.900" }}
            borderBottomWidth="1px"
            px={6}
            py={5}
          >
            <Flex align="center" mb={2}>
              <Box as={User} boxSize={5} color="blue.500" mr={2} />
              <Heading size="md">Complete Your Registration</Heading>
            </Flex>
            <Text color="gray.500" fontSize="sm">
              Fill in your details to join {session?.name}
            </Text>
          </Box>

          {/* Card Content */}
          <Box p={6}>
            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Player #{player?.playerNumber}
                  </Text>
                  
                  {!player?.requireConfirmInfo && (
                    <Box mb={4} p={3} bg="yellow.50" borderRadius="md" borderWidth="1px" borderColor="yellow.200">
                      <Text fontSize="sm" color="yellow.800">
                        ℹ️ This session doesn't require detailed information. Your current details are shown below for confirmation only.
                      </Text>
                    </Box>
                  )}
                  
                  {player?.requireConfirmInfo && (
                    <Box mb={4} p={3} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
                      <Text fontSize="sm" color="blue.800">
                        📝 Please fill in your details to complete your registration.
                      </Text>
                    </Box>
                  )}
                  <Box mb={4}>
                    <Text fontWeight="medium" mb={1} fontSize="sm">
                      Full Name <Box as="span" color="red.500">*</Box>
                    </Text>
                    <Input
                      value={formData.name}
                      onChange={handleInputChange}
                      name="name"
                      placeholder="Enter your name"
                      size="lg"
                      required
                      disabled={!player?.requireConfirmInfo}
                      opacity={!player?.requireConfirmInfo ? 0.6 : 1}
                    />
                  </Box>

                  <Flex gap={4} mb={4}>
                    <Box flex={1}>
                      <Text fontWeight="medium" mb={1} fontSize="sm">
                        Gender <Box as="span" color="red.500">*</Box>
                      </Text>
                      <select
                        value={formData.gender}
                        onChange={handleInputChange}
                        name="gender"
                        required
                        disabled={!player?.requireConfirmInfo}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          borderWidth: "1px",
                          borderColor: "#CBD5E0",
                          height: "48px",
                          opacity: !player?.requireConfirmInfo ? 0.6 : 1,
                        }}
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </Box>

                    <Box flex={1}>
                      <Text fontWeight="medium" mb={1} fontSize="sm">
                        Skill Level <Box as="span" color="red.500">*</Box>
                      </Text>
                      <select
                        value={formData.level}
                        onChange={handleInputChange}
                        name="level"
                        required
                        disabled={!player?.requireConfirmInfo}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          borderWidth: "1px",
                          borderColor: "#CBD5E0",
                          height: "48px",
                          opacity: !player?.requireConfirmInfo ? 0.6 : 1,
                        }}
                      >
                        <option value="">Select Level</option>
                        <option value={Level.Y_MINUS}>Y- (Beginner)</option>
                        <option value={Level.Y}>Y (Weak)</option>
                        <option value={Level.Y_PLUS}>Y+ (Weak+)</option>
                        <option value={Level.TBY}>TBY (Medium-weak)</option>
                        <option value={Level.TB_MINUS}>TB- (Medium-)</option>
                        <option value={Level.TB}>TB (Medium)</option>
                        <option value={Level.TB_PLUS}>TB+ (Medium+)</option>
                        <option value={Level.K}>K (Advanced)</option>
                      </select>
                    </Box>
                  </Flex>

                  <Box mb={4}>
                    <Text fontWeight="medium" mb={1} fontSize="sm">
                      Level Description (Optional)
                    </Text>
                    <Input
                      value={formData.levelDescription}
                      onChange={handleInputChange}
                      name="levelDescription"
                      placeholder="Describe your playing style or experience"
                      size="lg"
                      disabled={!player?.requireConfirmInfo}
                      opacity={!player?.requireConfirmInfo ? 0.6 : 1}
                    />
                  </Box>

                  <Box>
                    <Text fontWeight="medium" mb={1} fontSize="sm">
                      Phone Number (Optional)
                    </Text>
                    <Input
                      value={formData.phone}
                      onChange={handleInputChange}
                      name="phone"
                      placeholder="+84 xxx xxx xxx"
                      size="lg"
                      disabled={!player?.requireConfirmInfo}
                      opacity={!player?.requireConfirmInfo ? 0.6 : 1}
                    />
                  </Box>
                </Box>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  mt={4}
                  loading={isSubmitting}
                  disabled={isSubmitting || (!player?.requireConfirmInfo && player?.confirmedByPlayer)}
                >
                  <Flex align="center" justify="center" width="100%">
                    {isSubmitting ? "Processing..." : 
                     (!player?.requireConfirmInfo && player?.confirmedByPlayer) ? "Already Confirmed" :
                     "Confirm & Join"}
                    {!isSubmitting && !(!player?.requireConfirmInfo && player?.confirmedByPlayer) && (
                      <Box as={Check} ml={2} boxSize={5} />
                    )}
                  </Flex>
                </Button>
              </Stack>
            </form>
          </Box>

          {/* Card Footer */}
          <Box
            bg="gray.50"
            _dark={{ bg: "gray.700" }}
            borderTopWidth="1px"
            p={4}
            textAlign="center"
          >
            <Text fontSize="sm" color="gray.500">
              This information will be visible to the session host
            </Text>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ConfirmPageContent />
    </Suspense>
  );
}
