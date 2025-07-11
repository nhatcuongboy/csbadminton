// Common types for the session management components
import { Level } from "@/lib/api";

export interface Player {
  id: string;
  playerNumber: number;
  name?: string; // Optional to match API response
  gender?: string;
  level?: Level;
  levelDescription?: string;
  status: string;
  currentWaitTime: number;
  totalWaitTime: number;
  matchesPlayed: number;
  currentCourtId?: string;
  preFilledByHost: boolean;
  confirmedByPlayer: boolean;
  requireConfirmInfo?: boolean;
  phone?: string;
}

export interface Court {
  id: string;
  courtNumber: number;
  courtName?: string;
  status: "IN_USE" | "READY" | "EMPTY";
  currentMatchId?: string;
  currentPlayers: Player[];
}

export interface MatchPlayer {
  id: string;
  matchId: string;
  playerId: string;
  position: number;
  player: Player;
}

export interface Match {
  id: string;
  status: string;
  courtId: string;
  startTime: string;
  endTime?: string;
  players: MatchPlayer[];
}

export type PlayerFilter = "ALL" | "PLAYING" | "WAITING";

export enum LevelLabel {
  Y_MINUS = "Y-",
  Y = "Y",
  Y_PLUS = "Y+",
  TBY = "TBY",
  TB_MINUS = "TB-",
  TB = "TB",
  TB_PLUS = "TB+",
  K = "K",
}
