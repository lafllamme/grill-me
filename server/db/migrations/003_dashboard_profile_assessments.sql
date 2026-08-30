-- Dashboard Profile Assessment v1.0
-- Additive migration: existing roast and leaderboard tables remain unchanged.
CREATE TABLE IF NOT EXISTS dashboard_profile_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL UNIQUE REFERENCES roast_runs(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  assessment_version TEXT NOT NULL,
  scoring_version TEXT NOT NULL,
  axes_json JSONB NOT NULL,
  derived_metrics_json JSONB NOT NULL,
  evidence_window_json JSONB NOT NULL,
  overall_score NUMERIC(5,2) NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  grade TEXT NOT NULL CHECK (grade IN ('F', 'E-', 'E', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A')),
  primary_role TEXT NOT NULL,
  secondary_roles_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence NUMERIC(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  ai_assessment_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dashboard_profile_assessments_username_idx
  ON dashboard_profile_assessments (username, created_at DESC);

CREATE INDEX IF NOT EXISTS dashboard_profile_assessments_role_idx
  ON dashboard_profile_assessments (primary_role, created_at DESC);

CREATE INDEX IF NOT EXISTS dashboard_profile_assessments_score_idx
  ON dashboard_profile_assessments (overall_score DESC);
