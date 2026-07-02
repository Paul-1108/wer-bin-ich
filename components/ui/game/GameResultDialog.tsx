"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { GameViewDTO } from "@/lib/game/types";

type GameResultDialogProps = {
  game: GameViewDTO;
};

function roleLabel(role: string | null) {
  if (role === "PLAYER_1") return "Spieler 1";
  if (role === "PLAYER_2") return "Spieler 2";
  return "Niemand";
}

export function GameResultDialog({ game }: GameResultDialogProps) {
  if (game.status !== "FINISHED") {
    return null;
  }

  return (
    <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <h2 className="text-lg font-semibold">Spiel beendet</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Gewinner: <span className="font-medium text-foreground">{roleLabel(game.result.winnerRole)}</span>
      </p>
      <Button className="mt-4" render={<Link href="/" />}>
        Neues Spiel starten
      </Button>
    </section>
  );
}
