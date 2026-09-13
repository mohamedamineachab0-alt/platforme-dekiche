-- Weekly Zoom schedule templates
CREATE TABLE IF NOT EXISTS "LiveSession" (
  "id" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "dayOfWeek" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "zoomLink" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LiveSession_level_dayOfWeek_idx"
  ON "LiveSession"("level", "dayOfWeek");

CREATE INDEX IF NOT EXISTS "LiveSession_dayOfWeek_startTime_idx"
  ON "LiveSession"("dayOfWeek", "startTime");

-- App uses Prisma (service role / direct URL); table is schedule catalog, not per-user rows.
ALTER TABLE "LiveSession" ENABLE ROW LEVEL SECURITY;
