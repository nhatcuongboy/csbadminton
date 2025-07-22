"use client";

import { Button } from "@/components/ui/chakra-compat";
import TopBar from "@/components/ui/TopBar";
import { useRouter } from "@/i18n/config";
import {
  Level,
  PlayerService,
  SessionService,
  type Player,
  type Session,
} from "@/lib/api";
import {
  Box,
  Container,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Check, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const playerNumber = searchParams.get("playerNumber");
  const playerId = searchParams.get("playerId");
  const t = useTranslations("pages.join");
  const tCommon = useTranslations("common");

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
    desire: "",
  });

  useEffect(() => {
    async function loadSessionAndPlayer() {
      try {
        if (!sessionId || !playerNumber) {
          toast.error(t("confirm.errors.missingInfo"));
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
            desire: playerData.desire || "",
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
              desire: foundPlayer.desire || "",
            });
          } else {
            toast.error(t("confirm.errors.playerNotFound"));
            router.push("/join");
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error(t("confirm.errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    }

    loadSessionAndPlayer();
  }, [sessionId, playerNumber, playerId, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!player) {
      toast.error(t("confirm.errors.playerNotFound"));
      return;
    }

    // Validate form data
    if (!formData.name || !formData.gender || !formData.level) {
      toast.error(t("confirm.errors.requiredFields"));
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
        desire: formData.desire || undefined,
        phone: formData.phone || undefined,
        confirmedByPlayer: true,
      };

      // Call the API to confirm the player
      await PlayerService.confirmPlayer(player.id, playerData);

      // Redirect to status page with player ID
      router.push(`/join/status?playerId=${player.id}`);
    } catch (error) {
      console.error("Error confirming player:", error);
      toast.error(t("confirm.errors.confirmFailed"));
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh">
        <TopBar
          showBackButton={true}
          backHref="/join"
          title={t("confirm.title")}
        />
        <Container maxW="md" py={12} pt={24}>
          <Flex
            justify="center"
            align="center"
            height="50vh"
            direction="column"
          >
            <Spinner size="xl" color="blue.500" mb={4} />
            <Text>{tCommon("loading")}</Text>
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh">
      {/* Top Bar */}
      <TopBar
        showBackButton={true}
        backHref="/join"
        title={t("confirm.title")}
      />

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
              <Heading size="md">{t("confirm.subtitle")}</Heading>
            </Flex>
            <Text color="gray.500" fontSize="sm">
              {t("confirm.description", { sessionName: session?.name || "" })}
            </Text>
          </Box>

          {/* Card Content */}
          <Box p={6}>
            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    {t("confirm.playerNumber", {
                      number: player?.playerNumber || 0,
                    })}
                  </Text>

                  {!player?.requireConfirmInfo && (
                    <Box
                      mb={4}
                      p={3}
                      bg="yellow.50"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="yellow.200"
                    >
                      <Text fontSize="sm" color="yellow.800">
                        ℹ️ {t("confirm.form.noInfoRequired")}
                      </Text>
                    </Box>
                  )}

                  {/* {player?.requireConfirmInfo && (
                    <Box
                      mb={4}
                      p={3}
                      bg="blue.50"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="blue.200"
                    >
                      <Text fontSize="sm" color="blue.800">
                        📝 Please fill in your details to complete your
                        registration.
                      </Text>
                    </Box>
                  )} */}
                  <Box mb={4}>
                    <Text fontWeight="medium" mb={1} fontSize="sm">
                      {t("confirm.form.fullName")}{" "}
                      <Box as="span" color="red.500">
                        *
                      </Box>
                    </Text>
                    <Input
                      value={formData.name}
                      onChange={handleInputChange}
                      name="name"
                      placeholder={t("confirm.form.namePlaceholder")}
                      size="lg"
                      required
                      disabled={!player?.requireConfirmInfo}
                      opacity={!player?.requireConfirmInfo ? 0.6 : 1}
                    />
                  </Box>

                  <Flex gap={4} mb={4}>
                    <Box flex={1}>
                      <Text fontWeight="medium" mb={1} fontSize="sm">
                        {t("confirm.form.gender")}{" "}
                        <Box as="span" color="red.500">
                          *
                        </Box>
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
                        <option value="">
                          {t("confirm.form.selectGender")}
                        </option>
                        <option value="MALE">{t("confirm.form.male")}</option>
                        <option value="FEMALE">
                          {t("confirm.form.female")}
                        </option>
                      </select>
                    </Box>

                    <Box flex={1}>
                      <Text fontWeight="medium" mb={1} fontSize="sm">
                        {t("confirm.form.skillLevel")}{" "}
                        <Box as="span" color="red.500">
                          *
                        </Box>
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
                        <option value="">
                          {t("confirm.form.selectLevel")}
                        </option>
                        <option value={Level.Y_MINUS}>
                          {t("confirm.form.levels.beginner")}
                        </option>
                        <option value={Level.Y}>
                          {t("confirm.form.levels.weak")}
                        </option>
                        <option value={Level.Y_PLUS}>
                          {t("confirm.form.levels.weakPlus")}
                        </option>
                        <option value={Level.TBY}>
                          {t("confirm.form.levels.mediumWeak")}
                        </option>
                        <option value={Level.TB_MINUS}>
                          {t("confirm.form.levels.mediumMinus")}
                        </option>
                        <option value={Level.TB}>
                          {t("confirm.form.levels.medium")}
                        </option>
                        <option value={Level.TB_PLUS}>
                          {t("confirm.form.levels.mediumPlus")}
                        </option>
                        <option value={Level.K}>
                          {t("confirm.form.levels.advanced")}
                        </option>
                      </select>
                    </Box>
                  </Flex>

                  <Box mb={4}>
                    <Text fontWeight="medium" mb={1} fontSize="sm">
                      {t("confirm.form.levelDescription")}
                    </Text>
                    <Input
                      value={formData.levelDescription}
                      onChange={handleInputChange}
                      name="levelDescription"
                      placeholder={t(
                        "confirm.form.levelDescriptionPlaceholder"
                      )}
                      size="lg"
                      disabled={!player?.requireConfirmInfo}
                      opacity={!player?.requireConfirmInfo ? 0.6 : 1}
                    />
                  </Box>

                  <Box mb={4}>
                    <Text fontWeight="medium" mb={1} fontSize="sm">
                      {t("confirm.form.desire")}
                    </Text>
                    <Input
                      value={formData.desire || ""}
                      onChange={handleInputChange}
                      name="desire"
                      placeholder={t("confirm.form.desirePlaceholder")}
                      size="lg"
                      disabled={!player?.requireConfirmInfo}
                      opacity={!player?.requireConfirmInfo ? 0.6 : 1}
                    />
                  </Box>

                  <Box>
                    <Text fontWeight="medium" mb={1} fontSize="sm">
                      {t("confirm.form.phoneNumber")}
                    </Text>
                    <Input
                      value={formData.phone}
                      onChange={handleInputChange}
                      name="phone"
                      placeholder={t("confirm.form.phonePlaceholder")}
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
                  disabled={
                    isSubmitting ||
                    (!player?.requireConfirmInfo && player?.confirmedByPlayer)
                  }
                >
                  <Flex align="center" justify="center" width="100%">
                    {isSubmitting
                      ? t("confirm.form.processing")
                      : !player?.requireConfirmInfo && player?.confirmedByPlayer
                      ? t("confirm.form.alreadyConfirmed")
                      : t("confirm.form.confirmButton")}
                    {!isSubmitting &&
                      !(
                        !player?.requireConfirmInfo && player?.confirmedByPlayer
                      ) && <Box as={Check} ml={2} boxSize={5} />}
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
              {t("confirm.footer")}
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
