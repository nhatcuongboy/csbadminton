"use client";

import { Box, Container, Heading, Text, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";

export default function VietnameseHomePage() {
  return (
    <Container maxW="container.xl" p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <Heading color="blue.600">Quản Lý Sân Cầu Lông</Heading>
        <Flex gap={4}>
          <Link href="/en">
            <Button colorScheme="blue" variant="outline" size="sm">
              English
            </Button>
          </Link>
          <Link href="/vi">
            <Button colorScheme="blue" size="sm">
              Tiếng Việt
            </Button>
          </Link>
        </Flex>
      </Flex>

      <Box textAlign="center" py={20}>
        <Heading size="2xl" mb={6}>
          Quản Lý Phiên Chơi Cầu Lông
        </Heading>
        <Text fontSize="xl" mb={10} color="gray.600">
          Tổ chức hiệu quả các sân, người chơi và trận đấu cho câu lạc bộ cầu
          lông của bạn
        </Text>

        <Flex gap={6} justifyContent="center">
          <Link href="/vi/host">
            <Button colorScheme="blue" size="lg" px={8}>
              Tạo Phiên Chơi
            </Button>
          </Link>
          <Link href="/vi/join">
            <Button colorScheme="green" size="lg" px={8}>
              Tham Gia Phiên Chơi
            </Button>
          </Link>
        </Flex>
      </Box>

      <Box bg="gray.50" p={8} borderRadius="lg" mt={16}>
        <Heading size="lg" mb={4}>
          Tính Năng
        </Heading>
        <Text>• Quản lý nhiều sân và phiên chơi</Text>
        <Text>• Theo dõi người chơi và thời gian chờ</Text>
        <Text>• Tự động phân bổ người chơi vào trận đấu</Text>
        <Text>• Cập nhật phiên chơi theo thời gian thực</Text>
      </Box>
    </Container>
  );
}
