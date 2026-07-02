export const PLAYER_ROLES = ["PLAYER_1", "PLAYER_2"] as const;
export const GAME_STATUSES = ["SETUP", "PLAYING", "FINISHED"] as const;
export const QUESTION_ANSWERS = ["YES", "NO", "UNKNOWN"] as const;

export type PlayerRole = (typeof PLAYER_ROLES)[number];
export type ViewerRole = PlayerRole | "SPECTATOR";
export type GameStatus = (typeof GAME_STATUSES)[number];
export type QuestionAnswer = (typeof QUESTION_ANSWERS)[number];

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type CardDTO = {
  id: number;
  name: string;
  description: string;
};

export type SetSummaryDTO = {
  id: number;
  title: string;
  description: string;
  cardCount: number;
};

export type SetWithCardsDTO = SetSummaryDTO & {
  cards: CardDTO[];
};

export type QuestionDTO = {
  id: number;
  text: string;
  askingPlayer: PlayerRole;
  answer: QuestionAnswer | null;
  createdAt: string;
  answeredAt: string | null;
};

export type CardMarkDTO = {
  cardId: number;
  playerRole: PlayerRole;
  excluded: boolean;
};

export type GameResultDTO = {
  finalGuessBy: PlayerRole | null;
  finalGuessCardId: number | null;
  winnerRole: PlayerRole | null;
  loserRole: PlayerRole | null;
};

export type PlayerSlotsDTO = {
  player1Taken: boolean;
  player2Taken: boolean;
};

export type GameViewDTO = {
  id: number;
  status: GameStatus;
  currentTurn: PlayerRole;
  viewerRole: ViewerRole;
  playerSlots: PlayerSlotsDTO;
  set: SetWithCardsDTO;
  visibleTargetCard: CardDTO | null;
  questions: QuestionDTO[];
  openQuestion: QuestionDTO | null;
  cardMarks: CardMarkDTO[];
  viewerCardMarks: CardMarkDTO[];
  result: GameResultDTO;
  createdAt: string;
  updatedAt: string;
};
