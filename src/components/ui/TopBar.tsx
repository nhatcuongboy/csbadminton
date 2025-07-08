"use client";

import { NextLinkButton } from "@/components/ui/NextLinkButton";
import { Box, Container, Flex, Heading } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const appName = "🏸";

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
        _dark={{
          bg: "rgba(26, 32, 44, 0.95)",
          borderColor: "gray.600",
        }}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" py={4}>
            {/* Left side - Back button or spacer */}
            <Box minW="120px">
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
            >
              {title || appName}
            </Heading>

            {/* Right side - Menu button */}
            <Box minW="120px" display="flex" justifyContent="flex-end"></Box>
          </Flex>
        </Container>
      </Box>
    </>
  );
}
