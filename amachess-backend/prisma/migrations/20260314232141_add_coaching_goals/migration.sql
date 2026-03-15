-- AlterTable
ALTER TABLE "users" ADD COLUMN "chessGoal" TEXT;
ALTER TABLE "users" ADD COLUMN "focusAreas" TEXT;
ALTER TABLE "users" ADD COLUMN "targetRating" INTEGER;

-- CreateTable
CREATE TABLE "coaching_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "winRate" REAL NOT NULL,
    "averageRating" INTEGER NOT NULL,
    "totalBlunders" INTEGER NOT NULL,
    "totalMistakes" INTEGER NOT NULL,
    "accuracy" REAL,
    "gamesAnalyzed" INTEGER NOT NULL,
    "insightText" TEXT NOT NULL,
    "themes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coaching_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "coaching_snapshots_userId_createdAt_idx" ON "coaching_snapshots"("userId", "createdAt");
