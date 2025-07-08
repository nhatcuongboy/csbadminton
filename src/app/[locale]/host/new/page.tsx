"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Stack,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Save,
  Users,
  Clock,
  Trophy,
  Settings,
  Calendar,
  Plus,
  Minus,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SessionService } from "@/lib/api";
import NextLinkButton from "@/components/ui/NextLinkButton";
import { toast } from "react-hot-toast";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link as IntlLink } from "@/i18n/config";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import TopBar from "@/components/ui/TopBar";

// Helper function to format date for datetime-local input
function formatDateTimeLocal(date: Date): string {
  // Format in local timezone for datetime-local input (YYYY-MM-DDThh:mm)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function NewSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewSessionPageContent />
    </Suspense>
  );
}

function NewSessionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [courts, setCourts] = useState([{ courtNumber: 1, courtName: "" }]);

  // Translations
  const t = useTranslations("session");
  const common = useTranslations("common");
  const pages = useTranslations("pages");

  // Calculate number of courts based on courts array
  const numberOfCourts = courts.length;

  // Get error and details from search params
  const error = searchParams.get("error");
  const details = searchParams.get("details");

  // Set up default values for start time and end time
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const [startTime, setStartTime] = useState(formatDateTimeLocal(now));
  const [endTime, setEndTime] = useState(formatDateTimeLocal(twoHoursLater));

  // Calculate session duration based on start and end times
  const sessionDuration = useMemo(() => {
    try {
      // Parse dates ensuring they're treated as local timezone dates
      const start = new Date(startTime);
      const end = new Date(endTime);
      const durationMinutes = Math.round(
        (end.getTime() - start.getTime()) / (60 * 1000)
      );
      return durationMinutes > 0 ? durationMinutes : 120; // If end is before start, default to 2 hours
    } catch (e) {
      return 120; // Default to 2 hours if dates are invalid
    }
  }, [startTime, endTime]);

  // Check if end time is before start time
  const isEndTimeValid = useMemo(() => {
    try {
      // Parse dates ensuring they're treated as local timezone dates
      const start = new Date(startTime);
      const end = new Date(endTime);
      return end > start;
    } catch (e) {
      return true;
    }
  }, [startTime, endTime]);

  // Show error message if redirected with error
  useEffect(() => {
    if (error) {
      const errorMessage = details || t("validation.sessionCreateFailed");
      toast.error(decodeURIComponent(errorMessage));
    }
  }, [error, details, t]);

  async function createSession(formData: FormData) {
    // Client-side form handling
    setIsLoading(true);

    try {
      // Validate dates
      if (!isEndTimeValid) {
        toast.error(t("endTimeMustBeAfterStartTime"));
        setIsLoading(false);
        return;
      }

      // Validate courts
      const courtValidationError = validateCourts();
      if (courtValidationError) {
        toast.error(courtValidationError);
        setIsLoading(false);
        return;
      }

      // Extract form data
      const name = formData.get("name") as string;
      const maxPlayersPerCourt = parseInt(
        formData.get("maxPlayersPerCourt") as string
      );
      const requirePlayerInfo = formData.get("requirePlayerInfo") === "on";

      // Use the state values for startTime, endTime, and sessionDuration
      // instead of reading from form

      // Sử dụng SessionService để tạo session mới
      const session = await SessionService.createSession({
        name,
        numberOfCourts,
        sessionDuration, // Calculated from start/end time
        maxPlayersPerCourt,
        requirePlayerInfo,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        courts: courts.map((court) => ({
          courtNumber: court.courtNumber,
          courtName: court.courtName || undefined,
        })), // Pass courts configuration
      });

      // Show success message
      toast.success(t("validation.sessionCreatedSuccessfully"));

      // Redirect to host page after short delay
      setTimeout(() => {
        router.push("/host");
      }, 500);
    } catch (error) {
      console.error("Error creating session:", error);
      // Show error message
      const errorMessage =
        error instanceof Error ? error.message : t("validation.unknownError");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle adding/removing courts
  const handleAddCourt = () => {
    const newCourtNumber = Math.max(...courts.map((c) => c.courtNumber), 0) + 1;
    const newCourt = {
      courtNumber: newCourtNumber,
      courtName: "",
    };
    setCourts([...courts, newCourt]);
  };

  const handleRemoveCourt = (courtNumber: number) => {
    if (courts.length > 1) {
      const newCourts = courts.filter((c) => c.courtNumber !== courtNumber);
      setCourts(newCourts);
    }
  };

  // Handle court info change
  const handleCourtChange = (
    index: number,
    field: "courtNumber" | "courtName",
    value: string | number
  ) => {
    const newCourts = [...courts];
    newCourts[index] = {
      ...newCourts[index],
      [field]: value,
    };
    setCourts(newCourts);
  };

  // Validate courts
  const validateCourts = () => {
    const courtNumbers = courts.map((c) => c.courtNumber);
    const uniqueNumbers = new Set(courtNumbers);

    if (uniqueNumbers.size !== courtNumbers.length) {
      return t("validation.courtNumberUnique");
    }

    for (const court of courts) {
      if (!court.courtNumber || court.courtNumber < 1) {
        return t("validation.allCourtsMustHaveValidNumber");
      }
    }

    return null;
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, white, green.50)">
      {/* Top Bar */}
      <TopBar showBackButton={true} backHref="/host" title="New Session" />

      <Container maxW="4xl" py={8} px={4} pt={24}>
        {/* Hero Section */}
        <VStack mb={8} textAlign="center">
          <Flex
            align="center"
            justify="center"
            w={20}
            h={20}
            bgGradient="linear(to-r, blue.500, green.500)"
            rounded="full"
            mb={4}
            shadow="lg"
          >
            <Trophy size={40} color="white" />
          </Flex>
          <Heading size="lg" color="gray.800" mb={2}>
            {t("startYourBadmintonJourney")}
          </Heading>
          <Text color="gray.600" maxW="2xl" mx="auto">
            {t("configureYourSessionSettingsBelow")}
          </Text>

          {/* Error Alert */}
          {error && (
            <Box
              mt={4}
              p={4}
              bg="red.50"
              color="red.700"
              borderRadius="md"
              borderWidth="1px"
              borderColor="red.200"
              w="full"
              maxW="md"
            >            <Text fontWeight="medium">
              {decodeURIComponent(details || t("validation.sessionCreateFailed"))}
            </Text>
            </Box>
          )}
        </VStack>

        <Box
          shadow="xl"
          bg="whiteAlpha.800"
          backdropFilter="blur(8px)"
          borderRadius="lg"
          overflow="hidden"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createSession(new FormData(e.currentTarget));
            }}
          >
            <Box p={8}>
              <Stack gap={8}>
                {/* Session Name */}
                <Box>
                  <Flex align="center" mb={3}>
                    <Trophy
                      size={16}
                      color="#3182CE"
                      style={{ marginRight: "8px" }}
                    />
                    <Text fontWeight="semibold" color="gray.700">
                      {t("sessionName")} *
                    </Text>
                  </Flex>
                  <Input
                    id="name"
                    name="name"
                    placeholder={t("sessionNamePlaceholder")}
                    required
                    size="lg"
                    borderWidth={2}
                    borderColor="gray.200"
                    _focus={{ borderColor: "blue.500" }}
                    transition="all 0.2s"
                  />
                  <Text fontSize="xs" color="gray.500" mt={2} ml={6}>
                    {t("sessionNameDescription")}
                  </Text>
                </Box>

                {/* Display Information Grid */}
                <Grid templateColumns={{ md: "repeat(2, 1fr)" }} gap={8}>
                  {/* Number of Courts (calculated) */}
                  <GridItem>
                    <Flex align="center" mb={3}>
                      <Settings
                        size={16}
                        color="#38A169"
                        style={{ marginRight: "8px" }}
                      />
                      <Text fontWeight="semibold" color="gray.700">
                        {t("numberOfCourts")}
                      </Text>
                    </Flex>
                    <Input
                      id="numberOfCourts"
                      name="numberOfCourts"
                      type="number"
                      value={numberOfCourts}
                      disabled
                      size="lg"
                      borderWidth={2}
                      borderColor="gray.200"
                      _focus={{ borderColor: "green.500" }}
                      transition="all 0.2s"
                      bg="gray.100"
                    />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      {t("calculatedFromCourtsConfig")}
                    </Text>
                  </GridItem>

                  {/* Session Duration */}
                  <GridItem>
                    <Flex align="center" mb={3}>
                      <Clock
                        size={16}
                        color="#805AD5"
                        style={{ marginRight: "8px" }}
                      />
                      <Text fontWeight="semibold" color="gray.700">
                        {t("sessionDuration")}
                      </Text>
                    </Flex>
                    <Input
                      id="sessionDuration"
                      name="sessionDuration"
                      type="number"
                      value={sessionDuration}
                      disabled
                      size="lg"
                      borderWidth={2}
                      borderColor="gray.200"
                      _focus={{ borderColor: "purple.500" }}
                      transition="all 0.2s"
                      bg="gray.100"
                    />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      {t("automaticallyCalculated")}
                    </Text>
                  </GridItem>
                </Grid>

                {/* Time Controls Grid */}
                <Grid templateColumns={{ md: "repeat(2, 1fr)" }} gap={8}>
                  {/* Start Time */}
                  <GridItem>
                    <Flex align="center" mb={3}>
                      <Calendar
                        size={16}
                        color="#3182CE"
                        style={{ marginRight: "8px" }}
                      />
                      <Text fontWeight="semibold" color="gray.700">
                        {t("startTime")} *
                      </Text>
                    </Flex>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      size="lg"
                      borderWidth={2}
                      borderColor="gray.200"
                      _focus={{ borderColor: "blue.500" }}
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      {t("whenTheSessionWillBegin")}
                    </Text>
                  </GridItem>

                  {/* End Time */}
                  <GridItem>
                    <Flex align="center" mb={3}>
                      <Calendar
                        size={16}
                        color="#E53E3E"
                        style={{ marginRight: "8px" }}
                      />
                      <Text fontWeight="semibold" color="gray.700">
                        {t("endTime")} *
                      </Text>
                    </Flex>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      size="lg"
                      borderWidth={2}
                      borderColor={isEndTimeValid ? "gray.200" : "red.400"}
                      _focus={{
                        borderColor: isEndTimeValid ? "red.500" : "red.600",
                      }}
                      transition="all 0.2s"
                    />
                    <Text
                      fontSize="xs"
                      color={isEndTimeValid ? "gray.500" : "red.500"}
                      mt={2}
                    >
                      {isEndTimeValid
                        ? t("whenTheSessionWillEnd")
                        : t("endTimeMustBeAfterStartTime")}
                    </Text>
                  </GridItem>
                </Grid>

                {/* Max Players Per Court and Require Player Info Grid */}
                <Grid templateColumns={{ md: "repeat(2, 1fr)" }} gap={8}>
                  {/* Max Players Per Court */}
                  <GridItem>
                    <Flex align="center" mb={3}>
                      <Users
                        size={16}
                        color="#DD6B20"
                        style={{ marginRight: "8px" }}
                      />
                      <Text fontWeight="semibold" color="gray.700">
                        {t("maxPlayersPerCourt")} *
                      </Text>
                    </Flex>
                    <Input
                      id="maxPlayersPerCourt"
                      name="maxPlayersPerCourt"
                      type="number"
                      defaultValue={8}
                      min={4}
                      max={12}
                      required
                      size="lg"
                      borderWidth={2}
                      borderColor="gray.200"
                      _focus={{ borderColor: "orange.500" }}
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      {t("maxPlayersDescription")}
                    </Text>
                  </GridItem>

                  {/* Require Player Information */}
                  <GridItem>
                    <Flex align="center" mb={3}>
                      <Users
                        size={16}
                        color="#38A169"
                        style={{ marginRight: "8px" }}
                      />
                      <Text fontWeight="semibold" color="gray.700">
                        {t("requirePlayerInformation")}
                      </Text>
                    </Flex>
                    <HStack
                      gap={3}
                      p={4}
                      borderWidth={2}
                      borderColor="gray.200"
                      borderRadius="md"
                      minH="66px"
                      align="center"
                    >
                      <input
                        type="checkbox"
                        id="requirePlayerInfo"
                        name="requirePlayerInfo"
                        defaultChecked
                        style={{
                          transform: "scale(1.5)",
                          accentColor: "#38A169",
                        }}
                      />
                      <Box>
                        <Text fontWeight="medium" color="gray.700">
                          {t("collectPlayerInformation")}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {t("enableToGatherPlayerDetails")}
                        </Text>
                      </Box>
                    </HStack>
                  </GridItem>
                </Grid>

                {/* Courts Configuration Section */}
                <Box>
                  <Flex align="center" mb={3}>
                    <Users
                      size={16}
                      color="#2B6CB0"
                      style={{ marginRight: "8px" }}
                    />
                    <Text fontWeight="semibold" color="gray.700">
                      {t("courtsConfiguration")} *
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color="gray.500" mb={4}>
                    {t("addOrRemoveCourtsToCustomize")}
                  </Text>

                  <Box
                    bg="gray.50"
                    p={4}
                    borderRadius="md"
                    borderWidth={1}
                    borderColor="gray.200"
                  >
                    {/* Render courts dynamically */}
                    {courts.map((court, index) => (
                      <Box
                        key={court.courtNumber}
                        p={4}
                        mb={4}
                        borderWidth={2}
                        borderColor="gray.200"
                        borderRadius="md"
                        bg="white"
                        shadow="sm"
                      >
                        <Flex align="center" mb={2}>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="blue.600"
                            mr={4}
                          >
                            {t("court")} {court.courtNumber}
                          </Text>
                          {courts.length > 1 && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() =>
                                handleRemoveCourt(court.courtNumber)
                              }
                            >
                              <Minus size={12} style={{ marginRight: "4px" }} />
                              {t("remove")}
                            </Button>
                          )}
                        </Flex>
                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md: "repeat(2, 1fr)",
                          }}
                          gap={4}
                        >
                          {/* Court Number */}
                          <GridItem>
                            <Text fontWeight="medium" color="gray.700" mb={2}>
                              {t("courtNumber")} *
                            </Text>
                            <Input
                              type="number"
                              value={court.courtNumber}
                              onChange={(e) =>
                                handleCourtChange(
                                  index,
                                  "courtNumber",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              size="lg"
                              borderWidth={2}
                              borderColor="gray.200"
                              _focus={{ borderColor: "blue.500" }}
                              transition="all 0.2s"
                              min={1}
                              required
                            />
                          </GridItem>

                          {/* Court Name */}
                          <GridItem>
                            <Text fontWeight="medium" color="gray.700" mb={2}>
                              {t("courtName")}
                            </Text>
                            <Input
                              type="text"
                              value={court.courtName}
                              onChange={(e) =>
                                handleCourtChange(
                                  index,
                                  "courtName",
                                  e.target.value
                                )
                              }
                              placeholder={t("courtNamePlaceholder")}
                              size="lg"
                              borderWidth={2}
                              borderColor="gray.200"
                              _focus={{ borderColor: "blue.500" }}
                              transition="all 0.2s"
                            />
                          </GridItem>
                        </Grid>
                      </Box>
                    ))}

                    {/* Add Court Button */}
                    <Button
                      size="lg"
                      colorScheme="green"
                      variant="outline"
                      width="full"
                      onClick={() => handleAddCourt()}
                    >
                      <Plus size={16} style={{ marginRight: "8px" }} />
                      {t("addAnotherCourt")}
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Box bg="gray.50" p={8}>
              <Flex w="full" justify="space-between">
                <NextLinkButton
                  href="/host"
                  variant="outline"
                  px={8}
                  py={3}
                  _hover={{ bg: "gray.100" }}
                  transition="all 0.2s"
                >
                  {common("cancel")}
                </NextLinkButton>
                <Button
                  type="submit"
                  px={8}
                  py={3}
                  bgGradient="linear(to-r, blue.500, green.500)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, blue.600, green.600)",
                    transform: "scale(1.05)",
                  }}
                  shadow="lg"
                  _active={{ transform: "scale(0.95)" }}
                  transition="all 0.3s"
                  disabled={isLoading || !isEndTimeValid}
                >
                  {isLoading ? (
                    t("creatingSession")
                  ) : (
                    <>
                      <Save size={16} style={{ marginRight: "8px" }} />
                      {t("createSession")}
                    </>
                  )}
                </Button>
              </Flex>
            </Box>

            {/* Quick Tips Section */}
            <Box
              bg="blue.50"
              p={8}
              rounded="lg"
              border="1px"
              borderColor="blue.200"
            >
              <Flex align="center" mb={3}>
                <Trophy size={16} style={{ marginRight: "8px" }} />
                <Heading size="sm" color="blue.800">
                  {t("proTipsForYourSession")}
                </Heading>
              </Flex>
              <Stack gap={2}>
                <Box display="flex" alignItems="start">
                  <Box
                    w={2}
                    h={2}
                    bg="blue.400"
                    rounded="full"
                    mt={2}
                    mr={3}
                    flexShrink={0}
                  />
                  <Text fontSize="sm" color="blue.700">
                    {t("optimalCourtRotation")}
                  </Text>
                </Box>
                <Box display="flex" alignItems="start">
                  <Box
                    w={2}
                    h={2}
                    bg="blue.400"
                    rounded="full"
                    mt={2}
                    mr={3}
                    flexShrink={0}
                  />
                  <Text fontSize="sm" color="blue.700">
                    {t("sessionDurationTip")}
                  </Text>
                </Box>
                <Box display="flex" alignItems="start">
                  <Box
                    w={2}
                    h={2}
                    bg="blue.400"
                    rounded="full"
                    mt={2}
                    mr={3}
                    flexShrink={0}
                  />
                  <Text fontSize="sm" color="blue.700">
                    {t("playerInfoHelps")}
                  </Text>
                </Box>
              </Stack>
            </Box>
          </form>
        </Box>

        {/* Additional Information */}
        <Box mt={8} textAlign="center">
          <Text color="gray.600" fontSize="sm">
            {t("needHelp")}{" "}
            <Link href="#" style={{ color: "#3182ce", fontWeight: "500" }}>
              {t("sessionSetupGuide")}
            </Link>{" "}
            {t("forBestPractices")}
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
