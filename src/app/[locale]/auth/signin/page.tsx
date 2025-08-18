"use client";

import PublicRouteGuard from "@/components/guards/PublicRouteGuard";
import TopBar from "@/components/ui/TopBar";
import {
  Box,
  Button,
  Heading,
  Input,
  Link,
  Separator,
  Spinner,
  Text,
  VStack,
  Field,
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/config";
import { Suspense } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PasswordInput } from "@/components/ui/password-input";

// Define zod schema for form validation
const signInSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}/host`;
  const t = useTranslations("auth.signin");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t("invalidCredentials"));
      } else {
        toast.success(t("loginSuccessful"));
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error(t("loginFailed"));
      console.error("Login error:", error);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
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
                <Heading size="lg" color="brand.600">
                  {t("appTitle")}
                </Heading>
                <Text color="gray.600" mt={2}>
                  {t("description")}
                </Text>
              </Box>

              {searchParams.get("error") && (
                <Box
                  bg="red.50"
                  color="red.700"
                  p={3}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="red.200"
                >
                  {searchParams.get("error") === "CredentialsSignin"
                    ? t("invalidEmailOrPassword")
                    : t("authenticationFailed")}
                </Box>
              )}

              <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
                <VStack gap={4}>
                  <Field.Root invalid={!!errors.email}>
                    <Field.Label>{t("email")}</Field.Label>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder={t("emailPlaceholder")}
                    />
                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.password}>
                    <Field.Label>{t("password")}</Field.Label>
                    <PasswordInput
                      {...register("password")}
                      placeholder={t("passwordPlaceholder")}
                    />
                    <Field.ErrorText>
                      {errors.password?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="full"
                    size="lg"
                    loading={isSubmitting}
                  >
                    {t("signInButton")}
                  </Button>
                </VStack>
              </form>

              <Separator />

              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                width="full"
                size="lg"
              >
                {t("continueWithGoogle")}
              </Button>

              <VStack gap={2}>
                <Text color="gray.600">
                  {t("noAccount")}{" "}
                  <Link
                    href={`/${locale}/auth/signup`}
                    color="blue.600"
                    fontWeight="semibold"
                  >
                    {t("signUp")}
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

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Box
          minH="100vh"
          bg="gray.50"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" color="blue.500" />
        </Box>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
