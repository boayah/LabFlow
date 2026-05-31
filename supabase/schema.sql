-- LabFlow QA - Database Schema
-- Run this in the Supabase SQL editor to set up your project.

-- Samples
CREATE TABLE IF NOT EXISTS samples (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id         TEXT UNIQUE NOT NULL,
  sample_type       TEXT NOT NULL,
  source            TEXT NOT NULL,
  storage_condition TEXT NOT NULL,
  received_date     DATE NOT NULL,
  owner             TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'received',
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT samples_type_check   CHECK (sample_type IN ('cell-culture','tissue','blood-derived','reagent')),
  CONSTRAINT samples_status_check CHECK (status IN ('received','in-processing','used','in-review','flagged','completed','archived','on-hold'))
);

-- Experiment runs
CREATE TABLE IF NOT EXISTS experiment_runs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id            TEXT UNIQUE NOT NULL,
  protocol_name     TEXT NOT NULL,
  operator          TEXT NOT NULL,
  date              DATE NOT NULL,
  linked_sample_ids TEXT[] NOT NULL DEFAULT '{}',
  equipment_used    TEXT NOT NULL,
  reagent_lot       TEXT,
  run_status        TEXT NOT NULL DEFAULT 'pending',
  qc_outcome        TEXT,
  observations      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT runs_status_check CHECK (run_status IN ('pending','in-progress','completed','failed','cancelled')),
  CONSTRAINT runs_qc_check     CHECK (qc_outcome IS NULL OR qc_outcome IN ('pass','fail','conditional-pass','pending'))
);

-- Deviations
CREATE TABLE IF NOT EXISTS deviations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deviation_id      TEXT UNIQUE NOT NULL,
  severity          TEXT NOT NULL,
  category          TEXT NOT NULL,
  description       TEXT NOT NULL,
  immediate_action  TEXT,
  corrective_action TEXT,
  owner             TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'open',
  opened_date       DATE NOT NULL,
  closed_date       DATE,
  linked_sample_id  TEXT,
  linked_run_id     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dev_severity_check CHECK (severity IN ('low','medium','high','critical')),
  CONSTRAINT dev_category_check CHECK (category IN ('equipment','protocol','environmental','sample','reagent')),
  CONSTRAINT dev_status_check   CHECK (status IN ('open','in-review','resolved'))
);

-- Audit events (append-only)
CREATE TABLE IF NOT EXISTS audit_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp      TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_name      TEXT NOT NULL,
  action         TEXT NOT NULL,
  entity_type    TEXT NOT NULL,
  entity_id      TEXT NOT NULL,
  change_summary TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT audit_entity_type_check CHECK (entity_type IN ('sample','experiment_run','deviation'))
);

-- Auto-update updated_at on write
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER samples_updated_at
  BEFORE UPDATE ON samples
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER experiment_runs_updated_at
  BEFORE UPDATE ON experiment_runs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER deviations_updated_at
  BEFORE UPDATE ON deviations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Row Level Security
-- These are open policies for demo use.
-- In production: tie policies to auth.uid() and user roles.
ALTER TABLE samples         ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deviations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_samples_open"         ON samples         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_runs_open"            ON experiment_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_deviations_open"      ON deviations      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_audit_events_open"    ON audit_events    FOR ALL USING (true) WITH CHECK (true);
