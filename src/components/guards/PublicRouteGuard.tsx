"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import { useLocale } from "next-intl";

interface PublicRouteGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * PublicRouteGuard - Protects public pages (no authentication required)
 * If user is already logged in, redirect to functional pages
 * Used for pages: /, /auth/signin, /auth/signup, /join-by-code
 */
export default function PublicRouteGuard({
  children,
  redirectTo = "/host",
}: PublicRouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // If already logged in, redirect to functional pages
    if (status === "authenticated" && session?.user) {
      let targetPath = redirectTo;

      // Override redirectTo based on user role
      if (session.user.role === "HOST") {
        targetPath = "/host";
      } else if (session.user.role === "PLAYER") {
        const playerId = (session.user as any).playerId;
        targetPath = playerId
          ? `/join/status?playerId=${playerId}`
          : "/join-by-code";
      }

      // Ensure the redirect path includes the locale
      const localizedRedirectTo = targetPath.startsWith("/")
        ? `/${locale}${targetPath}`
        : targetPath;
      router.push(localizedRedirectTo);
    }
  }, [session, status, router, redirectTo, locale]);

  // Loading state
  if (status === "loading") {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
      >
        <VStack gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.600">Checking authentication...</Text>
        </VStack>
      </Box>
    );
  }

  // If already logged in, show loading while redirecting
  if (status === "authenticated") {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
      >
        <VStack gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.600">Redirecting...</Text>
        </VStack>
      </Box>
    );
  }

  // If not logged in, allow access
  return <>{children}</>;
}
