-- Переименовывает поле coordinates -> address (если ещё не переименовано).

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

