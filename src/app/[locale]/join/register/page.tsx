"use client";

import { useState, Suspense } from "react";
import { useRouter } from "@/i18n/config";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { Level, AuthService } from "@/lib/api";
import toast from "react-hot-toast";
import { signIn, getSession } from "next-auth/react";
import TopBar from "@/components/ui/TopBar";
import { useTranslations } from "next-intl";

function RegisterContent() {
  const t = useTranslations("pages.join.register");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("MALE");
  const [level, setLevel] = useState<Level>(Level.TB_MINUS);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionCode = searchParams.get("code");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    if (!sessionCode) {
      toast.error(t("invalidSessionCode"));
      return;
    }

    setLoading(true);

    try {
      const playerResult = await AuthService.joinByCode(sessionCode, {
        name,
        gender,
        level,
        phone,
      });

      // For player codes, proceed with normal join
      const result = await signIn("otp", {
        joinCode: playerResult.data?.player.joinCode,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t("invalidSessionCode"));
        return;
      }

      // Get session data after successful signIn
      const session = await getSession();
      const user = session?.user as any;

      // Check requireConfirmInfo to determine navigation
      if (user?.requireConfirmInfo && !user?.confirmedByPlayer) {
        router.push("/join/confirm?playerId=" + user.playerId);
      } else {
        router.push(`/join/status?playerId=${user.playerId}`);
      }
    } catch (error) {
      toast.error(t("joinFailed"));
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <TopBar title={t("title")} />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
        py={8}
        pt="80px"
      >
        <Box
          maxW="md"
          w="full"
          bg="white"
          p={8}
          borderRadius="lg"
          boxShadow="lg"
        >
          <VStack gap={6}>
            <Box textAlign="center">
              <Heading size="lg" color="green.600">
                🏸 {t("title")}
              </Heading>
              <Text color="gray.600" mt={2}>
                {t("subtitle")}
              </Text>
            </Box>

            <form onSubmit={handleRegister} style={{ width: "100%" }}>
              <VStack gap={4}>
                <Box w="full">
                  <Text mb={2} fontWeight="medium">
                    {t("name")} *
                  </Text>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    required
                  />
                </Box>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">
                    {t("gender")}
                  </Text>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #E2E8F0",
                      backgroundColor: "white",
                      fontSize: "16px",
                    }}
                  >
                    <option value="MALE">{t("male")}</option>
                    <option value="FEMALE">{t("female")}</option>
                    <option value="OTHER">{t("other")}</option>
                    <option value="PREFER_NOT_TO_SAY">{t("preferNotToSay")}</option>
                  </select>
                </Box>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">
                    {t("skillLevel")}
                  </Text>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as Level)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #E2E8F0",
                      backgroundColor: "white",
                      fontSize: "16px",
                    }}
                  >
                    <option value={Level.Y_MINUS}>Y-</option>
                    <option value={Level.Y}>Y</option>
                    <option value={Level.Y_PLUS}>Y+</option>
                    <option value={Level.TBY}>TBY</option>
                    <option value={Level.TB_MINUS}>TB-</option>
                    <option value={Level.TB}>TB</option>
                    <option value={Level.TB_PLUS}>TB+</option>
                    <option value={Level.K}>K</option>
                  </select>
                </Box>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">
                    {t("phone")}
                  </Text>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("phonePlaceholder")}
                    type="tel"
                  />
                </Box>

                <Button
                  type="submit"
                  colorScheme="green"
                  width="full"
                  size="lg"
                  loading={loading}
                  disabled={!name.trim()}
                >
                  {loading ? t("joining") : t("joinSession")}
                </Button>
              </VStack>
            </form>

            <Text fontSize="sm" color="gray.500" textAlign="center">
              {t("agreementText")}
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <RegisterContent />
    </Suspense>
  );
}
