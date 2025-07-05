"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Button, Box, Text, Flex } from "@chakra-ui/react";
import { ChevronDown, Languages } from "lucide-react";
import { useState } from "react";

const locales = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
];

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const currentLocale = locales.find((l) => l.code === locale) || locales[0];

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      // Replace the current locale in the pathname
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.replace(newPathname);
    });
    setIsOpen(false);
  };

  return (
    <Box position="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Languages size={16} />
        {currentLocale.flag} {currentLocale.label}
        <ChevronDown size={16} />
      </Button>

      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={1}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          shadow="lg"
          zIndex={1000}
          overflow="hidden"
        >
          {locales.map((loc) => (
            <Box
              key={loc.code}
              px={4}
              py={2}
              cursor="pointer"
              bg={locale === loc.code ? "blue.50" : "transparent"}
              _hover={{ bg: "blue.50" }}
              onClick={() => handleLocaleChange(loc.code)}
            >
              <Flex align="center" gap={2}>
                <Text>{loc.flag}</Text>
                <Text>{loc.label}</Text>
              </Flex>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
