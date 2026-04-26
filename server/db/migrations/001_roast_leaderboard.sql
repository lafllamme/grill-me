-- Roast Leaderboard v1.1 baseline schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS roast_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_roasted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS roast_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES roast_users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('sync', 'stream')),
  roast_intensity SMALLINT NOT NULL CHECK (roast_intensity BETWEEN 1 AND 4),
  commit_count INTEGER NOT NULL DEFAULT 0,
  selected_commit_count INTEGER NOT NULL DEFAULT 0,
  pr_count INTEGER NOT NULL DEFAULT 0,
  model TEXT,
  prompt_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roast_run_content (
  run_id UUID PRIMARY KEY REFERENCES roast_runs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  roast_lines JSONB NOT NULL,
  feedback JSONB NOT NULL,
  roast_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS roast_run_metrics (
  run_id UUID PRIMARY KEY REFERENCES roast_runs(id) ON DELETE CASCADE,
  spaghetti_index NUMERIC(5,2) NOT NULL CHECK (spaghetti_index BETWEEN 0 AND 100),
  stink_score NUMERIC(5,2) NOT NULL CHECK (stink_score BETWEEN 0 AND 100),
  ego_damage NUMERIC(5,2) NOT NULL CHECK (ego_damage BETWEEN 0 AND 100),
  grade TEXT NOT NULL CHECK (grade IN ('F-', 'F', 'D-', 'D', 'C-', 'C', 'B', 'A')),
  special_title TEXT NOT NULL,
  metric_version TEXT NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roast_user_stats (
  user_id BIGINT PRIMARY KEY REFERENCES roast_users(id) ON DELETE CASCADE,
  runs_count INTEGER NOT NULL DEFAULT 0,
  avg_stink_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_ego_damage NUMERIC(5,2) NOT NULL DEFAULT 0,
  worst_grade TEXT NOT NULL DEFAULT 'A' CHECK (worst_grade IN ('F-', 'F', 'D-', 'D', 'C-', 'C', 'B', 'A')),
  latest_run_id UUID REFERENCES roast_runs(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roast_scoring_profiles (
  id BIGSERIAL PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  weights_json JSONB NOT NULL,
  thresholds_json JSONB NOT NULL,
  titles_json JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS roast_scoring_profiles_active_idx
  ON roast_scoring_profiles ((is_active))
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS roast_users_username_idx ON roast_users (username);
CREATE INDEX IF NOT EXISTS roast_runs_created_at_idx ON roast_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS roast_runs_user_created_at_idx ON roast_runs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS roast_run_metrics_rank_idx ON roast_run_metrics (stink_score DESC, ego_damage DESC);
CREATE INDEX IF NOT EXISTS roast_user_stats_rank_idx ON roast_user_stats (worst_grade, avg_stink_score DESC);
