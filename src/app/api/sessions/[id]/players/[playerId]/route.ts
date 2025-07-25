import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

interface RouteParams {
  id: string;
  playerId: string;
}

// PATCH - Update individual player
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { id: sessionId, playerId } = await params;
    const body = await request.json();
    const {
      name,
      gender,
      level,
      levelDescription,
      requireConfirmInfo,
      confirmedByPlayer,
    } = body;

    // Validate input
    if (!name || !gender || !level) {
      return NextResponse.json(
        { success: false, message: "Name, gender, and level are required" },
        { status: 400 }
      );
    }

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Check if player exists in this session
    const existingPlayer = await prisma.player.findFirst({
      where: {
        id: playerId,
        sessionId: sessionId,
      },
    });

    if (!existingPlayer) {
      return NextResponse.json(
        { success: false, message: "Player not found in this session" },
        { status: 404 }
      );
    }

    // Update the player
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: {
        name: name.trim(),
        gender,
        level,
        levelDescription: levelDescription || null,
        confirmedByPlayer: confirmedByPlayer || false,
        requireConfirmInfo: requireConfirmInfo || false,
      },
    });

    return NextResponse.json({
      success: true,
      player: updatedPlayer,
      message: "Player updated successfully",
    });
  } catch (error) {
    console.error("Error updating player:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete individual player
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { id: sessionId, playerId } = await params;

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Check if player exists in this session
    const existingPlayer = await prisma.player.findFirst({
      where: {
        id: playerId,
        sessionId: sessionId,
      },
    });

    if (!existingPlayer) {
      return NextResponse.json(
        { success: false, message: "Player not found in this session" },
        { status: 404 }
      );
    }

    // Check if player is currently playing
    if (existingPlayer.status === "PLAYING") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete player who is currently playing. End their match first.",
        },
        { status: 400 }
      );
    }

    // Delete the player
    await prisma.player.delete({
      where: { id: playerId },
    });

    return NextResponse.json({
      success: true,
      message: "Player deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
