import { SetSelection } from "@/components/ui/game/SetSelection";
import { getSetSummaries } from "@/lib/game/queries";

export const revalidate = 3600;

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

        <SetSelection sets={sets} />
      </main>
    </div>
  );
}
