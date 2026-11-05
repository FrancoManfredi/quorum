-- The Simulation's version is a git hash now, not a number. Results of the old versions are never compared again.
DROP TABLE results;
CREATE TABLE results (
  challenge_id TEXT NOT NULL,
  sim_version TEXT NOT NULL,
  device_id TEXT NOT NULL,
  cost REAL NOT NULL,
  tail REAL NOT NULL,
  complexity INTEGER NOT NULL,
  cost_replay TEXT NOT NULL,
  tail_replay TEXT NOT NULL,
  complexity_replay TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (challenge_id, sim_version, device_id)
);
