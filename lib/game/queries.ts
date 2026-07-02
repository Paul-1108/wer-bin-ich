import { prisma } from "@/lib/db";
import {
  getOpenQuestion,
  getViewerRole,
  getVisibleTargetCardIdForRole,
  parseGameStatus,
  parsePlayerRole,
  parseQuestionAnswer,
} from "@/lib/game/rules";
import type {
  CardDTO,
  CardMarkDTO,
  GameViewDTO,
  QuestionDTO,
  SetSummaryDTO,
  SetWithCardsDTO,
} from "@/lib/game/types";

function toCardDTO(card: { id: number; name: string; description: string }): CardDTO {
  return {
    id: card.id,
    name: card.name,
    description: card.description,
  };
}

function toQuestionDTO(question: {
  id: number;
  text: string;
  askingPlayer: string;
  answer: string | null;
  createdAt: Date;
  answeredAt: Date | null;
}): QuestionDTO {
  return {
    id: question.id,
    text: question.text,
    askingPlayer: parsePlayerRole(question.askingPlayer),
    answer: question.answer ? parseQuestionAnswer(question.answer) : null,
    createdAt: question.createdAt.toISOString(),
    answeredAt: question.answeredAt?.toISOString() ?? null,
  };
}

function toCardMarkDTO(mark: { cardId: number; playerRole: string; excluded: boolean }): CardMarkDTO {
  return {
    cardId: mark.cardId,
    playerRole: parsePlayerRole(mark.playerRole),
    excluded: mark.excluded,
  };
}

export async function getSetSummaries(): Promise<SetSummaryDTO[]> {
  const sets = await prisma.set.findMany({
    orderBy: { title: "asc" },
    include: {
      _count: {
        select: { cards: true },
      },
    },
  });

  return sets.map((set) => ({
    id: set.id,
    title: set.title,
    description: set.description,
    cardCount: set._count.cards,
  }));
}

export async function getSetWithCards(setId: number): Promise<SetWithCardsDTO | null> {
  const set = await prisma.set.findUnique({
    where: { id: setId },
    include: {
      cards: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!set) {
    return null;
  }

  return {
    id: set.id,
    title: set.title,
    description: set.description,
    cardCount: set.cards.length,
    cards: set.cards.map(toCardDTO),
  };
}

export async function getGameView(gameId: number, playerToken?: string | null): Promise<GameViewDTO | null> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      set: {
        include: {
          cards: {
            orderBy: { name: "asc" },
          },
        },
      },
      questions: {
        orderBy: { createdAt: "asc" },
      },
      cardMarks: true,
      player1TargetCard: true,
      player2TargetCard: true,
      finalGuessCard: true,
    },
  });

  if (!game) {
    return null;
  }

  const status = parseGameStatus(game.status);
  const currentTurn = parsePlayerRole(game.currentTurn);
  const viewerRole = getViewerRole(game, playerToken);
  const questions = game.questions.map(toQuestionDTO);
  const cardMarks = game.cardMarks.map(toCardMarkDTO);
  const visibleTargetCardId = getVisibleTargetCardIdForRole(game, viewerRole);
  const visibleTargetCard =
    visibleTargetCardId === game.player1TargetCardId
      ? game.player1TargetCard
      : visibleTargetCardId === game.player2TargetCardId
        ? game.player2TargetCard
        : null;

  return {
    id: game.id,
    status,
    currentTurn,
    viewerRole,
    playerSlots: {
      player1Taken: !!game.player1Token,
      player2Taken: !!game.player2Token,
    },
    set: {
      id: game.set.id,
      title: game.set.title,
      description: game.set.description,
      cardCount: game.set.cards.length,
      cards: game.set.cards.map(toCardDTO),
    },
    visibleTargetCard: visibleTargetCard ? toCardDTO(visibleTargetCard) : null,
    questions,
    openQuestion: getOpenQuestion(questions),
    cardMarks,
    viewerCardMarks: viewerRole === "SPECTATOR" ? [] : cardMarks.filter((mark) => mark.playerRole === viewerRole),
    result: {
      finalGuessBy: game.finalGuessBy ? parsePlayerRole(game.finalGuessBy) : null,
      finalGuessCardId: game.finalGuessCardId,
      winnerRole: game.winnerRole ? parsePlayerRole(game.winnerRole) : null,
      loserRole: game.loserRole ? parsePlayerRole(game.loserRole) : null,
    },
    createdAt: game.createdAt.toISOString(),
    updatedAt: game.updatedAt.toISOString(),
  };
}
