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
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SessionService } from "@/lib/api";
import NextLinkButton from "@/components/ui/NextLinkButton";
import { toast } from "react-hot-toast";
import { useState, useEffect, useMemo, Suspense } from "react";

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

  // Get error and details from search params
  const error = searchParams.get('error');
  const details = searchParams.get('details');

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
      const errorMessage = details || "Failed to create session";
      toast.error(decodeURIComponent(errorMessage));
    }
  }, [error, details]);

  async function createSession(formData: FormData) {
    // Client-side form handling
    setIsLoading(true);

    try {
      // Validate dates
      if (!isEndTimeValid) {
        toast.error("End time must be after start time");
        setIsLoading(false);
        return;
      }

      // Extract form data
      const name = formData.get("name") as string;
      const numberOfCourts = parseInt(formData.get("numberOfCourts") as string);
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
      });

      // Show success message
      toast.success("Session created successfully!");

      // Redirect to host page after short delay
      setTimeout(() => {
        router.push("/host");
      }, 500);
    } catch (error) {
      console.error("Error creating session:", error);
      // Show error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, white, green.50)">
      <Container maxW="4xl" py={8} px={4}>
        {/* Header with back button */}
        <Flex align="center" mb={8}>
          <NextLinkButton
            href="/host"
            variant="outline"
            size="sm"
            mr={4}
            _hover={{ bg: "blue.50" }}
            transition="all 0.2s"
          >
            <ArrowLeft size={16} style={{ marginRight: "8px" }} />
            Back to Dashboard
          </NextLinkButton>
          <Box>
            <Heading
              size="2xl"
              bgGradient="linear(to-r, blue.600, green.600)"
              bgClip="text"
              fontWeight="bold"
            >
              Create New Session
            </Heading>
            <Text color="gray.600" mt={1}>
              Set up your badminton session with ease
            </Text>
          </Box>
        </Flex>

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
            Start Your Badminton Journey
          </Heading>
          <Text color="gray.600" maxW="2xl" mx="auto">
            Configure your session settings below to create an amazing badminton
            experience for all players
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
            >
              <Text fontWeight="medium">
                {decodeURIComponent(
                  details || "Failed to create session"
                )}
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
          <Box
            bgGradient="linear(to-r, blue.500, green.500)"
            color="white"
            p={6}
          >
            <Flex align="center">
              <Settings
                size={24}
                style={{ marginRight: "12px", color: "white" }}
              />
              <Heading size="lg">Session Configuration</Heading>
            </Flex>
            <Text color="blue.50" mt={2}>
              Customize your badminton session to match your needs
            </Text>
          </Box>

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
                      Session Name
                    </Text>
                  </Flex>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Saturday Morning Badminton Championship"
                    required
                    size="lg"
                    borderWidth={2}
                    borderColor="gray.200"
                    _focus={{ borderColor: "blue.500" }}
                    transition="all 0.2s"
                  />
                  <Text fontSize="xs" color="gray.500" mt={2} ml={6}>
                    Choose a memorable name that describes your session
                  </Text>
                </Box>

                {/* Grid Layout for Better Organization */}
                <Grid templateColumns={{ md: "repeat(2, 1fr)" }} gap={8}>
                  {/* Number of Courts */}
                  <GridItem>
                    <Flex align="center" mb={3}>
                      <Settings
                        size={16}
                        color="#38A169"
                        style={{ marginRight: "8px" }}
                      />
                      <Text fontWeight="semibold" color="gray.700">
                        Number of Courts
                      </Text>
                    </Flex>
                    <Input
                      id="numberOfCourts"
                      name="numberOfCourts"
                      type="number"
                      defaultValue={2}
                      min={1}
                      max={10}
                      required
                      size="lg"
                      borderWidth={2}
                      borderColor="gray.200"
                      _focus={{ borderColor: "green.500" }}
                      transition="all 0.2s"
                    />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Available courts for simultaneous matches
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
                        Session Duration (minutes)
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
                      Automatically calculated from start and end times
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
                        Start Time
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
                      When the session will begin
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
                        End Time
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
                        ? "When the session will end"
                        : "End time must be after start time"}
                    </Text>
                  </GridItem>
                </Grid>

                {/* Max Players Per Court */}
                <Box>
                  <Flex align="center" mb={3}>
                    <Users
                      size={16}
                      color="#DD6B20"
                      style={{ marginRight: "8px" }}
                    />
                    <Text fontWeight="semibold" color="gray.700">
                      Max Players Per Court
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
                    maxW="xs"
                  />
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Maximum players per court for optimal rotation
                  </Text>
                </Box>

                {/* Require Player Info - Enhanced Checkbox */}
                <Box
                  bg="gray.50"
                  p={6}
                  rounded="lg"
                  borderWidth={2}
                  borderStyle="dashed"
                  borderColor="gray.200"
                >
                  <HStack gap={3}>
                    <input
                      type="checkbox"
                      id="requirePlayerInfo"
                      name="requirePlayerInfo"
                      defaultChecked
                    />
                    <Box>
                      <Text
                        fontWeight="semibold"
                        color="gray.700"
                        cursor="pointer"
                      >
                        Require Player Information
                      </Text>
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        Collect player details for better session management and
                        communication
                      </Text>
                    </Box>
                  </HStack>
                </Box>

                {/* Quick Tips Section */}
                <Box
                  bg="blue.50"
                  p={6}
                  rounded="lg"
                  border="1px"
                  borderColor="blue.200"
                >
                  <Flex align="center" mb={3}>
                    <Trophy size={16} style={{ marginRight: "8px" }} />
                    <Heading size="sm" color="blue.800">
                      Pro Tips for Your Session
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
                        Optimal court rotation: 8 players per court allows for
                        smooth doubles rotation
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
                        Session duration: 2 hours provides good balance between
                        play time and stamina
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
                        Player info helps with skill balancing and contact for
                        future sessions
                      </Text>
                    </Box>
                  </Stack>
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
                  Cancel
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
                    "Creating Session..."
                  ) : (
                    <>
                      <Save size={16} style={{ marginRight: "8px" }} />
                      Create Session
                    </>
                  )}
                </Button>
              </Flex>
            </Box>
          </form>
        </Box>

        {/* Additional Information */}
        <Box mt={8} textAlign="center">
          <Text color="gray.600" fontSize="sm">
            Need help? Check out our{" "}
            <Link href="#" style={{ color: "#3182ce", fontWeight: "500" }}>
              session setup guide
            </Link>{" "}
            for best practices.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
