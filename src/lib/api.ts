import axios from "axios";
import toast from "react-hot-toast";

// Axios instance with base configuration
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || "Something went wrong";
    toast.error(message);
    return Promise.reject(error);
  }
);

// Session types
export interface Session {
  id: string;
  name: string;
  hostId: string;
  host: {
    id: string;
    name: string;
    email: string;
  };
  numberOfCourts: number;
  sessionDuration: number;
  maxPlayersPerCourt: number;
  requirePlayerInfo: boolean;
  status: "PREPARING" | "IN_PROGRESS" | "FINISHED";
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  courts?: Court[];
  players?: Player[];
  _count?: {
    players: number;
    courts: number;
    matches?: number;
  };
}

// Level enum
export enum Level {
  Y_MINUS = "Y_MINUS",
  Y = "Y",
  Y_PLUS = "Y_PLUS",
  TBY = "TBY",
  TB_MINUS = "TB_MINUS",
  TB = "TB",
  TB_PLUS = "TB_PLUS",
  K = "K",
}

// Player types
export interface Player {
  id: string;
  sessionId: string;
  userId?: string;
  playerNumber: number;
  name?: string;
  gender?: "MALE" | "FEMALE";
  level?: Level;
  levelDescription?: string;
  currentWaitTime: number;
  totalWaitTime: number;
  matchesPlayed: number;
  status: "WAITING" | "PLAYING" | "FINISHED" | "READY";
  currentCourtId?: string;
  currentCourt?: Court;
  preFilledByHost: boolean;
  confirmedByPlayer: boolean;
  requireConfirmInfo: boolean;
  phone?: string;
  desire?: string;
}

// Court types
export interface Court {
  id: string;
  sessionId: string;
  courtNumber: number;
  courtName?: string;
  status: "EMPTY" | "IN_USE" | "READY";
  currentPlayers?: Player[];
  currentMatchId?: string;
  currentMatch?: Match;
}

// Match types
export interface Match {
  id: string;
  sessionId: string;
  courtId: string;
  status: "IN_PROGRESS" | "FINISHED";
  startTime: Date;
  endTime?: Date;
  players?: MatchPlayer[];
  durationMinutes?: number;
  // Add these fields to match API response
  court?: Court; // populated by include: { court: true }
  isDraw: boolean;
  notes: string;
  score: {
    playerId: string;
    score: number;
  }[];
  winnerIds: string[];
}

export interface MatchPlayer {
  id: string;
  matchId: string;
  playerId: string;
  player: Player;
  position: number;
}

// Session service
// Player statistics response type
export interface PlayerStatistics {
  playerId: string;
  playerNumber: number;
  name?: string;
  gender?: string;
  level?: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  status: string;
}

export const SessionService = {
  // Get player statistics for a session
  getPlayerStatistics: async (
    sessionId: string
  ): Promise<{ sessionId: string; playerStats: PlayerStatistics[]; lastUpdated: string }> => {
    const response = await api.get<
      ApiResponse<{ sessionId: string; playerStats: PlayerStatistics[]; lastUpdated: string }>
    >(`/sessions/${sessionId}/players/statistics`);
    return response.data.data!;
  },
  // Get all sessions
  getAllSessions: async (): Promise<Session[]> => {
    const response = await api.get<ApiResponse<Session[]>>("/sessions");
    return response.data.data || [];
  },

  // Get session by ID
  getSession: async (id: string): Promise<Session> => {
    const response = await api.get<ApiResponse<Session>>(`/sessions/${id}`);
    return response.data.data!;
  },

  // Create session
  createSession: async (data: CreateSessionRequest): Promise<Session> => {
    const response = await api.post<ApiResponse<Session>>("/sessions", data);
    return response.data.data!;
  },

  // Update session
  updateSession: async (
    id: string,
    data: Partial<Session>
  ): Promise<Session> => {
    const response = await api.put<ApiResponse<Session>>(
      `/sessions/${id}`,
      data
    );
    // toast.success("Session updated successfully");
    return response.data.data!;
  },

  // Delete session
  deleteSession: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/sessions/${id}`);
    // toast.success("Session deleted successfully");
  },

  // Start session
  startSession: async (id: string): Promise<Session> => {
    const response = await api.post<ApiResponse<Session>>(
      `/sessions/${id}/start`
    );
    // toast.success("Session started successfully");
    return response.data.data!;
  },

  // End session
  endSession: async (
    id: string
  ): Promise<{ session: Session; statistics: any }> => {
    const response = await api.post<
      ApiResponse<{ session: Session; statistics: any }>
    >(`/sessions/${id}/end`);
    // toast.success("Session ended successfully");
    return response.data.data!;
  },

  // Migrate/fix old ended sessions
  migrateEndedSession: async (
    id: string
  ): Promise<{
    session: Session;
    statistics: any;
    migrationResults: {
      unfinishedMatchesFixed: number;
      playersUpdated: number;
      courtsUpdated: number;
    };
  }> => {
    const response = await api.post<
      ApiResponse<{
        session: Session;
        statistics: any;
        migrationResults: any;
      }>
    >(`/sessions/${id}/migrate-end`);
    toast.success("Session migration completed successfully");
    return response.data.data!;
  },

  // Update session status
  updateSessionStatus: async (id: string, status: string): Promise<Session> => {
    const response = await api.patch<ApiResponse<Session>>(
      `/sessions/${id}/status`,
      { status }
    );
    // toast.success("Session status updated successfully");
    return response.data.data!;
  },

  // Get session courts
  getSessionCourts: async (id: string): Promise<Court[]> => {
    const response = await api.get<ApiResponse<Court[]>>(
      `/sessions/${id}/courts`
    );
    return response.data.data || [];
  },

  // Get session players
  getSessionPlayers: async (
    id: string,
    params?: { status?: string; orderBy?: string; orderDir?: string }
  ): Promise<Player[]> => {
    const response = await api.get<ApiResponse<Player[]>>(
      `/sessions/${id}/players`,
      { params }
    );
    return response.data.data || [];
  },

  // Get waiting queue
  getWaitingQueue: async (id: string): Promise<Player[]> => {
    const response = await api.get<ApiResponse<Player[]>>(
      `/sessions/${id}/waiting-queue`
    );
    return response.data.data || [];
  },

  // Get session matches
  getSessionMatches: async (id: string): Promise<Match[]> => {
    const response = await api.get<
      ApiResponse<{
        matches: Match[];
        totalMatches: number;
        filters: {
          playerId: string | null;
          courtId: string | null;
        };
      }>
    >(`/sessions/${id}/matches`);
    // Handle the new API response format that returns an object with matches array
    return response.data.data?.matches || [];
  },

  // Get session matches with filters
  getSessionMatchesWithFilters: async (
    id: string,
    filters?: { playerId?: string; courtId?: string }
  ): Promise<{
    matches: Match[];
    totalMatches: number;
    filters: {
      playerId: string | null;
      courtId: string | null;
    };
  }> => {
    const params = new URLSearchParams();
    if (filters?.playerId) params.append("playerId", filters.playerId);
    if (filters?.courtId) params.append("courtId", filters.courtId);

    const url = params.toString()
      ? `/sessions/${id}/matches?${params.toString()}`
      : `/sessions/${id}/matches`;

    const response = await api.get<
      ApiResponse<{
        matches: Match[];
        totalMatches: number;
        filters: any;
      }>
    >(url);

    return response.data.data!;
  },
};

// Bulk Player types
export interface BulkPlayerData {
  playerNumber: number;
  name?: string;
  gender?: "MALE" | "FEMALE";
  level?: Level;
  levelDescription?: string;
  phone?: string;
  requireConfirmInfo?: boolean;
}

export interface BulkPlayersResponse {
  createdPlayers: Player[];
  session: Session;
  message: string;
}

export interface BulkPlayersInfoResponse {
  sessionId: string;
  sessionName: string;
  maxPlayers: number;
  currentPlayersCount: number;
  availableSlots: number;
  availablePlayerNumbers: number[];
  existingPlayerNumbers: number[];
}

// Player service
export const PlayerService = {
  // Get player by ID
  getPlayer: async (id: string): Promise<Player> => {
    const response = await api.get<ApiResponse<Player>>(`/players/${id}`);
    return response.data.data!;
  },

  // Create player
  createPlayer: async (
    sessionId: string,
    data: Partial<Player>
  ): Promise<Player> => {
    const response = await api.post<ApiResponse<Player>>(
      `/sessions/${sessionId}/players`,
      data
    );
    toast.success("Player created successfully");
    return response.data.data!;
  },

  // Create bulk players
  createBulkPlayers: async (
    sessionId: string,
    playersData: BulkPlayerData[]
  ): Promise<BulkPlayersResponse> => {
    const response = await api.post<ApiResponse<BulkPlayersResponse>>(
      `/sessions/${sessionId}/players/bulk`,
      playersData
    );
    toast.success(
      `${
        response.data.data!.createdPlayers.length
      } players created successfully`
    );
    return response.data.data!;
  },

  // Get bulk players info
  getBulkPlayersInfo: async (
    sessionId: string
  ): Promise<BulkPlayersInfoResponse> => {
    const response = await api.get<ApiResponse<BulkPlayersInfoResponse>>(
      `/sessions/${sessionId}/players/bulk`
    );
    return response.data.data!;
  },

  // Update player
  updatePlayer: async (id: string, data: Partial<Player>): Promise<Player> => {
    const response = await api.put<ApiResponse<Player>>(`/players/${id}`, data);
    toast.success("Player information updated");
    return response.data.data!;
  },

  // Delete player
  deletePlayer: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/players/${id}`);
    toast.success("Player removed successfully");
  },

  // Confirm player
  confirmPlayer: async (id: string, data: Partial<Player>): Promise<Player> => {
    const response = await api.post<ApiResponse<Player>>(
      `/players/${id}/confirm`,
      data
    );
    // toast.success("Player confirmed successfully");
    return response.data.data!;
  },

  // Update wait times (deprecated - use WaitTimeService.updateSessionWaitTimes instead)
  updateWaitTimes: async (
    sessionId: string,
    minutesToAdd: number = 1
  ): Promise<{ updatedCount: number; players: Player[] }> => {
    const response = await api.put<
      ApiResponse<{ updatedCount: number; players: Player[] }>
    >(`/sessions/${sessionId}/wait-times`, {
      minutesToAdd,
    });
    return response.data.data!;
  },

  // Update player by session and player ID
  updatePlayerBySession: async (
    sessionId: string,
    playerId: string,
    data: Partial<Player>
  ): Promise<Player> => {
    const response = await api.patch<ApiResponse<Player>>(
      `/sessions/${sessionId}/players/${playerId}`,
      data
    );
    toast.success("Player updated successfully");
    return response.data.data!;
  },

  // Delete player by session and player ID
  deletePlayerBySession: async (
    sessionId: string,
    playerId: string
  ): Promise<void> => {
    await api.delete<ApiResponse<null>>(
      `/sessions/${sessionId}/players/${playerId}`
    );
    toast.success("Player deleted successfully");
  },

  // Bulk update players
  bulkUpdatePlayers: async (
    sessionId: string,
    players: Partial<Player>[]
  ): Promise<{ updatedPlayers: Player[] }> => {
    const response = await api.patch<ApiResponse<{ updatedPlayers: Player[] }>>(
      `/sessions/${sessionId}/players/bulk-update`,
      { players }
    );
    toast.success("Players updated successfully");
    return response.data.data!;
  },
};

// Court service
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
    playerIds: string[]
  ): Promise<Court> => {
    const response = await api.post<ApiResponse<Court>>(
      `/courts/${courtId}/select-players`,
      {
        playerIds,
      }
    );
    // toast.success("Players selected successfully");
    return response.data.data!;
  },

  // Deselect players from court (revert the select-players action)
  deselectPlayers: async (courtId: string): Promise<Court> => {
    const response = await api.post<ApiResponse<Court>>(
      `/courts/${courtId}/deselect-players`
    );
    // toast.success("Players deselected successfully");
    return response.data.data!;
  },

  // Start match
  startMatch: async (
    courtId: string
  ): Promise<{ court: Court; match: Match }> => {
    const response = await api.post<
      ApiResponse<{ court: Court; match: Match }>
    >(`/courts/${courtId}/start-match`);
    // toast.success("Match started successfully");
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
    // toast.success("Match ended successfully");
    return response.data.data!;
  },

  // Get current match
  getCurrentMatch: async (courtId: string): Promise<Match | null> => {
    const response = await api.get<ApiResponse<Match>>(
      `/courts/${courtId}/current-match`
    );
    return response.data.data || null;
  },
};

// Match service
export const MatchService = {
  // Get session matches
  getSessionMatches: async (
    sessionId: string
  ): Promise<{
    matches: Match[];
    totalMatches: number;
    activeMatches: number;
    completedMatches: number;
  }> => {
    const response = await api.get<
      ApiResponse<{
        matches: Match[];
        totalMatches: number;
        activeMatches: number;
        completedMatches: number;
      }>
    >(`/sessions/${sessionId}/matches`);
    return response.data.data!;
  },

  // Create match
  createMatch: async (
    sessionId: string,
    data: { courtId: string; playerIds: string[] }
  ): Promise<{ match: Match; message: string }> => {
    const response = await api.post<
      ApiResponse<{
        match: Match;
        message: string;
      }>
    >(`/sessions/${sessionId}/matches`, data);
    // toast.success("Match created successfully");
    return response.data.data!;
  },

  // End match
  endMatch: async (sessionId: string, matchId: string): Promise<Match> => {
    const response = await api.patch<ApiResponse<Match>>(
      `/sessions/${sessionId}/matches/${matchId}/end`
    );
    // toast.success("Match ended successfully");
    return response.data.data!;
  },

  // Auto-assign players
  autoAssignPlayers: async (
    sessionId: string,
    options?: {
      strategy?: "fairness" | "speed" | "level_balance";
      maxPlayersPerCourt?: number;
    }
  ): Promise<{
    matches: Match[];
    strategy: string;
    assignedPlayers: number;
    courtsUsed: number;
    message: string;
  }> => {
    const response = await api.post<
      ApiResponse<{
        matches: Match[];
        strategy: string;
        assignedPlayers: number;
        courtsUsed: number;
        message: string;
      }>
    >(`/sessions/${sessionId}/auto-assign`, options || {});
    // toast.success("Players auto-assigned successfully");
    return response.data.data!;
  },
};

// Wait time service
export const WaitTimeService = {
  // Update wait times for session
  updateSessionWaitTimes: async (
    sessionId: string,
    minutesToAdd: number = 1
  ): Promise<{
    updatedCount: number;
    players: Player[];
    minutesAdded: number;
  }> => {
    const response = await api.put<
      ApiResponse<{
        updatedCount: number;
        players: Player[];
        minutesAdded: number;
      }>
    >(`/sessions/${sessionId}/wait-times`, { minutesToAdd });
    return response.data.data!;
  },

  // Get wait time statistics
  getWaitTimeStats: async (
    sessionId: string
  ): Promise<{
    stats: {
      totalPlayers: number;
      waitingPlayers: number;
      playingPlayers: number;
      averageWaitTime: number;
      maxWaitTime: number;
      minWaitTime: number;
      totalWaitTime: number;
      averageTotalWaitTime: number;
    };
    waitingPlayers: Player[];
    playingPlayers: Player[];
    lastUpdated: string;
  }> => {
    const response = await api.get<
      ApiResponse<{
        stats: any;
        waitingPlayers: Player[];
        playingPlayers: Player[];
        lastUpdated: string;
      }>
    >(`/sessions/${sessionId}/wait-times`);
    return response.data.data!;
  },

  // Reset wait times (using the update endpoint with 0 minutes)
  resetWaitTimes: async (
    sessionId: string,
    playerIds: string[],
    resetType: "current" | "total" | "both" = "current"
  ): Promise<{
    updatedCount: number;
    players: Player[];
    resetType: string;
  }> => {
    // Since there's no dedicated reset endpoint, we'll use the update endpoint
    // with specific logic to reset wait times to 0
    const response = await api.put<
      ApiResponse<{
        updatedCount: number;
        players: Player[];
        minutesAdded: number;
      }>
    >(`/sessions/${sessionId}/wait-times`, {
      minutesToAdd: 0,
      resetType,
      playerIds,
    });
    // toast.success("Wait times reset successfully");
    return {
      updatedCount: response.data.data!.updatedCount,
      players: response.data.data!.players,
      resetType,
    };
  },
};

// Real-time service for session status
export const RealTimeService = {
  // Get real-time session status
  getSessionStatus: async (
    sessionId: string
  ): Promise<{
    session: Session;
    stats: {
      totalPlayers: number;
      confirmedPlayers: number;
      waitingPlayers: number;
      playingPlayers: number;
      availableCourts: number;
      activeCourts: number;
      activeMatches: number;
    };
    waitStats: {
      averageWaitTime: number;
      maxWaitTime: number;
      minWaitTime: number;
    };
    waitingQueue: (Player & { queuePosition: number })[];
    activeMatches: {
      matchId: string;
      courtNumber: number;
      startTime: Date;
      duration: number;
      players: {
        playerId: string;
        playerNumber: number;
        name: string;
        gender: string;
        level: string;
        position: number;
      }[];
    }[];
    courts: {
      id: string;
      courtNumber: number;
      status: string;
      currentMatch: {
        id: string;
        startTime: Date;
        duration: number;
        playerCount: number;
      } | null;
    }[];
    lastUpdated: string;
  }> => {
    const response = await api.get<ApiResponse<any>>(
      `/sessions/${sessionId}/status`
    );
    return response.data.data!;
  },
};

// Court creation interface
export interface CourtConfig {
  courtNumber: number;
  courtName?: string;
}

// Session creation interface
export interface CreateSessionRequest {
  name: string;
  numberOfCourts: number;
  sessionDuration: number;
  maxPlayersPerCourt: number;
  requirePlayerInfo: boolean;
  startTime?: Date;
  endTime?: Date;
  courts?: CourtConfig[];
}

// Suggested players response types
export interface PlayerPair {
  players: Player[];
  totalLevelScore: number;
}

export interface SuggestedPlayersResponse {
  pair1: PlayerPair;
  pair2: PlayerPair;
  scoreDifference: number;
  totalPlayersConsidered: number;
}
