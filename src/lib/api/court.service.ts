import toast from "react-hot-toast";
import { api, ApiResponse } from "./base";
import { Court, Match, Player, CourtDirection, SuggestedPlayersResponse } from "./types";

export const CourtService = {
  // Get court details
  getCourt: async (id: string): Promise<Court> => {
    const response = await api.get<ApiResponse<Court>>(`/courts/${id}`);
    return response.data.data!;
  },

  // Get suggested players for court (auto-assign preview)
  getSuggestedPlayersForCourt: async (
    courtId: string,
    topCount?: number
  ): Promise<SuggestedPlayersResponse> => {
    const params = topCount ? { topCount: topCount.toString() } : {};
    const response = await api.get<ApiResponse<SuggestedPlayersResponse>>(
      `/courts/${courtId}/suggested-players`,
      { params }
    );
    return response.data.data!;
  },

  // Select players for court
  selectPlayers: async (
    courtId: string,
    playerIds: string[],
    playersWithPosition?: Array<{ playerId: string; position: number }>
  ): Promise<Court> => {
    const requestBody: any = {
      playerIds,
    };

    // If position info is provided, include it in the request
    if (playersWithPosition && playersWithPosition.length > 0) {
      requestBody.players = playersWithPosition;
    }

    const response = await api.post<ApiResponse<Court>>(
      `/courts/${courtId}/select-players`,
      requestBody
    );
    return response.data.data!;
  },

  // Deselect players from court (revert the select-players action)
  deselectPlayers: async (courtId: string): Promise<Court> => {
    const response = await api.post<ApiResponse<Court>>(
      `/courts/${courtId}/deselect-players`
    );
    return response.data.data!;
  },

  // Start match
  startMatch: async (
    courtId: string
  ): Promise<{ court: Court; match: Match }> => {
    const response = await api.post<
      ApiResponse<{ court: Court; match: Match }>
    >(`/courts/${courtId}/start-match`);
    return response.data.data!;
  },

  // End match
  endMatch: async (
    courtId: string,
    options?: {
      score?: Array<{ playerId: string; score: number }>;
      winnerIds?: string[];
      isDraw?: boolean;
      notes?: string;
    }
  ): Promise<{ court: Court; match: Match; players: Player[] }> => {
    const response = await api.post<
      ApiResponse<{ court: Court; match: Match; players: Player[] }>
    >(`/courts/${courtId}/end-match`, options || {});
    return response.data.data!;
  },

  // Get current match
  getCurrentMatch: async (courtId: string): Promise<Match | null> => {
    const response = await api.get<ApiResponse<Match>>(
      `/courts/${courtId}/current-match`
    );
    return response.data.data || null;
  },

  // Update court configuration (name, direction)
  updateCourt: async (
    courtId: string,
    data: {
      courtName?: string;
      direction?: CourtDirection;
    }
  ): Promise<Court> => {
    const response = await api.patch<ApiResponse<Court>>(
      `/courts/${courtId}`,
      data
    );
    toast.success("Court updated successfully");
    return response.data.data!;
  },

  // Bulk update courts configuration
  bulkUpdateCourts: async (
    sessionId: string,
    courts: Array<{
      courtId: string;
      courtName?: string;
      direction?: CourtDirection;
    }>
  ): Promise<Court[]> => {
    const updatePromises = courts.map((court) =>
      CourtService.updateCourt(court.courtId, {
        courtName: court.courtName,
        direction: court.direction,
      })
    );
    const updatedCourts = await Promise.all(updatePromises);
    toast.success(`${courts.length} courts updated successfully`);
    return updatedCourts;
  },

  // Pre-select players for next match
  preSelectPlayers: async (
    courtId: string,
    playersWithPosition: Array<{ playerId: string; position: number }>
  ): Promise<Court> => {
    const response = await api.post<ApiResponse<Court>>(
      `/courts/${courtId}/pre-select`,
      { playersWithPosition }
    );
    return response.data.data!;
  },

  // Cancel pre-selection
  cancelPreSelect: async (courtId: string): Promise<Court> => {
    const response = await api.delete<ApiResponse<Court>>(
      `/courts/${courtId}/pre-select`
    );
    return response.data.data!;
  },

  // Get pre-selection info
  getPreSelect: async (
    courtId: string
  ): Promise<{
    courtId: string;
    preSelectedPlayers?: Array<{
      playerId: string;
      position: number;
      player?: Player;
    }>;
  }> => {
    const response = await api.get<
      ApiResponse<{
        courtId: string;
        preSelectedPlayers?: Array<{
          playerId: string;
          position: number;
          player?: Player;
        }>;
      }>
    >(`/courts/${courtId}/pre-select`);
    return response.data.data!;
  },
};