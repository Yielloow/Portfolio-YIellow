-- ══════════════════════════════════════════
-- PORTFOLIO FMC — Supabase Schema
-- Copiez-collez ceci dans l'éditeur SQL de Supabase
-- ══════════════════════════════════════════

-- ── Themes ──────────────────────────────
CREATE TABLE IF NOT EXISTS themes (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        TEXT    NOT NULL UNIQUE,
  icon        TEXT,
  title_fr    TEXT    NOT NULL,
  title_en    TEXT,
  hours       INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Activities ──────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id             UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id       UUID    REFERENCES themes(id) ON DELETE SET NULL,
  type           TEXT,          -- formation | hackathon | conference | visite | jobday | projet | salon
  title_fr       TEXT    NOT NULL,
  title_en       TEXT,
  hours          INTEGER DEFAULT 0,
  date           DATE,
  reflection_fr  TEXT,          -- analyse réflexive FR (min 1 page selon consignes)
  reflection_en  TEXT,
  proof_url      TEXT,
  order_index    INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Skills ──────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT    NOT NULL,
  level       INTEGER DEFAULT 0 CHECK (level BETWEEN 0 AND 100),
  category    TEXT,
  order_index INTEGER DEFAULT 0
);

-- ── Timeline ────────────────────────────
CREATE TABLE IF NOT EXISTS timeline_items (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  year        TEXT    NOT NULL,
  title_fr    TEXT    NOT NULL,
  title_en    TEXT,
  desc_fr     TEXT,
  desc_en     TEXT,
  type        TEXT    DEFAULT 'education',  -- education | work | project | future
  order_index INTEGER DEFAULT 0
);

-- ── Profile (single row) ────────────────
CREATE TABLE IF NOT EXISTS profile (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  bio_fr        TEXT,
  bio_en        TEXT,
  project_fr    TEXT,
  project_en    TEXT,
  strengths_fr  TEXT[],
  weaknesses_fr TEXT[],
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO profile (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Lecture publique, écriture authentifiée uniquement
-- ══════════════════════════════════════════

ALTER TABLE themes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills         ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile        ENABLE ROW LEVEL SECURITY;

-- Lecture publique (portfolio visible sans authentification)
CREATE POLICY "public_read_themes"     ON themes         FOR SELECT USING (true);
CREATE POLICY "public_read_activities" ON activities     FOR SELECT USING (true);
CREATE POLICY "public_read_skills"     ON skills         FOR SELECT USING (true);
CREATE POLICY "public_read_timeline"   ON timeline_items FOR SELECT USING (true);
CREATE POLICY "public_read_profile"    ON profile        FOR SELECT USING (true);

-- Écriture uniquement pour l'utilisateur authentifié
CREATE POLICY "auth_write_themes"     ON themes         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_activities" ON activities     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_skills"     ON skills         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_timeline"   ON timeline_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_profile"    ON profile        FOR ALL USING (auth.role() = 'authenticated');

-- ══════════════════════════════════════════
-- STORAGE — bucket pour les CVs
-- ══════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('cv', 'cv', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "public_read_cv" ON storage.objects
  FOR SELECT USING (bucket_id = 'cv');

CREATE POLICY "auth_upload_cv" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cv' AND auth.role() = 'authenticated');

CREATE POLICY "auth_update_cv" ON storage.objects
  FOR UPDATE USING (bucket_id = 'cv' AND auth.role() = 'authenticated');
