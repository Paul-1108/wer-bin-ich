import {
  GAME_STATUSES,
  PLAYER_ROLES,
  QUESTION_ANSWERS,
  type GameStatus,
  type PlayerRole,
  type QuestionAnswer,
  type ViewerRole,
} from "@/lib/game/types";

type TokenState = {
  player1Token: string | null;
  player2Token: string | null;
};

type TurnState = {
  status: string;
  currentTurn: string;
};

type QuestionState = {
  askingPlayer: string;
  answer: string | null;
};

type GuessState = TurnState & {
  player1TargetCardId: number | null;
  player2TargetCardId: number | null;
};

export function isPlayerRole(value: unknown): value is PlayerRole {
  return typeof value === "string" && PLAYER_ROLES.includes(value as PlayerRole);
}

export function isGameStatus(value: unknown): value is GameStatus {
  return typeof value === "string" && GAME_STATUSES.includes(value as GameStatus);
}

export function isQuestionAnswer(value: unknown): value is QuestionAnswer {
  return typeof value === "string" && QUESTION_ANSWERS.includes(value as QuestionAnswer);
}

export function parsePlayerRole(value: unknown): PlayerRole {
  if (!isPlayerRole(value)) {
    throw new Error("Ungueltige Spielerrolle.");
  }

  return value;
}

export function parseGameStatus(value: unknown): GameStatus {
  if (!isGameStatus(value)) {
    throw new Error("Ungueltiger Spielstatus.");
  }

  return value;
}

export function parseQuestionAnswer(value: unknown): QuestionAnswer {
  if (!isQuestionAnswer(value)) {
    throw new Error("Ungueltige Antwort.");
  }

  return value;
}

export function opponentRole(role: PlayerRole): PlayerRole {
  return role === "PLAYER_1" ? "PLAYER_2" : "PLAYER_1";
}

export function getViewerRole(game: TokenState, playerToken?: string | null): ViewerRole {
  if (!playerToken) {
    return "SPECTATOR";
  }

  if (game.player1Token === playerToken) {
    return "PLAYER_1";
  }

  if (game.player2Token === playerToken) {
    return "PLAYER_2";
  }

  return "SPECTATOR";
}

export function canJoinRole(game: TokenState, role: PlayerRole, playerToken: string): boolean {
  const viewerRole = getViewerRole(game, playerToken);

  if (viewerRole === role) {
    return true;
  }

  if (viewerRole !== "SPECTATOR") {
    return false;
  }

  return role === "PLAYER_1" ? !game.player1Token : !game.player2Token;
}

export function getNextStatusAfterJoin(game: TokenState): GameStatus {
  return game.player1Token && game.player2Token ? "PLAYING" : "SETUP";
}

export function getOpenQuestion<T extends QuestionState>(questions: T[]): T | null {
  return questions.find((question) => question.answer === null) ?? null;
}

export function canAskQuestion(game: TurnState, viewerRole: ViewerRole, openQuestion: QuestionState | null): boolean {
  return game.status === "PLAYING" && viewerRole !== "SPECTATOR" && game.currentTurn === viewerRole && !openQuestion;
}

export function canAnswerQuestion(
  game: TurnState,
  viewerRole: ViewerRole,
  openQuestion: QuestionState | null
): boolean {
  return (
    game.status === "PLAYING" &&
    viewerRole !== "SPECTATOR" &&
    !!openQuestion &&
    opponentRole(parsePlayerRole(openQuestion.askingPlayer)) === viewerRole
  );
}

export function getNextTurnAfterAnswer(answer: QuestionAnswer, askingPlayer: PlayerRole): PlayerRole {
  if (answer === "YES") {
    return askingPlayer;
  }

  return opponentRole(askingPlayer);
}

export function canUpdateOwnBoard(game: TurnState, viewerRole: ViewerRole): boolean {
  return game.status !== "FINISHED" && viewerRole !== "SPECTATOR";
}

export function canGuessCard(game: TurnState, viewerRole: ViewerRole): boolean {
  return game.status === "PLAYING" && viewerRole !== "SPECTATOR" && game.currentTurn === viewerRole;
}

export function getTargetCardIdForRole(game: GuessState, role: PlayerRole): number | null {
  return role === "PLAYER_1" ? game.player1TargetCardId : game.player2TargetCardId;
}

export function getVisibleTargetCardIdForRole(game: GuessState, role: ViewerRole): number | null {
  if (role === "SPECTATOR") {
    return null;
  }

  return role === "PLAYER_1" ? game.player2TargetCardId : game.player1TargetCardId;
}

export function isCorrectGuess(game: GuessState, role: PlayerRole, cardId: number): boolean {
  return getTargetCardIdForRole(game, role) === cardId;
}
