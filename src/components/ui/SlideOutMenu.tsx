"use client";

import { NextLinkButton } from "@/components/ui/NextLinkButton";
import { Box, Flex, IconButton, Text, Stack, Button } from "@chakra-ui/react";
import { Home, Settings, Info, X, LogOut, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import LanguageSwitcher from "./LanguageSwitcher";
import { UserRole } from "@/lib/api/types";

interface SlideOutMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function SlideOutMenu({
  isOpen,
  onClose,
  onLogout,
}: SlideOutMenuProps) {
  const common = useTranslations("common");
  const nav = useTranslations("navigation");
  const { data: session } = useSession();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={1500}
          onClick={onClose}
        />
      )}

      {/* Slide-out Menu */}
      <Box
        position="fixed"
        top={0}
        right={0}
        bottom={0}
        width="320px"
        bg="white"
        _dark={{ bg: "gray.800" }}
        shadow="xl"
        zIndex={1600}
        transform={isOpen ? "translateX(0)" : "translateX(100%)"}
        transition="transform 0.3s ease"
        overflowY="auto"
      >
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          p={4}
          borderBottomWidth="1px"
          borderColor="gray.200"
          _dark={{ borderColor: "gray.600" }}
          height={"65px"}
        >
          <Text fontSize="xl" fontWeight="bold">
            Menu
          </Text>
          <IconButton
            aria-label="Close menu"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X size={20} />
          </IconButton>
        </Flex>

        {/* Body */}
        <Box p={4}>
          <Stack gap={6}>
            {/* Settings Section */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={3}>
                Settings
              </Text>
              <Stack gap={2}>
                <NextLinkButton
                  href={
                    session?.user?.role === UserRole.HOST
                      ? "/host/sessions"
                      : session?.user?.role === UserRole.PLAYER
                      ? `/my-session`
                      : "/"
                  }
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={onClose}
                  w="full"
                >
                  <Flex align="center" gap={3} w="full">
                    <Home size={18} />
                    <Text>{nav("home")}</Text>
                  </Flex>
                </NextLinkButton>
                <NextLinkButton
                  href="/settings"
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={onClose}
                  w="full"
                >
                  <Flex align="center" gap={3} w="full">
                    <Settings size={18} />
                    <Text>{common("settings")}</Text>
                  </Flex>
                </NextLinkButton>
                <NextLinkButton
                  href="/about"
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={onClose}
                  w="full"
                >
                  <Flex align="center" gap={3} w="full">
                    <Info size={18} />
                    <Text>{common("about")}</Text>
                  </Flex>
                </NextLinkButton>
              </Stack>
            </Box>

            {/* Language Switcher */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={3}>
                {common("language")}
              </Text>
              <Suspense fallback={<Text fontSize="sm">Loading...</Text>}>
                <LanguageSwitcher keepDrawerOpen={false} />
              </Suspense>
            </Box>

            {/* Footer */}
            <Box pt={4}>
              {/* User Info Section - Only show when logged in */}
              {session?.user && (
                <Box mb={4}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.500"
                    mb={3}
                  >
                    {common("userInfo")}
                  </Text>
                  <Flex
                    align="center"
                    gap={3}
                    p={3}
                    bg="gray.50"
                    _dark={{ bg: "gray.700" }}
                    borderRadius="md"
                    mb={4}
                  >
                    <Box
                      width="40px"
                      height="40px"
                      borderRadius="full"
                      bg="blue.500"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {(session.user.name || session.user.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </Box>
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {session.user.name || "User"}
                      </Text>
                      <Text
                        fontSize="xs"
                        color="gray.600"
                        _dark={{ color: "gray.400" }}
                      >
                        {session.user.email}
                      </Text>
                      {session.user.role && (
                        <Text
                          fontSize="xs"
                          color="blue.600"
                          _dark={{ color: "blue.400" }}
                        >
                          {session.user.role}
                        </Text>
                      )}
                    </Box>
                  </Flex>

                  {/* Separator line */}
                  <Box
                    h="1px"
                    bg="gray.200"
                    _dark={{ bg: "gray.600" }}
                    mb={4}
                  />

                  <Button
                    variant="outline"
                    colorScheme="red"
                    w="full"
                    onClick={onLogout}
                  >
                    <Flex align="center" gap={2}>
                      <LogOut size={16} />
                      <Text>{common("logout")}</Text>
                    </Flex>
                  </Button>
                </Box>
              )}

              <Text fontSize="xs" color="gray.500" textAlign="center">
                Badminton Session Manager
              </Text>
              <Text fontSize="xs" color="gray.400" textAlign="center">
                © {new Date().getFullYear()}
              </Text>
            </Box>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
