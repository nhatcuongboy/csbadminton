"use client";

import { useState } from "react";
// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Player } from "@/lib/api/types";
import { UserPlus, User, Edit, Trash } from "lucide-react";
import { Button } from "@chakra-ui/react";
import { getLevelLabel } from "@/utils/level-mapping";

export function AddPlayerForm({
  sessionId,
  onSuccess,
}: {
  sessionId: string;
  onSuccess?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const playerData = {
        name: formData.get("name") as string,
        gender: formData.get("gender") as
          | "MALE"
          | "FEMALE"
          | "OTHER"
          | "PREFER_NOT_TO_SAY",
        level: formData.get("level") as
          | "Y"
          | "Y_PLUS"
          | "TBY"
          | "TB_MINUS"
          | "TB"
          | "TB_PLUS",
        phone: formData.get("phone") as string,
        preFilledByHost: true,
      };

      // This would call your API in a real implementation
      console.log("Adding player:", playerData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSuccess) onSuccess();

      // Reset form
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error adding player:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="mr-2 h-5 w-5" />
          Add New Player
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input id="name" name="name" placeholder="John Doe" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="level" className="text-sm font-medium">
                Skill Level
              </label>
              <select
                id="level"
                name="level"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value="">Select Level</option>
                <option value="Y">Y (Weak)</option>
                <option value="Y_PLUS">Y+ (Weak+)</option>
                <option value="TBY">TBY (Medium-weak)</option>
                <option value="TB_MINUS">TB- (Medium-)</option>
                <option value="TB">TB (Medium)</option>
                <option value="TB_PLUS">TB+ (Medium+)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number (Optional)
            </label>
            <Input id="phone" name="phone" placeholder="+84 xxx xxx xxx" />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Player"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function PlayerCard({
  player,
  onEdit,
  onDelete,
}: {
  player: Player;
  onEdit?: (player: Player) => void;
  onDelete?: (player: Player) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex justify-between">
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>
              #{player.playerNumber} - {player.name || "Unnamed Player"}
            </span>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(player)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(player)}
                className="h-8 w-8 p-0 text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-1 text-sm">
          <div className="text-muted-foreground">Gender:</div>
          <div>{player.gender || "Not specified"}</div>

          <div className="text-muted-foreground">Level:</div>
          <div>{getLevelLabel(player.level, "Not specified")}</div>

          <div className="text-muted-foreground">Status:</div>
          <div>{player.status}</div>

          <div className="text-muted-foreground">Wait Time:</div>
          <div>{player.currentWaitTime} min</div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        {player.confirmedByPlayer
          ? "Player has confirmed participation"
          : player.preFilledByHost
          ? "Pre-filled by host, waiting for player confirmation"
          : "Waiting for player to complete registration"}
      </CardFooter>
    </Card>
  );
}

export function PlayerList({
  players,
  onEdit,
  onDelete,
}: {
  players: Player[];
  onEdit?: (player: Player) => void;
  onDelete?: (player: Player) => void;
}) {
  if (!players || players.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <User className="h-8 w-8 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No Players</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Add players to your session to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
