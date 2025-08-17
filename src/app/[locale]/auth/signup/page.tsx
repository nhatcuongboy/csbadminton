"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/config";
import PublicRouteGuard from "@/components/guards/PublicRouteGuard";
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Text,
  Link,
  Separator,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import TopBar from "@/components/ui/TopBar";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
  const t = useTranslations("auth.signup");
  const params = useParams();
  const locale = params.locale as string;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("accountCreated"));
        router.push("/auth/signin");
      } else {
        toast.error(data.message || t("registrationFailed"));
      }
    } catch (error) {
      toast.error(t("registrationFailed"));
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <PublicRouteGuard redirectTo="/host">
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
                <Heading size="lg" color="blue.600">
                  {t("heading")}
                </Heading>
                <Text color="gray.600" mt={2}>
                  {t("description")}
                </Text>
              </Box>

              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <VStack gap={4}>
                  <Box w="full">
                    <Text mb={2} fontWeight="medium">
                      {t("name")}
                    </Text>
                    <Input
                      value={formData.name}
                      onChange={handleChange("name")}
                      placeholder={t("namePlaceholder")}
                      required
                    />
                  </Box>

                  <Box w="full">
                    <Text mb={2} fontWeight="medium">
                      {t("email")}
                    </Text>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                      placeholder={t("emailPlaceholder")}
                      required
                    />
                  </Box>

                  <Box w="full">
                    <Text mb={2} fontWeight="medium">
                      {t("password")}
                    </Text>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={handleChange("password")}
                      placeholder={t("passwordPlaceholder")}
                      required
                    />
                  </Box>

                  <Box w="full">
                    <Text mb={2} fontWeight="medium">
                      {t("confirmPassword")}
                    </Text>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange("confirmPassword")}
                      placeholder={t("confirmPasswordPlaceholder")}
                      required
                    />
                  </Box>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="full"
                    size="lg"
                    loading={loading}
                  >
                    {t("createAccount")}
                  </Button>
                </VStack>
              </form>

              <VStack gap={2}>
                <Text color="gray.600">
                  {t("alreadyHaveAccount")}{" "}
                  <Link
                    href="/auth/signin"
                    color="blue.600"
                    fontWeight="semibold"
                  >
                    {t("signIn")}
                  </Link>
                </Text>

                <Text color="gray.500" fontSize="sm">
                  {t("or")}{" "}
                  <Link
                    href={`/${locale}/join-by-code`}
                    color="blue.600"
                    fontWeight="semibold"
                  >
                    {t("joinAsGuest")}
                  </Link>
                </Text>
              </VStack>
            </VStack>
          </Box>
        </Box>
      </Box>
    </PublicRouteGuard>
  );
}
