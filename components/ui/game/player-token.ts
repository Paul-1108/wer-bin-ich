"use client";

import { PLAYER_TOKEN_KEY } from "@/lib/game/player-token";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function createPlayerToken() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function writeCookie(token: string) {
  document.cookie = `${PLAYER_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function getStoredPlayerToken() {
  const existingToken = window.localStorage.getItem(PLAYER_TOKEN_KEY);

  if (existingToken) {
    writeCookie(existingToken);
    return existingToken;
  }

  const token = createPlayerToken();
  window.localStorage.setItem(PLAYER_TOKEN_KEY, token);
  writeCookie(token);

  return token;
}
