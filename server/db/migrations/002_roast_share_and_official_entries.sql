-- Roast Share + Official Leaderboard tables (v1.2)

CREATE TABLE IF NOT EXISTS auth_github_users (
  id BIGSERIAL PRIMARY KEY,
  github_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roast_shares (
  token TEXT PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES roast_runs(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  roast_user_id BIGINT PRIMARY KEY REFERENCES roast_users(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES roast_runs(id) ON DELETE CASCADE,
  submitted_by_auth_user_id BIGINT NOT NULL REFERENCES auth_github_users(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS roast_shares_expires_at_idx ON roast_shares (expires_at);
CREATE INDEX IF NOT EXISTS roast_shares_run_id_idx ON roast_shares (run_id);
CREATE INDEX IF NOT EXISTS leaderboard_entries_submitted_at_idx ON leaderboard_entries (submitted_at DESC);
CREATE INDEX IF NOT EXISTS leaderboard_entries_run_id_idx ON leaderboard_entries (run_id);
CREATE INDEX IF NOT EXISTS auth_github_users_username_idx ON auth_github_users (username);
