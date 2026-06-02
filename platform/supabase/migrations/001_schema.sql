-- ═══════════════════════════════════════════════════════════
--  Connect Provedor — Schema Completo
--  Execute este arquivo no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── SITE CONFIG ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_config (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT,
  label       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'text',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_config (key, label, type, value) VALUES
  ('site_name',   'Nome do Site',    'text',  'Connect Provedor'),
  ('site_desc',   'Descrição',       'text',  'Internet fibra óptica rápida em Porto-PI'),
  ('logo_url',    'Logo',            'image', ''),
  ('favicon_url', 'Favicon',         'image', ''),
  ('phone',       'Telefone',        'phone', '(86) 9 8866-5182'),
  ('whatsapp',    'WhatsApp',        'phone', '5586988665182'),
  ('email',       'E-mail',          'email', ''),
  ('address',     'Endereço',        'text',  'Porto-PI'),
  ('facebook',    'Facebook URL',    'url',   ''),
  ('instagram',   'Instagram URL',   'url',   ''),
  ('youtube',     'YouTube URL',     'url',   ''),
  ('tiktok',      'TikTok URL',      'url',   '')
ON CONFLICT (key) DO NOTHING;

-- ── INTEGRATIONS (Analytics / Pixels) ───────────────────────
CREATE TABLE IF NOT EXISTS integrations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type             TEXT NOT NULL,
  name             TEXT NOT NULL,
  value            TEXT,
  secondary_value  TEXT,
  active           BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO integrations (type, name, value, secondary_value, active) VALUES
  ('meta_pixel',  'Meta Pixel',          '965565039421014', NULL,          true),
  ('google_ads',  'Google Ads',          '18179908366',     'AW-XXXXXXXX', true),
  ('ga4',         'Google Analytics 4',  'G-8JGM18EG3V',   NULL,          true),
  ('gtm',         'Google Tag Manager',  'GTM-KZWSCQJ8',   NULL,          true)
ON CONFLICT DO NOTHING;

-- ── CAMPAIGNS (Datas Comemorativas) ─────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  color       TEXT DEFAULT '#f59e0b',
  bg_color    TEXT DEFAULT '#fffbeb',
  text_color  TEXT DEFAULT '#92400e',
  active      BOOLEAN DEFAULT false,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO campaigns (slug, name, emoji, color, bg_color, text_color) VALUES
  ('promocoes-mes',  'Promoções do Mês',   '🎉', '#f59e0b', '#fffbeb', '#92400e'),
  ('volta-aulas',    'Volta às Aulas',     '🎓', '#3b82f6', '#eff6ff', '#1e40af'),
  ('dia-maes',       'Dia das Mães',       '❤️', '#ec4899', '#fdf2f8', '#9d174d'),
  ('dia-namorados',  'Dia dos Namorados',  '💘', '#ef4444', '#fef2f2', '#991b1b'),
  ('festa-junina',   'Festa Junina',       '🌽', '#d97706', '#fef3c7', '#78350f'),
  ('dia-pais',       'Dia dos Pais',       '👔', '#0ea5e9', '#f0f9ff', '#075985'),
  ('dia-cliente',    'Dia do Cliente',     '🛍️', '#8b5cf6', '#faf5ff', '#5b21b6'),
  ('dia-criancas',   'Dia das Crianças',   '🎮', '#22c55e', '#f0fdf4', '#15803d'),
  ('black-friday',   'Black Friday',       '⚡', '#f97316', '#1c1c1c', '#ffffff'),
  ('natal',          'Natal',              '🎄', '#16a34a', '#f0fdf4', '#14532d'),
  ('ano-novo',       'Ano Novo',           '🎆', '#7c3aed', '#0f172a', '#ffffff')
ON CONFLICT (slug) DO NOTHING;

-- ── BANNERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT,
  image_url    TEXT NOT NULL,
  link_url     TEXT,
  alt_text     TEXT,
  active       BOOLEAN DEFAULT true,
  order_index  INTEGER DEFAULT 0,
  starts_at    TIMESTAMPTZ,
  ends_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── VISITORS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip          TEXT,
  city        TEXT,
  state       TEXT,
  country     TEXT DEFAULT 'BR',
  browser     TEXT,
  device      TEXT,
  os          TEXT,
  referrer    TEXT,
  page        TEXT DEFAULT '/',
  session_id  TEXT,
  visited_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON visitors(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_session    ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_ip         ON visitors(ip);

-- ── EVENTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL,
  page        TEXT,
  session_id  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_type       ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- ── LEADS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT,
  phone         TEXT,
  city          TEXT,
  plan_interest TEXT,
  source        TEXT DEFAULT 'whatsapp',
  page          TEXT,
  ip            TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ── AUDIT LOGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action      TEXT NOT NULL,
  entity      TEXT,
  entity_id   TEXT,
  old_value   JSONB,
  new_value   JSONB,
  user_email  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE site_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners       ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors      ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs    ENABLE ROW LEVEL SECURITY;

-- Leitura pública (site consome estes dados via API pública)
CREATE POLICY "public_read_campaigns"   ON campaigns   FOR SELECT USING (true);
CREATE POLICY "public_read_banners"     ON banners     FOR SELECT USING (active = true);
CREATE POLICY "public_read_config"      ON site_config FOR SELECT USING (true);
CREATE POLICY "public_read_integrations" ON integrations FOR SELECT USING (active = true);

-- Inserção pública (rastreamento anônimo)
CREATE POLICY "public_insert_visitors"  ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_events"    ON events   FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_leads"     ON leads    FOR INSERT WITH CHECK (true);

-- ── TRIGGER: updated_at automático ───────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── FUNÇÃO: só uma campanha ativa por vez ────────────────────
CREATE OR REPLACE FUNCTION deactivate_other_campaigns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.active = true THEN
    UPDATE campaigns SET active = false WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_single_active_campaign
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION deactivate_other_campaigns();
