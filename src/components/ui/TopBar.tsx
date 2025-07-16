"use client";

import { NextLinkButton } from "@/components/ui/NextLinkButton";
import {
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
  Text,
  Stack,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Menu,
  Home,
  Users,
  Calendar,
  Settings,
  Info,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, Suspense } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

interface TopBarProps {
  showBackButton?: boolean;
  backHref?: string;
  title?: string;
}

export default function TopBar({
  showBackButton = false,
  backHref = "/",
  title,
}: TopBarProps) {
  const common = useTranslations("common");
  const nav = useTranslations("navigation");
  const appName = "🏸";

  // Menu drawer state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={999}
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(10px)"
        borderBottom="1px solid"
        borderColor="gray.200"
        height="64px"
        minHeight="64px"
        _dark={{
          bg: "rgba(26, 32, 44, 0.95)",
          borderColor: "gray.600",
        }}
      >
        <Container maxW="container.xl" height="100%">
          <Flex justify="space-between" align="center" height="64px" py={0}>
            {/* Left side - Back button or spacer */}
            <Box minW="120px" height="100%" display="flex" alignItems="center">
              {showBackButton ? (
                <NextLinkButton
                  href={backHref}
                  variant="ghost"
                  size="sm"
                  color="gray.600"
                  _hover={{ color: "blue.500" }}
                >
                  <ArrowLeft size={16} />
                  {common("back")}
                </NextLinkButton>
              ) : (
                <Box />
              )}
            </Box>

            {/* Center - App title */}
            <Heading
              size="lg"
              color="blue.600"
              fontWeight="bold"
              textAlign="center"
              _dark={{ color: "blue.400" }}
              maxWidth={{ base: "60vw", md: "500px" }}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              px={2}
              height="100%"
              display="flex"
              alignItems="center"
            >
              {title || appName}
            </Heading>

            {/* Right side - Menu button */}
            <Box
              minW="120px"
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
            >
              <IconButton
                aria-label="Open menu"
                onClick={onMenuOpen}
                bg="white"
                _dark={{ bg: "gray.800" }}
                shadow="md"
                borderRadius="full"
                size="md"
                variant="outline"
              >
                <Menu size={20} />
              </IconButton>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Menu Drawer */}
      {/* Overlay */}
      {isMenuOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={1500}
          onClick={onMenuClose}
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
        transform={isMenuOpen ? "translateX(0)" : "translateX(100%)"}
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
            onClick={onMenuClose}
          >
            <X size={20} />
          </IconButton>
        </Flex>

        {/* Body */}
        <Box p={4}>
          <Stack gap={6}>
            {/* Navigation Links */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={3}>
                {common("navigation")}
              </Text>
              <Stack gap={2}>
                <NextLinkButton
                  href="/"
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={onMenuClose}
                  w="full"
                >
                  <Flex align="center" gap={3} w="full">
                    <Home size={18} />
                    <Text>{nav("home")}</Text>
                  </Flex>
                </NextLinkButton>
                <NextLinkButton
                  href="/host"
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={onMenuClose}
                  w="full"
                >
                  <Flex align="center" gap={3} w="full">
                    <Calendar size={18} />
                    <Text>{nav("host")}</Text>
                  </Flex>
                </NextLinkButton>
                <NextLinkButton
                  href="/join"
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={onMenuClose}
                  w="full"
                >
                  <Flex align="center" gap={3} w="full">
                    <Users size={18} />
                    <Text>{nav("join")}</Text>
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

            {/* Settings Section */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={3}>
                {common("settings")}
              </Text>
              <Stack gap={2}>
                <NextLinkButton
                  href="/settings"
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={onMenuClose}
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
                  onClick={onMenuClose}
                  w="full"
                >
                  <Flex align="center" gap={3} w="full">
                    <Info size={18} />
                    <Text>{common("about")}</Text>
                  </Flex>
                </NextLinkButton>
              </Stack>
            </Box>

            {/* Footer */}
            <Box pt={4}>
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
