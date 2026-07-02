"use server";

import { prisma } from "@/lib/db";
import { fail, ok, revalidateGame } from "@/lib/game/actions/shared";
import {
  canGuessCard,
  canUpdateOwnBoard,
  getViewerRole,
  isCorrectGuess,
  opponentRole,
  parsePlayerRole,
} from "@/lib/game/rules";
import { GuessCardSchema, SetCardExcludedSchema } from "@/lib/game/schemas";
import type { ActionResult, PlayerRole } from "@/lib/game/types";

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

      if (!game) throw new Error("Spiel wurde nicht gefunden.");

      const viewerRole = getViewerRole(game, input.playerToken);
      if (!canUpdateOwnBoard(game, viewerRole)) {
        throw new Error("Du kannst dieses Spielfeld nicht bearbeiten.");
      }

      const cardBelongsToSet = await tx.card.findFirst({
        where: { id: input.cardId, setId: game.setId },
        select: { id: true },
      });
      if (!cardBelongsToSet) throw new Error("Diese Karte gehoert nicht zum Spielset.");

      await tx.cardMark.upsert({
        where: {
          gameId_playerRole_cardId: {
            gameId: input.gameId,
            playerRole: viewerRole,
            cardId: input.cardId,
          },
        },
        update: { excluded: input.excluded },
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
    const input = GuessCardSchema.parse({ gameId, playerToken: playerTokenInput, cardId });
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

      if (!game) throw new Error("Spiel wurde nicht gefunden.");

      const viewerRole = getViewerRole(game, input.playerToken);
      if (!canGuessCard(game, viewerRole)) {
        throw new Error("Du kannst gerade keine finale Antwort abgeben.");
      }

      const role = parsePlayerRole(viewerRole);
      const cardBelongsToSet = await tx.card.findFirst({
        where: { id: input.cardId, setId: game.setId },
        select: { id: true },
      });
      if (!cardBelongsToSet) throw new Error("Diese Karte gehoert nicht zum Spielset.");

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

      return { correct, winnerRole, loserRole };
    });

    revalidateGame(input.gameId);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
