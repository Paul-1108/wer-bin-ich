"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { getOrCreatePlayerToken } from "@/components/ui/game/client-player-token";
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

export function useGameController(game: GameViewDTO) {
  const router = useRouter();
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPlayerToken(getOrCreatePlayerToken());
      router.refresh();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [router]);

  useEffect(() => {
    if (game.status === "FINISHED") return;

    const interval = window.setInterval(() => router.refresh(), 2500);
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
      const validation = JoinGameSchema.safeParse({ gameId: game.id, role, playerToken: token });
      if (!validation.success) {
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
        return Promise.resolve({ ok: false, error: getValidationErrorMessage(validation) });
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
        return Promise.resolve({ ok: false, error: getValidationErrorMessage(validation) });
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
        return Promise.resolve({ ok: false, error: getValidationErrorMessage(validation) });
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
    if (!window.confirm(`Final auf "${card?.name ?? "diese Karte"}" tippen?`)) return;

    runAction((token) => {
      const validation = GuessCardSchema.safeParse({
        gameId: game.id,
        playerToken: token,
        cardId,
      });
      if (!validation.success) {
        return Promise.resolve({ ok: false, error: getValidationErrorMessage(validation) });
      }
      return guessCardAction(validation.data.gameId, validation.data.playerToken, validation.data.cardId);
    });
  }

  return {
    error,
    handleAnswerQuestion,
    handleAskQuestion,
    handleGuess,
    handleJoin,
    handleToggleExcluded,
    isPending,
    playerToken,
  };
}
