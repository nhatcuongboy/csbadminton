"use client";

import { NextLinkButton } from "@/components/ui/NextLinkButton";
import { ISession } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { Badge, Box, Flex, Heading, Icon, Stack, Text } from "@chakra-ui/react";
import "dayjs/locale/en";
import "dayjs/locale/vi";
import { Calendar, Clock, SquareAsterisk, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

// Helper functions for formatting with locale support
const formatDate = (dateString: string | Date, locale: string): string => {
  // Create a dayjs instance and set the locale
  const date = dayjs(dateString).locale(locale === "vi" ? "vi" : "en");

  let formattedDate: string;

  if (locale === "vi") {
    // Vietnamese format: "Thứ 2, 04 tháng 7, 2025"
    formattedDate = date.format("dddd, DD MMMM, YYYY");
  } else {
    // English format: "Mon, Jul 04, 2025"
    formattedDate = date.format("ddd, MMM DD, YYYY");
  }

  // Capitalize the first letter of the day name
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};

const formatTime = (dateString: string | Date, locale: string): string => {
  // Create a dayjs instance and set the locale
  const date = dayjs(dateString).locale(locale === "vi" ? "vi" : "en");

  // Both locales use 24-hour format: "14:30"
  return date.format("HH:mm");
};

// UI Session type based on API data
interface UISession {
  id: string;
  title: string;
  date: string;
  time: string;
  numberOfCourts: number;
  totalPlayers: number;
  maxPlayers: number;
  status: "PREPARING" | "IN_PROGRESS" | "FINISHED";
  hostName: string;
}

const statusColors = {
  PREPARING: "blue",
  IN_PROGRESS: "green",
  FINISHED: "gray",
};

// Helper function to get localized status labels
const getStatusLabel = (status: string, t: any) => {
  switch (status) {
    case "PREPARING":
      return t("status.preparing");
    case "IN_PROGRESS":
      return t("status.inProgress");
    case "FINISHED":
      return t("status.finished");
    default:
      return status;
  }
};

interface SessionCardProps {
  session: ISession;
  onDelete?: (id: string) => void;
  mode?: "view" | "manage";
}

const SessionCard = ({
  session,
  onDelete,
  mode = "view",
}: SessionCardProps) => {
  const t = useTranslations("session");
  const locale = useLocale();
  // Calculate max players based on courts and maxPlayersPerCourt
  const maxPlayers = session.numberOfCourts * session.maxPlayersPerCourt;

  const convertedSession = {
    id: session.id,
    title: session.name,
    date: session.startTime
      ? formatDate(session.startTime, locale)
      : formatDate(session.createdAt, locale) + ` (${t("notStarted")})`,
    time: session.startTime
      ? `${formatTime(session.startTime, locale)} - ${
          session.endTime
            ? formatTime(session.endTime, locale)
            : t("inProgress")
        }`
      : t("notStartedYet"),
    numberOfCourts: session.numberOfCourts,
    totalPlayers: session._count?.players || 0,
    maxPlayers,
    status: session.status,
    hostName: session.host?.name || "",
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      _dark={{ bg: "gray.800" }}
      p={6}
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "lg",
      }}
    >
      <Stack gap={4}>
        <Flex justify="space-between" align="flex-start">
          <Heading size="md" mb={2}>
            {convertedSession.title}
          </Heading>
          <Badge colorScheme={statusColors[convertedSession.status]}>
            {getStatusLabel(convertedSession.status, t)}
          </Badge>
        </Flex>

        <Stack gap={3}>
          <Flex align="center">
            <Icon as={Calendar} boxSize={5} mr={2} color="blue.500" />
            <Text>{convertedSession.date}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={Clock} boxSize={5} mr={2} color="blue.500" />
            <Text>{convertedSession.time}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={SquareAsterisk} boxSize={5} mr={2} color="blue.500" />
            <Text>
              {convertedSession.numberOfCourts} {t("courtsAvailable")}
            </Text>
          </Flex>
          <Flex align="center">
            <Icon as={Users} boxSize={5} mr={2} color="blue.500" />
            <Text>
              {convertedSession.totalPlayers} / {convertedSession.maxPlayers}{" "}
              {t("players")}
            </Text>
          </Flex>
        </Stack>

        <Flex mt={4} gap={2} justify="flex-end">
          {mode === "manage" ? (
            <NextLinkButton
              href={`/host/sessions/${session.id}`}
              colorScheme="blue"
            >
              {t("host")}
            </NextLinkButton>
          ) : (
            <NextLinkButton
              href={`/my-session/${session.id}`}
              colorScheme="blue"
            >
              {t("view")}
            </NextLinkButton>
          )}
          {mode === "manage" && onDelete && (
            <button
              style={{
                background: "#fff",
                color: "#e53e3e",
                border: "1px solid #e53e3e",
                borderRadius: 6,
                padding: "8px 16px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onClick={() => {
                if (window.confirm(t("deleteConfirmation"))) {
                  onDelete(session.id);
                }
              }}
            >
              {t("deleteSession")}
            </button>
          )}
        </Flex>
      </Stack>
    </Box>
  );
};

export default SessionCard;
