"use client";

import { Board } from "@/components/ui/game/Board";
import { GameResultDialog } from "@/components/ui/game/GameResultDialog";
import { GameStatusBar } from "@/components/ui/game/GameStatusBar";
import { PlayerRoleSelector } from "@/components/ui/game/PlayerRoleSelector";
import { QuestionPanel } from "@/components/ui/game/QuestionPanel";
import { TargetCard } from "@/components/ui/game/TargetCard";
import { useGameController } from "@/components/ui/game/use-game-controller";
import type { GameViewDTO } from "@/lib/game/types";

type GameShellProps = {
  game: GameViewDTO;
};

export function GameShell({ game }: GameShellProps) {
  const controller = useGameController(game);
  const controlsDisabled = controller.isPending || !controller.playerToken;

  return (
    <div className="flex flex-1 bg-background">
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <GameStatusBar
          currentTurn={game.currentTurn}
          setTitle={game.set.title}
          status={game.status}
          viewerRole={game.viewerRole}
        />

        {controller.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {controller.error}
          </div>
        )}

        <GameResultDialog game={game} />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Board
            cards={game.set.cards}
            disabled={controlsDisabled || game.status === "FINISHED"}
            marks={game.viewerCardMarks}
            onGuess={controller.handleGuess}
            onToggleExcluded={controller.handleToggleExcluded}
            viewerRole={game.viewerRole}
          />

          <aside className="flex flex-col gap-4">
            <PlayerRoleSelector
              disabled={controlsDisabled || game.status === "FINISHED"}
              onJoin={controller.handleJoin}
              slots={game.playerSlots}
              viewerRole={game.viewerRole}
            />
            <TargetCard card={game.visibleTargetCard} viewerRole={game.viewerRole} />
            <QuestionPanel
              disabled={controlsDisabled}
              game={game}
              onAnswerQuestion={controller.handleAnswerQuestion}
              onAskQuestion={controller.handleAskQuestion}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
