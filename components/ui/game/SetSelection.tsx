"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createGameAction } from "@/lib/game/actions";
import { CreateGameSchema, getValidationErrorMessage } from "@/lib/game/schemas";
import type { SetSummaryDTO } from "@/lib/game/types";

type SetSelectionProps = {
  sets: SetSummaryDTO[];
};

export function SetSelection({ sets }: SetSelectionProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingSetId, setPendingSetId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStart(setId: number) {
    const validation = CreateGameSchema.safeParse({ setId });

    if (!validation.success) {
      setError(getValidationErrorMessage(validation));
      return;
    }

    setError(null);
    setPendingSetId(setId);

    startTransition(async () => {
      const result = await createGameAction(validation.data.setId);

      if (!result.ok) {
        setError(result.error);
        setPendingSetId(null);
        return;
      }

      router.push(`/game/${result.data.gameId}`);
    });
  }

  if (sets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
        Es sind noch keine Sets vorhanden. Fuehre zuerst den Prisma-Seed aus.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {sets.map((set) => (
          <Card key={set.id} className="min-h-48" size="sm">
            <CardHeader>
              <CardTitle>{set.title}</CardTitle>
              <CardDescription>{set.cardCount} Karten</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm leading-6 text-muted-foreground">{set.description}</p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={isPending}
                onClick={() => handleStart(set.id)}
                type="button"
              >
                {pendingSetId === set.id ? "Starte..." : "Spiel starten"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
