"use client";

import { useTranslations } from "next-intl";
import { Box, Container, Heading, Text, Button } from "@chakra-ui/react";
import { Link as IntlLink } from "@/i18n/config";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Home() {
  const t = useTranslations("pages.home");

  return (
    <Container maxW="container.xl" p={4}>
      <Box display="flex" justifyContent="flex-end" mb={4}>
        <LanguageSwitcher />
      </Box>

      <Box textAlign="center" py={20}>
        <Heading mb={4}>{t("title")}</Heading>
        <Text mb={8}>{t("description")}</Text>
        <Box display="flex" gap={4} justifyContent="center">
          <IntlLink href="/host">
            <Button colorScheme="blue" size="lg">
              {t("hostButton")}
            </Button>
          </IntlLink>
          <IntlLink href="/join">
            <Button colorScheme="green" size="lg">
              {t("joinButton")}
            </Button>
          </IntlLink>
        </Box>
      </Box>
    </Container>
  );
}
