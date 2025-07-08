"use client";

import { Box, Text, IconButton, Flex, Stack } from "@chakra-ui/react";
import { Menu, Home, Users, Calendar, Settings, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { NextLinkButton } from "./NextLinkButton";
import LanguageSwitcher from "./LanguageSwitcher";
import { useState, useEffect } from "react";

export default function RightDrawerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const nav = useTranslations("navigation");
  const common = useTranslations("common");

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  // Lắng nghe event để mở lại drawer sau khi thay đổi ngôn ngữ
  useEffect(() => {
    const handleReopenDrawer = () => {
      setIsOpen(true);
    };

    window.addEventListener("reopenDrawer", handleReopenDrawer);
    return () => {
      window.removeEventListener("reopenDrawer", handleReopenDrawer);
    };
  }, []);

  return (
    <>
      {/* Menu Toggle Button */}
      <IconButton
        aria-label="Open menu"
        onClick={onOpen}
        position="fixed"
        top={2}
        right={4}
        zIndex={1001}
        bg="white"
        _dark={{ bg: "gray.800" }}
        shadow="md"
        borderRadius="full"
        size="md"
        variant="outline"
      >
        <Menu size={20} />
      </IconButton>

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
          height={"60px"}
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
                  onClick={onClose}
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
                  onClick={onClose}
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
                  onClick={onClose}
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
              <LanguageSwitcher keepDrawerOpen={true} />
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
