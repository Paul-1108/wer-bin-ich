"use client";

import { cn } from "@/lib/utils";
import type { PlayerRole, ViewerRole } from "@/lib/game/types";

type TurnIndicatorProps = {
  currentTurn: PlayerRole;
  viewerRole: ViewerRole;
};

function label(role: PlayerRole) {
  return role === "PLAYER_1" ? "Spieler 1" : "Spieler 2";
}

export function TurnIndicator({ currentTurn, viewerRole }: TurnIndicatorProps) {
  const isOwnTurn = viewerRole === currentTurn;

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        isOwnTurn ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/40"
      )}
    >
      {isOwnTurn ? "Du bist dran" : `${label(currentTurn)} ist dran`}
    </div>
  );
}
