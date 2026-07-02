"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CardDTO, ViewerRole } from "@/lib/game/types";

type TargetCardProps = {
  card: CardDTO | null;
  viewerRole: ViewerRole;
};

export function TargetCard({ card, viewerRole }: TargetCardProps) {
  return (
    <section className="rounded-lg border border-border bg-muted/30 p-4">
      <h2 className="text-sm font-semibold">Karte des Gegners</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {viewerRole === "SPECTATOR"
          ? "Zuschauer sehen keine geheimen Karten."
          : "Diese Karte muss dein Gegner erraten."}
      </p>

      {card ? (
        <Card className="mt-4" size="sm">
          <CardHeader>
            <CardTitle>{card.name}</CardTitle>
            <CardDescription>Zielkarte</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Keine Karte sichtbar.
        </div>
      )}
    </section>
  );
}
