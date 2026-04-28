-- Neue Tabelle für wiederkehrende Events (z.B. Stammtisch)
-- "n-ter Wochentag im Monat"-Muster via day_of_week + week_of_month
-- Bestehende Tabellen und Daten bleiben unverändert.

CREATE TABLE public.recurring_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category      event_category NOT NULL DEFAULT 'social',
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  week_of_month SMALLINT NOT NULL CHECK (week_of_month BETWEEN 1 AND 5),
  time_label    TEXT NOT NULL,
  place         JSONB NOT NULL,
  title         JSONB NOT NULL,
  description   JSONB NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
