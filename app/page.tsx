import { redirect } from "next/navigation";

import { SetSelection } from "@/components/ui/game/SetSelection";
import { getSetSummaries } from "@/lib/game/queries";

export const revalidate = 3600;

async function joinGameById(formData: FormData) {
  "use server";

  const gameId = Number(formData.get("gameId"));

  if (!Number.isInteger(gameId) || gameId <= 0) {
    redirect("/");
  }

  redirect(`/game/${gameId}`);
}

export default async function Home() {
  const sets = await getSetSummaries();

  return (
    <div className="flex flex-1 bg-background">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Online Spiel</p>
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">Wer bin ich?</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Waehle ein Set aus und starte ein neues Spiel. Danach koennen zwei Personen Spieler 1 oder Spieler 2
            uebernehmen, alle weiteren Besucher schauen zu.
          </p>
        </header>

        <form action={joinGameById} className="flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            aria-label="Spiel-ID"
            className="h-9 min-w-0 flex-1 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
            min={1}
            name="gameId"
            placeholder="Spiel-ID eingeben"
            required
            type="number"
          />
          <button
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-4xl border border-transparent bg-primary bg-clip-padding px-4 text-sm font-medium text-primary-foreground whitespace-nowrap transition-all outline-none select-none hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:translate-y-px"
            type="submit"
          >
            Spiel beitreten
          </button>
        </form>

        <SetSelection sets={sets} />
      </main>
    </div>
  );
}
