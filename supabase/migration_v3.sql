-- ══════════════════════════════════════════
-- MIGRATION v3 — is_featured sur activités
-- Exécutez ceci dans Supabase > SQL Editor
-- ══════════════════════════════════════════

ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Une seule activité peut être featured à la fois (contrainte optionnelle)
-- CREATE UNIQUE INDEX IF NOT EXISTS unique_featured ON activities (is_featured) WHERE is_featured = TRUE;
