"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CardDTO } from "@/lib/game/types";

type BoardCardProps = {
  card: CardDTO;
  excluded: boolean;
  disabled?: boolean;
  onToggleExcluded: (cardId: number, excluded: boolean) => void;
  onGuess: (cardId: number) => void;
};

export function BoardCard({ card, excluded, disabled = false, onToggleExcluded, onGuess }: BoardCardProps) {
  return (
    <Card
      size="sm"
      className={cn(
        "min-h-44 transition-opacity",
        excluded && "bg-muted/60 opacity-50 ring-foreground/5"
      )}
    >
      <CardHeader className="gap-1">
        <CardTitle className={cn("text-sm", excluded && "line-through")}>{card.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{card.description}</p>
      </CardContent>
      <CardFooter className="grid grid-cols-1 gap-2">
        <Button
          disabled={disabled}
          onClick={() => onToggleExcluded(card.id, !excluded)}
          size="sm"
          type="button"
          variant={excluded ? "secondary" : "outline"}
        >
          {excluded ? "Zuruecknehmen" : "Ausschliessen"}
        </Button>
        <Button disabled={disabled} onClick={() => onGuess(card.id)} size="sm" type="button" variant="destructive">
          Final tippen
        </Button>
      </CardFooter>
    </Card>
  );
}
