"use client";

import { TurnIndicator } from "@/components/ui/game/TurnIndicator";
import type { GameStatus, PlayerRole, ViewerRole } from "@/lib/game/types";

type GameStatusBarProps = {
  status: GameStatus;
  currentTurn: PlayerRole;
  viewerRole: ViewerRole;
  setTitle: string;
};

function roleLabel(role: ViewerRole) {
  if (role === "PLAYER_1") return "Spieler 1";
  if (role === "PLAYER_2") return "Spieler 2";
  return "Zuschauer";
}

function statusLabel(status: GameStatus) {
  if (status === "SETUP") return "Warte auf Spieler";
  if (status === "PLAYING") return "Laeuft";
  return "Beendet";
}

export function GameStatusBar({ status, currentTurn, viewerRole, setTitle }: GameStatusBarProps) {
  return (
    <section className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{setTitle}</p>
        <h1 className="text-2xl font-semibold tracking-normal">Wer bin ich?</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">{statusLabel(status)}</div>
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">{roleLabel(viewerRole)}</div>
        {status === "PLAYING" && <TurnIndicator currentTurn={currentTurn} viewerRole={viewerRole} />}
      </div>
    </section>
  );
}
