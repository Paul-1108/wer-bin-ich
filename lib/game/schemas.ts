import { z } from "zod";

import { PLAYER_ROLES, QUESTION_ANSWERS } from "@/lib/game/types";

export const IdSchema = z.number().int("ID muss eine ganze Zahl sein.").positive("ID muss positiv sein.");

export const PlayerTokenSchema = z
  .string()
  .trim()
  .min(8, "Spieler-Token fehlt oder ist zu kurz.")
  .max(120, "Spieler-Token ist zu lang.");

export const PlayerRoleSchema = z.enum(PLAYER_ROLES, {
  error: "Ungueltige Spielerrolle.",
});

export const QuestionAnswerSchema = z.enum(QUESTION_ANSWERS, {
  error: "Ungueltige Antwort.",
});

export const QuestionTextSchema = z
  .string()
  .trim()
  .min(3, "Die Frage ist zu kurz.")
  .max(240, "Die Frage darf maximal 240 Zeichen lang sein.");

export const AskQuestionFormSchema = z.object({
  text: QuestionTextSchema,
});

export const CreateGameSchema = z.object({
  setId: IdSchema,
});

export const JoinGameSchema = z.object({
  gameId: IdSchema,
  role: PlayerRoleSchema,
  playerToken: PlayerTokenSchema,
});

export const AskQuestionSchema = z.object({
  gameId: IdSchema,
  playerToken: PlayerTokenSchema,
  text: QuestionTextSchema,
});

export const AnswerQuestionSchema = z.object({
  gameId: IdSchema,
  playerToken: PlayerTokenSchema,
  answer: QuestionAnswerSchema,
});

export const SetCardExcludedSchema = z.object({
  gameId: IdSchema,
  playerToken: PlayerTokenSchema,
  cardId: IdSchema,
  excluded: z.boolean({
    error: "Ausschlussstatus ist ungueltig.",
  }),
});

export const GuessCardSchema = z.object({
  gameId: IdSchema,
  playerToken: PlayerTokenSchema,
  cardId: IdSchema,
});

export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type JoinGameInput = z.infer<typeof JoinGameSchema>;
export type AskQuestionFormInput = z.infer<typeof AskQuestionFormSchema>;
export type AskQuestionInput = z.infer<typeof AskQuestionSchema>;
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionSchema>;
export type SetCardExcludedInput = z.infer<typeof SetCardExcludedSchema>;
export type GuessCardInput = z.infer<typeof GuessCardSchema>;

export function getZodErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Eingabe ist ungueltig.";
}

export function getValidationErrorMessage(result: { success: false; error: z.ZodError }) {
  return getZodErrorMessage(result.error);
}
