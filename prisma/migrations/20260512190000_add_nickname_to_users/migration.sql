-- Step 1: add column as nullable so backfill can run
ALTER TABLE "users" ADD COLUMN "nickname" TEXT;

-- Step 2: backfill nickname from email (part before @, sanitised) with collision-safe suffix
WITH base AS (
  SELECT
    id,
    -- take part before @, drop non-alnum/_-, lowercase, ensure 3..30 chars
    (
      CASE
        WHEN LENGTH(REGEXP_REPLACE(LOWER(SPLIT_PART(email, '@', 1)), '[^a-z0-9_-]', '', 'g')) < 3
          THEN RPAD(REGEXP_REPLACE(LOWER(SPLIT_PART(email, '@', 1)), '[^a-z0-9_-]', '', 'g'), 3, '0')
        ELSE LEFT(REGEXP_REPLACE(LOWER(SPLIT_PART(email, '@', 1)), '[^a-z0-9_-]', '', 'g'), 30)
      END
    ) AS candidate
  FROM "users"
),
numbered AS (
  SELECT
    id,
    candidate,
    ROW_NUMBER() OVER (PARTITION BY candidate ORDER BY id) AS rn
  FROM base
)
UPDATE "users" u
SET "nickname" = CASE
  WHEN n.rn = 1 THEN n.candidate
  ELSE LEFT(n.candidate, 30 - LENGTH(n.rn::text)) || n.rn::text
END
FROM numbered n
WHERE n.id = u.id;

-- Step 3: enforce NOT NULL and uniqueness
ALTER TABLE "users" ALTER COLUMN "nickname" SET NOT NULL;
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- Step 4: case-insensitive lookup helper (functional index)
CREATE UNIQUE INDEX "users_nickname_lower_key" ON "users"(LOWER("nickname"));
