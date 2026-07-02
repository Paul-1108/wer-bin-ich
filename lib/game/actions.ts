"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import {
  canAnswerQuestion,
  canAskQuestion,
  canGuessCard,
  canJoinRole,
  canUpdateOwnBoard,
  getNextStatusAfterJoin,
  getNextTurnAfterAnswer,
  getOpenQuestion,
  getViewerRole,
  isCorrectGuess,
  opponentRole,
  parsePlayerRole,
} from "@/lib/game/rules";
import {
  AnswerQuestionSchema,
  AskQuestionSchema,
  CreateGameSchema,
  getZodErrorMessage,
  GuessCardSchema,
  JoinGameSchema,
  SetCardExcludedSchema,
} from "@/lib/game/schemas";
import type { ActionResult, PlayerRole } from "@/lib/game/types";
import { ZodError } from "zod";

function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

function fail<T>(error: unknown): ActionResult<T> {
  return {
    ok: false,
    error:
      error instanceof ZodError
        ? getZodErrorMessage(error)
        : error instanceof Error
          ? error.message
          : "Unbekannter Fehler.",
  };
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function revalidateGame(gameId: number) {
  revalidatePath("/");
  revalidatePath(`/game/${gameId}`);
}

export async function createGameAction(setId: number): Promise<ActionResult<{ gameId: number }>> {
  try {
    const input = CreateGameSchema.parse({ setId });

    const set = await prisma.set.findUnique({
      where: { id: input.setId },
      include: {
        cards: {
          select: { id: true },
        },
      },
    });

    if (!set) {
      throw new Error("Set wurde nicht gefunden.");
    }

    if (set.cards.length < 2) {
      throw new Error("Ein Set braucht mindestens zwei Karten.");
    }

    const shuffledCards = shuffle(set.cards);
    const player1TargetCard = shuffledCards[0];
    const player2TargetCard = shuffledCards[1];

    const game = await prisma.game.create({
      data: {
        status: "SETUP",
        currentTurn: "PLAYER_1",
        setId: input.setId,
        player1TargetCardId: player1TargetCard.id,
        player2TargetCardId: player2TargetCard.id,
        cardMarks: {
          create: set.cards.flatMap((card) => [
            { cardId: card.id, playerRole: "PLAYER_1", excluded: false },
            { cardId: card.id, playerRole: "PLAYER_2", excluded: false },
          ]),
        },
      },
      select: { id: true },
    });

    revalidateGame(game.id);

    return ok({ gameId: game.id });
  } catch (error) {
    return fail(error);
  }
}

export async function joinGameAction(
  gameId: number,
  roleInput: string,
  playerTokenInput: string
): Promise<ActionResult<{ role: PlayerRole }>> {
  try {
    const input = JoinGameSchema.parse({
      gameId,
      role: roleInput,
      playerToken: playerTokenInput,
    });

    const game = await prisma.$transaction(async (tx) => {
      const currentGame = await tx.game.findUnique({
        where: { id: input.gameId },
        select: {
          id: true,
          status: true,
          player1Token: true,
          player2Token: true,
        },
      });

      if (!currentGame) {
        throw new Error("Spiel wurde nicht gefunden.");
      }

      if (currentGame.status === "FINISHED") {
        throw new Error("Dieses Spiel ist bereits beendet.");
      }

      if (!canJoinRole(currentGame, input.role, input.playerToken)) {
        throw new Error("Diese Rolle ist bereits belegt.");
      }

      const nextTokens = {
        player1Token: input.role === "PLAYER_1" ? input.playerToken : currentGame.player1Token,
        player2Token: input.role === "PLAYER_2" ? input.playerToken : currentGame.player2Token,
      };

      return tx.game.update({
        where: { id: input.gameId },
        data: {
          ...nextTokens,
          status: getNextStatusAfterJoin(nextTokens),
        },
        select: {
          id: true,
        },
      });
    });

    revalidateGame(game.id);

    return ok({ role: input.role });
  } catch (error) {
    return fail(error);
  }
}

export async function askQuestionAction(
  gameId: number,
  playerTokenInput: string,
  textInput: string
): Promise<ActionResult<{ questionId: number }>> {
  try {
    const input = AskQuestionSchema.parse({
      gameId,
      playerToken: playerTokenInput,
      text: textInput,
    });

    const question = await prisma.$transaction(async (tx) => {
      const game = await tx.game.findUnique({
        where: { id: input.gameId },
        include: {
          questions: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!game) {
        throw new Error("Spiel wurde nicht gefunden.");
      }

      const viewerRole = getViewerRole(game, input.playerToken);
      const openQuestion = getOpenQuestion(game.questions);

      if (!canAskQuestion(game, viewerRole, openQuestion)) {
        throw new Error("Du kannst gerade keine Frage stellen.");
      }

      return tx.question.create({
        data: {
          gameId: input.gameId,
          askingPlayer: viewerRole,
          text: input.text,
        },
        select: { id: true },
      });
    });

    revalidateGame(input.gameId);

    return ok({ questionId: question.id });
  } catch (error) {
    return fail(error);
  }
}

export async function answerQuestionAction(
  gameId: number,
  playerTokenInput: string,
  answerInput: string
): Promise<ActionResult<{ nextTurn: PlayerRole }>> {
  try {
    const input = AnswerQuestionSchema.parse({
      gameId,
      playerToken: playerTokenInput,
      answer: answerInput,
    });

    const updatedGame = await prisma.$transaction(async (tx) => {
      const game = await tx.game.findUnique({
        where: { id: input.gameId },
        include: {
          questions: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!game) {
        throw new Error("Spiel wurde nicht gefunden.");
      }

      const viewerRole = getViewerRole(game, input.playerToken);
      const openQuestion = getOpenQuestion(game.questions);

      if (!openQuestion || !canAnswerQuestion(game, viewerRole, openQuestion)) {
        throw new Error("Du kannst diese Frage gerade nicht beantworten.");
      }

      const askingPlayer = parsePlayerRole(openQuestion.askingPlayer);
      const nextTurn = getNextTurnAfterAnswer(input.answer, askingPlayer);

      await tx.question.update({
        where: { id: openQuestion.id },
        data: {
          answer: input.answer,
          answeredAt: new Date(),
        },
      });

      return tx.game.update({
        where: { id: input.gameId },
        data: {
          currentTurn: nextTurn,
        },
        select: {
          currentTurn: true,
        },
      });
    });

    revalidateGame(input.gameId);

    return ok({ nextTurn: parsePlayerRole(updatedGame.currentTurn) });
  } catch (error) {
    return fail(error);
  }
}

export async function setCardExcludedAction(
  gameId: number,
  playerTokenInput: string,
  cardId: number,
  excluded: boolean
): Promise<ActionResult<{ cardId: number; excluded: boolean }>> {
  try {
    const input = SetCardExcludedSchema.parse({
      gameId,
      playerToken: playerTokenInput,
      cardId,
      excluded,
    });

    await prisma.$transaction(async (tx) => {
      const game = await tx.game.findUnique({
        where: { id: input.gameId },
        select: {
          id: true,
          status: true,
          currentTurn: true,
          setId: true,
          player1Token: true,
          player2Token: true,
        },
      });

      if (!game) {
        throw new Error("Spiel wurde nicht gefunden.");
      }

      const viewerRole = getViewerRole(game, input.playerToken);

      if (!canUpdateOwnBoard(game, viewerRole)) {
        throw new Error("Du kannst dieses Spielfeld nicht bearbeiten.");
      }

      const cardBelongsToSet = await tx.card.findFirst({
        where: {
          id: input.cardId,
          setId: game.setId,
        },
        select: { id: true },
      });

      if (!cardBelongsToSet) {
        throw new Error("Diese Karte gehoert nicht zum Spielset.");
      }

      await tx.cardMark.upsert({
        where: {
          gameId_playerRole_cardId: {
            gameId: input.gameId,
            playerRole: viewerRole,
            cardId: input.cardId,
          },
        },
        update: {
          excluded: input.excluded,
        },
        create: {
          gameId: input.gameId,
          playerRole: viewerRole,
          cardId: input.cardId,
          excluded: input.excluded,
        },
      });
    });

    revalidateGame(input.gameId);

    return ok({ cardId: input.cardId, excluded: input.excluded });
  } catch (error) {
    return fail(error);
  }
}

export async function guessCardAction(
  gameId: number,
  playerTokenInput: string,
  cardId: number
): Promise<ActionResult<{ correct: boolean; winnerRole: PlayerRole; loserRole: PlayerRole }>> {
  try {
    const input = GuessCardSchema.parse({
      gameId,
      playerToken: playerTokenInput,
      cardId,
    });

    const result = await prisma.$transaction(async (tx) => {
      const game = await tx.game.findUnique({
        where: { id: input.gameId },
        select: {
          id: true,
          status: true,
          currentTurn: true,
          setId: true,
          player1Token: true,
          player2Token: true,
          player1TargetCardId: true,
          player2TargetCardId: true,
        },
      });

      if (!game) {
        throw new Error("Spiel wurde nicht gefunden.");
      }

      const viewerRole = getViewerRole(game, input.playerToken);

      if (!canGuessCard(game, viewerRole)) {
        throw new Error("Du kannst gerade keine finale Antwort abgeben.");
      }

      const role = parsePlayerRole(viewerRole);
      const cardBelongsToSet = await tx.card.findFirst({
        where: {
          id: input.cardId,
          setId: game.setId,
        },
        select: { id: true },
      });

      if (!cardBelongsToSet) {
        throw new Error("Diese Karte gehoert nicht zum Spielset.");
      }

      const correct = isCorrectGuess(game, role, input.cardId);
      const winnerRole = correct ? role : opponentRole(role);
      const loserRole = correct ? opponentRole(role) : role;

      await tx.game.update({
        where: { id: input.gameId },
        data: {
          status: "FINISHED",
          finalGuessBy: role,
          finalGuessCardId: input.cardId,
          winnerRole,
          loserRole,
        },
      });

      return {
        correct,
        winnerRole,
        loserRole,
      };
    });

    revalidateGame(input.gameId);

    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
