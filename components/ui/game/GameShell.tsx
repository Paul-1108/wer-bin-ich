"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Board } from "@/components/ui/game/Board";
import { GameResultDialog } from "@/components/ui/game/GameResultDialog";
import { GameStatusBar } from "@/components/ui/game/GameStatusBar";
import { PlayerRoleSelector } from "@/components/ui/game/PlayerRoleSelector";
import { QuestionPanel } from "@/components/ui/game/QuestionPanel";
import { TargetCard } from "@/components/ui/game/TargetCard";
import { getStoredPlayerToken } from "@/components/ui/game/player-token";
import {
  answerQuestionAction,
  askQuestionAction,
  guessCardAction,
  joinGameAction,
  setCardExcludedAction,
} from "@/lib/game/actions";
import {
  AnswerQuestionSchema,
  AskQuestionSchema,
  getValidationErrorMessage,
  GuessCardSchema,
  JoinGameSchema,
  SetCardExcludedSchema,
} from "@/lib/game/schemas";
import type { ActionResult, GameViewDTO, PlayerRole, QuestionAnswer } from "@/lib/game/types";

type GameShellProps = {
  game: GameViewDTO;
};

export function GameShell({ game }: GameShellProps) {
  const router = useRouter();
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const token = getStoredPlayerToken();
      setPlayerToken(token);
      router.refresh();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [router]);

  useEffect(() => {
    if (game.status === "FINISHED") return;

    const interval = window.setInterval(() => {
      router.refresh();
    }, 2500);

    return () => window.clearInterval(interval);
  }, [game.status, router]);

  function runAction<T>(action: (token: string) => Promise<ActionResult<T>>) {
    if (!playerToken) {
      setError("Spieler-Token wird noch vorbereitet.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await action(playerToken);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleJoin(role: PlayerRole) {
    runAction((token) => {
      const validation = JoinGameSchema.safeParse({
        gameId: game.id,
        role,
        playerToken: token,
      });

      if (!validation.success) {
        setError(getValidationErrorMessage(validation));
        return Promise.resolve({ ok: false, error: getValidationErrorMessage(validation) });
      }

      return joinGameAction(validation.data.gameId, validation.data.role, validation.data.playerToken);
    });
  }

  function handleAskQuestion(question: string) {
    runAction((token) => {
      const validation = AskQuestionSchema.safeParse({
        gameId: game.id,
        playerToken: token,
        text: question,
      });

      if (!validation.success) {
        const error = getValidationErrorMessage(validation);
        setError(error);
        return Promise.resolve({ ok: false, error });
      }

      return askQuestionAction(validation.data.gameId, validation.data.playerToken, validation.data.text);
    });
  }

  function handleAnswerQuestion(answer: QuestionAnswer) {
    runAction((token) => {
      const validation = AnswerQuestionSchema.safeParse({
        gameId: game.id,
        playerToken: token,
        answer,
      });

      if (!validation.success) {
        const error = getValidationErrorMessage(validation);
        setError(error);
        return Promise.resolve({ ok: false, error });
      }

      return answerQuestionAction(validation.data.gameId, validation.data.playerToken, validation.data.answer);
    });
  }

  function handleToggleExcluded(cardId: number, excluded: boolean) {
    runAction((token) => {
      const validation = SetCardExcludedSchema.safeParse({
        gameId: game.id,
        playerToken: token,
        cardId,
        excluded,
      });

      if (!validation.success) {
        const error = getValidationErrorMessage(validation);
        setError(error);
        return Promise.resolve({ ok: false, error });
      }

      return setCardExcludedAction(
        validation.data.gameId,
        validation.data.playerToken,
        validation.data.cardId,
        validation.data.excluded
      );
    });
  }

  function handleGuess(cardId: number) {
    const card = game.set.cards.find((candidate) => candidate.id === cardId);
    const confirmed = window.confirm(`Final auf "${card?.name ?? "diese Karte"}" tippen?`);

    if (!confirmed) return;

    runAction((token) => {
      const validation = GuessCardSchema.safeParse({
        gameId: game.id,
        playerToken: token,
        cardId,
      });

      if (!validation.success) {
        const error = getValidationErrorMessage(validation);
        setError(error);
        return Promise.resolve({ ok: false, error });
      }

      return guessCardAction(validation.data.gameId, validation.data.playerToken, validation.data.cardId);
    });
  }

  return (
    <div className="flex flex-1 bg-background">
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <GameStatusBar
          currentTurn={game.currentTurn}
          setTitle={game.set.title}
          status={game.status}
          viewerRole={game.viewerRole}
        />

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <GameResultDialog game={game} />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Board
            cards={game.set.cards}
            disabled={isPending || game.status === "FINISHED" || !playerToken}
            marks={game.viewerCardMarks}
            onGuess={handleGuess}
            onToggleExcluded={handleToggleExcluded}
            viewerRole={game.viewerRole}
          />

          <aside className="flex flex-col gap-4">
            <PlayerRoleSelector
              disabled={isPending || !playerToken || game.status === "FINISHED"}
              onJoin={handleJoin}
              slots={game.playerSlots}
              viewerRole={game.viewerRole}
            />
            <TargetCard card={game.visibleTargetCard} viewerRole={game.viewerRole} />
            <QuestionPanel
              disabled={isPending || !playerToken}
              game={game}
              onAnswerQuestion={handleAnswerQuestion}
              onAskQuestion={handleAskQuestion}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
