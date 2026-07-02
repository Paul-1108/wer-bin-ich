"use server";

import { prisma } from "@/lib/db";
import { fail, ok, revalidateGame } from "@/lib/game/actions/shared";
import {
  canAnswerQuestion,
  canAskQuestion,
  getNextTurnAfterAnswer,
  getOpenQuestion,
  getViewerRole,
  parsePlayerRole,
} from "@/lib/game/rules";
import { AnswerQuestionSchema, AskQuestionSchema } from "@/lib/game/schemas";
import type { ActionResult, PlayerRole } from "@/lib/game/types";

export async function askQuestionAction(
  gameId: number,
  playerTokenInput: string,
  textInput: string
): Promise<ActionResult<{ questionId: number }>> {
  try {
    const input = AskQuestionSchema.parse({ gameId, playerToken: playerTokenInput, text: textInput });
    const question = await prisma.$transaction(async (tx) => {
      const game = await tx.game.findUnique({
        where: { id: input.gameId },
        include: { questions: { orderBy: { createdAt: "asc" } } },
      });

      if (!game) throw new Error("Spiel wurde nicht gefunden.");

      const viewerRole = getViewerRole(game, input.playerToken);
      if (!canAskQuestion(game, viewerRole, getOpenQuestion(game.questions))) {
        throw new Error("Du kannst gerade keine Frage stellen.");
      }

      return tx.question.create({
        data: { gameId: input.gameId, askingPlayer: viewerRole, text: input.text },
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
        include: { questions: { orderBy: { createdAt: "asc" } } },
      });

      if (!game) throw new Error("Spiel wurde nicht gefunden.");

      const viewerRole = getViewerRole(game, input.playerToken);
      const openQuestion = getOpenQuestion(game.questions);
      if (!openQuestion || !canAnswerQuestion(game, viewerRole, openQuestion)) {
        throw new Error("Du kannst diese Frage gerade nicht beantworten.");
      }

      const askingPlayer = parsePlayerRole(openQuestion.askingPlayer);
      const nextTurn = getNextTurnAfterAnswer(input.answer, askingPlayer);

      await tx.question.update({
        where: { id: openQuestion.id },
        data: { answer: input.answer, answeredAt: new Date() },
      });

      return tx.game.update({
        where: { id: input.gameId },
        data: { currentTurn: nextTurn },
        select: { currentTurn: true },
      });
    });

    revalidateGame(input.gameId);
    return ok({ nextTurn: parsePlayerRole(updatedGame.currentTurn) });
  } catch (error) {
    return fail(error);
  }
}
