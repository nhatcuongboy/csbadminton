import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface SessionParams {
  params: {
    id: string;
  };
}

// GET /api/sessions/[id]/courts - Lấy danh sách sân trong session
export async function GET(request: NextRequest, { params }: SessionParams) {
  try {
    const { id } = params;

    // Validate session exists
    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return errorResponse("Session not found", 404);
    }

    // Get courts with current players
    const courts = await prisma.court.findMany({
      where: {
        sessionId: id,
      },
      orderBy: {
        courtNumber: "asc",
      },
      include: {
        currentPlayers: {
          select: {
            id: true,
            playerNumber: true,
            name: true,
            gender: true,
            level: true,
            status: true,
          },
        },
        currentMatch: {
          select: {
            id: true,
            startTime: true,
            status: true,
          },
        },
      },
    });

    return successResponse(courts, "Courts retrieved successfully");
  } catch (error) {
    console.error("Error fetching courts:", error);
    return errorResponse("Failed to fetch courts");
  }
}
