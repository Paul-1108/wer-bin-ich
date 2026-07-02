"use client";

import { BoardCard } from "@/components/ui/game/BoardCard";
import type { CardDTO, CardMarkDTO, ViewerRole } from "@/lib/game/types";

type BoardProps = {
  cards: CardDTO[];
  marks: CardMarkDTO[];
  viewerRole: ViewerRole;
  disabled?: boolean;
  onToggleExcluded: (cardId: number, excluded: boolean) => void;
  onGuess: (cardId: number) => void;
};

export function Board({ cards, marks, viewerRole, disabled = false, onToggleExcluded, onGuess }: BoardProps) {
  const excludedCardIds = new Set(marks.filter((mark) => mark.excluded).map((mark) => mark.cardId));
  const isSpectator = viewerRole === "SPECTATOR";

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Dein Spielfeld</h2>
          <p className="text-sm text-muted-foreground">
            {isSpectator ? "Zuschauer koennen das Spielfeld nicht bearbeiten." : "Schliesse Karten aus oder tippe final."}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{cards.length} Karten</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <BoardCard
            card={card}
            disabled={disabled || isSpectator}
            excluded={excludedCardIds.has(card.id)}
            key={card.id}
            onGuess={onGuess}
            onToggleExcluded={onToggleExcluded}
          />
        ))}
      </div>
    </section>
  );
}
