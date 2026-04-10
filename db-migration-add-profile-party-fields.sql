-- Добавляет поля профиля пользователя и поля пати для минималки.
-- Безопасно для уже существующих строк: NOT NULL ставим только там, где есть дефолт.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT ARRAY[]::text[];

ALTER TABLE "Party"
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS keywords text[] NOT NULL DEFAULT ARRAY[]::text[];

-- На случай если колонка уже существовала, но была NULL.
UPDATE "User" SET interests = ARRAY[]::text[] WHERE interests IS NULL;
UPDATE "Party" SET keywords = ARRAY[]::text[] WHERE keywords IS NULL;

-- Если раньше использовали coordinates, переименуем в address.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Party' AND column_name = 'coordinates'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Party' AND column_name = 'address'
  ) THEN
    EXECUTE 'ALTER TABLE "Party" RENAME COLUMN coordinates TO address';
  END IF;
END $$;
