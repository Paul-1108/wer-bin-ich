import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { getZodErrorMessage } from "@/lib/game/schemas";
import type { ActionResult } from "@/lib/game/types";

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail<T>(error: unknown): ActionResult<T> {
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

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function revalidateGame(gameId: number) {
  revalidatePath("/");
  revalidatePath(`/game/${gameId}`);
}
