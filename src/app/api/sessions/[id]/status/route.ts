import { prisma } from "@/app/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

interface SessionStatusParams {
  params: {
    id: string;
  };
}

// PATCH /api/sessions/[id]/status - Cập nhật trạng thái session (PREPARING, IN_PROGRESS, FINISHED)
export async function PATCH(
  request: NextRequest,
  { params }: SessionStatusParams
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse("Status is required");
    }

    // Validate status
    if (!["PREPARING", "IN_PROGRESS", "FINISHED"].includes(status)) {
      return errorResponse(
        "Invalid status. Must be one of: PREPARING, IN_PROGRESS, FINISHED"
      );
    }

    // Get current session
    const currentSession = await prisma.session.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!currentSession) {
      return errorResponse("Session not found", 404);
    }

    // Update session data based on status transition
    let updateData: any = { status };

    // If transitioning from PREPARING to IN_PROGRESS, set startTime
    if (currentSession.status === "PREPARING" && status === "IN_PROGRESS") {
      updateData.startTime = new Date();
    }

    // If transitioning to FINISHED, set endTime
    if (status === "FINISHED" && currentSession.status !== "FINISHED") {
      updateData.endTime = new Date();
    }

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: updateData,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return successResponse(
      updatedSession,
      "Session status updated successfully"
    );
  } catch (error) {
    console.error("Error updating session status:", error);
    return errorResponse("Failed to update session status");
  }
}
