"use client";

import { Button } from "@/components/ui/button";
import type { CardDTO } from "@/lib/game/types";

type FinalGuessDialogProps = {
  card: CardDTO;
  disabled?: boolean;
  onConfirm: (cardId: number) => void;
};

export function FinalGuessDialog({ card, disabled = false, onConfirm }: FinalGuessDialogProps) {
  return (
    <Button disabled={disabled} onClick={() => onConfirm(card.id)} size="sm" type="button" variant="destructive">
      Final tippen
    </Button>
  );
}
