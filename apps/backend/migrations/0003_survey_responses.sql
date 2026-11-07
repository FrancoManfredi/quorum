-- The Exit survey: two answers and the Exit they describe. One row per device and Exit.
CREATE TABLE survey_responses (
  device_id TEXT NOT NULL,
  exit_key TEXT NOT NULL,
  exit_id TEXT NOT NULL,
  stage INTEGER NOT NULL,
  sim_seconds REAL NOT NULL,
  peak_users REAL NOT NULL,
  payout REAL NOT NULL,
  legacy REAL NOT NULL,
  venture TEXT NOT NULL,
  mutators TEXT NOT NULL,
  issues TEXT NOT NULL,
  likes TEXT NOT NULL,
  locale TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (device_id, exit_key)
);
