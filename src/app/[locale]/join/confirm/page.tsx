"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ArrowLeft, Check, User } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/chakra-compat";
import {
  PlayerService,
  SessionService,
  type Player,
  type Session,
} from "@/lib/api";
import { useTranslations } from "next-intl";
import { Link as IntlLink } from "@/i18n/config";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const playerNumber = searchParams.get("playerNumber");
  const playerId = searchParams.get("playerId");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    gender: "" as "" | "MALE" | "FEMALE",
    level: "" as "" | "Y" | "Y_PLUS" | "TBY" | "TB_MINUS" | "TB" | "TB_PLUS",
    phone: "",
  });

  // Translations
  const t = useTranslations("pages.join.confirm");
  const common = useTranslations("common");
  const playerT = useTranslations("player");

  useEffect(() => {
    async function loadSessionAndPlayer() {
      try {
        if (!sessionId || !playerNumber) {
          toast.error(t("errors.missingInfo"));
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
              phone: foundPlayer.phone || "",
            });
          } else {
            toast.error(t("errors.playerNotFound"));
            router.push("/join");
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error(t("errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    }

    loadSessionAndPlayer();
  }, [sessionId, playerNumber, playerId, router, t]);

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
      toast.error(t("errors.playerNotFound"));
      return;
    }

    // Validate form data
    if (!formData.name || !formData.gender || !formData.level) {
      toast.error(t("errors.requiredFields"));
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data with proper types
      const playerData: Partial<Player> = {
        name: formData.name,
        gender: formData.gender as "MALE" | "FEMALE",
        level: formData.level as
          | "Y"
          | "Y_PLUS"
          | "TBY"
          | "TB_MINUS"
          | "TB"
          | "TB_PLUS",
        phone: formData.phone || undefined,
        confirmedByPlayer: true,
      };

      // Call the API to confirm the player
      await PlayerService.confirmPlayer(player.id, playerData);

      // Redirect to status page with player ID
      router.push(`/join/status?playerId=${player.id}`);
    } catch (error) {
      console.error("Error confirming player:", error);
      toast.error(t("errors.confirmFailed"));
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="md" py={12}>
        <Flex justify="center" align="center" height="50vh" direction="column">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text>{common("loading")}</Text>
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={12}>
      {/* Language Switcher */}
      <Flex justify="flex-end" mb={4}>
        <LanguageSwitcher />
      </Flex>

      {/* Header with back button */}
      <Flex alignItems="center" mb={8} position="relative">
        <IntlLink href="/join">
          <Button
            variant="outline"
            size="sm"
            mr={4}
            borderRadius="full"
            transition="all 0.2s"
            _hover={{
              bg: "blue.50",
              borderColor: "blue.300",
              transform: "translateY(-2px)",
              boxShadow: "sm",
            }}
          >
            <Flex alignItems="center">
              <Box as={ArrowLeft} boxSize={4} mr={2} />
              {common("back")}
            </Flex>
          </Button>
        </IntlLink>
        <Heading size="lg">{t("title")}</Heading>
      </Flex>

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
            <Heading size="md">{t("subtitle")}</Heading>
          </Flex>
          <Text color="gray.500" fontSize="sm">
            {t("description", { sessionName: session?.name || "" })}
          </Text>
        </Box>

        {/* Card Content */}
        <Box p={6}>
          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Box>
                <Text fontWeight="medium" mb={2}>
                  {t("playerNumber", { number: player?.playerNumber || 0 })}
                </Text>
                <Box mb={4}>
                  <Text fontWeight="medium" mb={1} fontSize="sm">
                    {playerT("name")}{" "}
                    <Box as="span" color="red.500">
                      *
                    </Box>
                  </Text>
                  <Input
                    value={formData.name}
                    onChange={handleInputChange}
                    name="name"
                    placeholder={t("form.namePlaceholder")}
                    size="lg"
                    required
                  />
                </Box>

                <Flex gap={4} mb={4}>
                  <Box flex={1}>
                    <Text fontWeight="medium" mb={1} fontSize="sm">
                      {t("form.gender")}{" "}
                      <Box as="span" color="red.500">
                        *
                      </Box>
                    </Text>
                    <select
                      value={formData.gender}
                      onChange={handleInputChange}
                      name="gender"
                      required
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        borderWidth: "1px",
                        borderColor: "#CBD5E0",
                        height: "48px",
                      }}
                    >
                      <option value="">{t("form.selectGender")}</option>
                      <option value="MALE">{t("form.male")}</option>
                      <option value="FEMALE">{t("form.female")}</option>
                    </select>
                  </Box>

                  <Box flex={1}>
                    <Text fontWeight="medium" mb={1} fontSize="sm">
                      {playerT("skillLevel")}{" "}
                      <Box as="span" color="red.500">
                        *
                      </Box>
                    </Text>
                    <select
                      value={formData.level}
                      onChange={handleInputChange}
                      name="level"
                      required
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        borderWidth: "1px",
                        borderColor: "#CBD5E0",
                        height: "48px",
                      }}
                    >
                      <option value="">{t("form.selectLevel")}</option>
                      <option value="Y">Y ({t("form.levels.weak")})</option>
                      <option value="Y_PLUS">
                        Y+ ({t("form.levels.weakPlus")})
                      </option>
                      <option value="TBY">
                        TBY ({t("form.levels.mediumWeak")})
                      </option>
                      <option value="TB_MINUS">
                        TB- ({t("form.levels.mediumMinus")})
                      </option>
                      <option value="TB">TB ({t("form.levels.medium")})</option>
                      <option value="TB_PLUS">
                        TB+ ({t("form.levels.mediumPlus")})
                      </option>
                    </select>
                  </Box>
                </Flex>

                <Box>
                  <Text fontWeight="medium" mb={1} fontSize="sm">
                    {playerT("phone")} ({common("optional")})
                  </Text>
                  <Input
                    value={formData.phone}
                    onChange={handleInputChange}
                    name="phone"
                    placeholder={t("form.phonePlaceholder")}
                    size="lg"
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
                disabled={isSubmitting}
              >
                <Flex align="center" justify="center" width="100%">
                  {isSubmitting
                    ? t("form.processing")
                    : t("form.confirmButton")}
                  {!isSubmitting && <Box as={Check} ml={2} boxSize={5} />}
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
            {t("footer")}
          </Text>
        </Box>
      </Box>
    </Container>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ConfirmPageContent />
    </Suspense>
  );
}
