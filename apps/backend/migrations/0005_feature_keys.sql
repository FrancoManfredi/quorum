-- Feature keys: the whitelist that gates server features while the game has no accounts.
-- A key is a bearer secret, so the table holds its SHA-256 hash and a copy of the database
-- opens nothing. `scripts/feature-key.ts` prints the row to insert.
CREATE TABLE feature_keys (
  key_hash TEXT NOT NULL PRIMARY KEY,
  -- The feature ids the key unlocks, comma-separated. A build ignores ids it does not know.
  features TEXT NOT NULL,
  -- Who the key was made for, for an operator reading the table.
  note TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  -- When the key stops working, or NULL for no end.
  expires_at INTEGER,
  -- When an operator turned the key off, or NULL while it works.
  revoked_at INTEGER
);
