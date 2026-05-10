-- ══════════════════════════════════════════
-- MIGRATION v2 — CV URLs + section order
-- Exécutez ceci dans Supabase > SQL Editor
-- ══════════════════════════════════════════

ALTER TABLE profile ADD COLUMN IF NOT EXISTS cv_fr_url TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS cv_en_url TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS section_order TEXT[]
  DEFAULT ARRAY['about','projet','competences','activites','parcours','cv'];
