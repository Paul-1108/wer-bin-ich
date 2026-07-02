"use server";

import { prisma } from "@/lib/db";
import { fail, ok, revalidateGame, shuffle } from "@/lib/game/actions/shared";
import { canJoinRole, getNextStatusAfterJoin } from "@/lib/game/rules";
import { CreateGameSchema, JoinGameSchema } from "@/lib/game/schemas";
import type { ActionResult, PlayerRole } from "@/lib/game/types";

export async function createGameAction(setId: number): Promise<ActionResult<{ gameId: number }>> {
  try {
    const input = CreateGameSchema.parse({ setId });
    const set = await prisma.set.findUnique({
      where: { id: input.setId },
      include: { cards: { select: { id: true } } },
    });

    if (!set) throw new Error("Set wurde nicht gefunden.");
    if (set.cards.length < 2) throw new Error("Ein Set braucht mindestens zwei Karten.");

    const [player1TargetCard, player2TargetCard] = shuffle(set.cards);
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
    const input = JoinGameSchema.parse({ gameId, role: roleInput, playerToken: playerTokenInput });
    const game = await prisma.$transaction(async (tx) => {
      const currentGame = await tx.game.findUnique({
        where: { id: input.gameId },
        select: { id: true, status: true, player1Token: true, player2Token: true },
      });

      if (!currentGame) throw new Error("Spiel wurde nicht gefunden.");
      if (currentGame.status === "FINISHED") throw new Error("Dieses Spiel ist bereits beendet.");
      if (!canJoinRole(currentGame, input.role, input.playerToken)) {
        throw new Error("Diese Rolle ist bereits belegt.");
      }

      const nextTokens = {
        player1Token: input.role === "PLAYER_1" ? input.playerToken : currentGame.player1Token,
        player2Token: input.role === "PLAYER_2" ? input.playerToken : currentGame.player2Token,
      };

      return tx.game.update({
        where: { id: input.gameId },
        data: { ...nextTokens, status: getNextStatusAfterJoin(nextTokens) },
        select: { id: true },
      });
    });

    revalidateGame(game.id);
    return ok({ role: input.role });
  } catch (error) {
    return fail(error);
  }
}
