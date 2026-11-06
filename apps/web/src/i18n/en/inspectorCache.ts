export const inspectorCache = {
  cache: 'Cache',
  aWriteReturnsFromTheCache:
    'A write returns from the Cache and reaches the Database late. A crash loses what has not flushed.',
  everyWriteGoesToTheCache:
    'Every write goes to the Cache and the Database together: fresher, and a write longer.',
  readsComeFromTheCacheWrites:
    'Reads come from the Cache, writes go around it. A miss can store an old row until the TTL.',
  everyMiss: 'Every miss',
  coalesce: 'Coalesce',
  expireOnTheTTL: 'Expire on the TTL',
  refreshEarly: 'Refresh early',
  missOnExpiry: 'Miss on expiry',
  staleWhileRevalidating: 'Stale while revalidating',
  coldStart: 'Cold start',
  warmStart: 'Warm start',
}
