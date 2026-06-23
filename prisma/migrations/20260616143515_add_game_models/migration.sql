-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'SETUP',
    "currentTurn" TEXT NOT NULL DEFAULT 'PLAYER_1',
    "player1Token" TEXT,
    "player2Token" TEXT,
    "player1TargetCardId" INTEGER,
    "player2TargetCardId" INTEGER,
    "finalGuessBy" TEXT,
    "finalGuessCardId" INTEGER,
    "winnerRole" TEXT,
    "loserRole" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "setId" INTEGER NOT NULL,
    CONSTRAINT "Game_player1TargetCardId_fkey" FOREIGN KEY ("player1TargetCardId") REFERENCES "Card" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_player2TargetCardId_fkey" FOREIGN KEY ("player2TargetCardId") REFERENCES "Card" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_finalGuessCardId_fkey" FOREIGN KEY ("finalGuessCardId") REFERENCES "Card" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "askingPlayer" TEXT NOT NULL,
    "answer" TEXT,
    "answeredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "Question_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardMark" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerRole" TEXT NOT NULL,
    "excluded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "gameId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    CONSTRAINT "CardMark_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CardMark_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Game_setId_idx" ON "Game"("setId");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- CreateIndex
CREATE INDEX "Question_gameId_idx" ON "Question"("gameId");

-- CreateIndex
CREATE INDEX "Question_gameId_askingPlayer_idx" ON "Question"("gameId", "askingPlayer");

-- CreateIndex
CREATE INDEX "CardMark_cardId_idx" ON "CardMark"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "CardMark_gameId_playerRole_cardId_key" ON "CardMark"("gameId", "playerRole", "cardId");
