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

// Player types
export interface Player {
  id: string;
  sessionId: string;
  userId?: string;
  playerNumber: number;
  name?: string;
  gender?: "MALE" | "FEMALE";
  level?: "Y" | "Y_PLUS" | "TBY" | "TB_MINUS" | "TB" | "TB_PLUS";
  currentWaitTime: number;
  totalWaitTime: number;
  matchesPlayed: number;
  status: "WAITING" | "PLAYING" | "FINISHED";
  currentCourtId?: string;
  currentCourt?: Court;
  preFilledByHost: boolean;
  confirmedByPlayer: boolean;
  phone?: string;
}

// Court types
export interface Court {
  id: string;
  sessionId: string;
  courtNumber: number;
  status: "EMPTY" | "IN_USE";
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
}

export interface MatchPlayer {
  id: string;
  matchId: string;
  playerId: string;
  player: Player;
  position: number;
}

// Session service
export const SessionService = {
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
  createSession: async (data: Partial<Session>): Promise<Session> => {
    const response = await api.post<ApiResponse<Session>>("/sessions", data);
    toast.success("Session created successfully");
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
    toast.success("Session updated successfully");
    return response.data.data!;
  },

  // Delete session
  deleteSession: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/sessions/${id}`);
    toast.success("Session deleted successfully");
  },

  // Start session
  startSession: async (id: string): Promise<Session> => {
    const response = await api.post<ApiResponse<Session>>(
      `/sessions/${id}/start`
    );
    toast.success("Session started successfully");
    return response.data.data!;
  },

  // End session
  endSession: async (
    id: string
  ): Promise<{ session: Session; statistics: any }> => {
    const response = await api.post<
      ApiResponse<{ session: Session; statistics: any }>
    >(`/sessions/${id}/end`);
    toast.success("Session ended successfully");
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
};

// Bulk Player types
export interface BulkPlayerData {
  playerNumber: number;
  name?: string;
  gender?: "MALE" | "FEMALE";
  level?: "Y" | "Y_PLUS" | "TBY" | "TB_MINUS" | "TB" | "TB_PLUS";
  phone?: string;
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
    toast.success("Player confirmed successfully");
    return response.data.data!;
  },

  // Update wait times
  updateWaitTimes: async (
    sessionId: string,
    minutesToAdd: number = 1
  ): Promise<{ updatedCount: number; players: Player[] }> => {
    const response = await api.put<
      ApiResponse<{ updatedCount: number; players: Player[] }>
    >("/players/update-wait-times", {
      sessionId,
      minutesToAdd,
    });
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
    toast.success("Players selected successfully");
    return response.data.data!;
  },

  // Start match
  startMatch: async (
    courtId: string
  ): Promise<{ court: Court; match: Match }> => {
    const response = await api.post<
      ApiResponse<{ court: Court; match: Match }>
    >(`/courts/${courtId}/start-match`);
    toast.success("Match started successfully");
    return response.data.data!;
  },

  // End match
  endMatch: async (
    courtId: string
  ): Promise<{ court: Court; match: Match; players: Player[] }> => {
    const response = await api.post<
      ApiResponse<{ court: Court; match: Match; players: Player[] }>
    >(`/courts/${courtId}/end-match`);
    toast.success("Match ended successfully");
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
