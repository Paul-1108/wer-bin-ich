import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createGameAction } from "@/lib/game/actions";
import type { SetSummaryDTO } from "@/lib/game/types";

type SetSelectionProps = {
  sets: SetSummaryDTO[];
};

async function startGame(formData: FormData) {
  "use server";

  const setId = Number(formData.get("setId"));
  const result = await createGameAction(setId);

  if (!result.ok) {
    throw new Error(result.error);
  }

  redirect(`/game/${result.data.gameId}`);
}

export function SetSelection({ sets }: SetSelectionProps) {
  if (sets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
        Es sind noch keine Sets vorhanden. Fuehre zuerst den Prisma-Seed aus.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
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
              <form action={startGame} className="w-full">
                <input name="setId" type="hidden" value={set.id} />
                <button
                  className="inline-flex h-9 w-full shrink-0 items-center justify-center rounded-4xl border border-transparent bg-primary bg-clip-padding px-3 text-sm font-medium text-primary-foreground whitespace-nowrap transition-all outline-none select-none hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:translate-y-px"
                  type="submit"
                >
                  Spiel starten
                </button>
              </form>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
