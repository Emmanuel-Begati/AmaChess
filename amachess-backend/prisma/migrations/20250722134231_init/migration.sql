-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lichessUsername" TEXT,
    "chesscomUsername" TEXT,
    "country" TEXT,
    "fideRating" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "originalFileName" TEXT,
    "content" TEXT NOT NULL,
    "totalPages" INTEGER NOT NULL DEFAULT 0,
    "currentPage" INTEGER NOT NULL DEFAULT 0,
    "currentChapter" INTEGER NOT NULL DEFAULT 0,
    "readingProgress" REAL NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "diagramMap" TEXT,
    "pdfPath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processed',
    "type" TEXT NOT NULL DEFAULT 'PDF',
    "userId" TEXT NOT NULL,
    "lastReadAt" DATETIME,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "books_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "puzzles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lichessId" TEXT NOT NULL,
    "fen" TEXT NOT NULL,
    "moves" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "ratingDeviation" INTEGER NOT NULL DEFAULT 0,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "nbPlays" INTEGER NOT NULL DEFAULT 0,
    "themes" TEXT NOT NULL,
    "gameUrl" TEXT,
    "openingTags" TEXT,
    "sideToMove" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "description" TEXT,
    "hint" TEXT,
    "pgn" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "puzzle_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "movesPlayed" TEXT NOT NULL,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "solutionShown" BOOLEAN NOT NULL DEFAULT false,
    "accuracy" REAL,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "puzzle_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "puzzle_attempts_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "puzzles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "puzzle_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "totalPuzzles" INTEGER NOT NULL DEFAULT 0,
    "puzzlesSolved" INTEGER NOT NULL DEFAULT 0,
    "totalTime" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL,
    "accuracy" REAL,
    "themes" TEXT NOT NULL,
    "difficulty" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "puzzle_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalPuzzlesSolved" INTEGER NOT NULL DEFAULT 0,
    "currentPuzzleRating" INTEGER NOT NULL DEFAULT 1500,
    "bestPuzzleRating" INTEGER NOT NULL DEFAULT 1500,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "averageAccuracy" REAL NOT NULL DEFAULT 0.0,
    "averageTimePerPuzzle" REAL NOT NULL DEFAULT 0.0,
    "favoriteThemes" TEXT NOT NULL,
    "weeklyGoal" INTEGER NOT NULL DEFAULT 10,
    "weeklyProgress" INTEGER NOT NULL DEFAULT 0,
    "monthlyGoal" INTEGER NOT NULL DEFAULT 50,
    "monthlyProgress" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "puzzles_lichessId_key" ON "puzzles"("lichessId");

-- CreateIndex
CREATE INDEX "puzzles_rating_idx" ON "puzzles"("rating");

-- CreateIndex
CREATE INDEX "puzzles_themes_idx" ON "puzzles"("themes");

-- CreateIndex
CREATE INDEX "puzzles_difficulty_idx" ON "puzzles"("difficulty");

-- CreateIndex
CREATE INDEX "puzzles_lichessId_idx" ON "puzzles"("lichessId");

-- CreateIndex
CREATE INDEX "puzzle_attempts_userId_idx" ON "puzzle_attempts"("userId");

-- CreateIndex
CREATE INDEX "puzzle_attempts_puzzleId_idx" ON "puzzle_attempts"("puzzleId");

-- CreateIndex
CREATE INDEX "puzzle_attempts_isCompleted_idx" ON "puzzle_attempts"("isCompleted");

-- CreateIndex
CREATE INDEX "puzzle_attempts_createdAt_idx" ON "puzzle_attempts"("createdAt");

-- CreateIndex
CREATE INDEX "puzzle_sessions_userId_idx" ON "puzzle_sessions"("userId");

-- CreateIndex
CREATE INDEX "puzzle_sessions_sessionType_idx" ON "puzzle_sessions"("sessionType");

-- CreateIndex
CREATE INDEX "puzzle_sessions_createdAt_idx" ON "puzzle_sessions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_userId_key" ON "user_stats"("userId");
