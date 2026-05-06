ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS announcement_active    boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS announcement_title_de  text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS announcement_title_en  text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS announcement_body_de   text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS announcement_body_en   text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS announcement_starts_at date    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS announcement_ends_at   date    DEFAULT NULL;
