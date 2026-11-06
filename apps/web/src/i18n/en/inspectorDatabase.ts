export const inspectorDatabase = {
  volume: 'Volume',
  iOPSAtTheBoxSBurn: (p0: string | number | null, p1: string | number | null) =>
    `${p0} IOPS at ${p1}× the box's Burn. Reads that miss the buffer cache and every write wait on it.`,
  shards: 'Shards',
  onePrimaryAReadReplicaIs: 'One primary: a Read Replica is what takes the reads off it.',
  shardKey: 'Shard key',
  reports: 'Reports',
  scanTheTable: 'Scan the table',
  materializedView: 'Materialized view',
  halfTheScanCPUAndThe: 'Half the scan CPU, and the figures are as old as the last refresh.',
  everyReportScansTheTableItself:
    'Every report scans the table itself. Research Materialized views to store one.',
  retention: 'Retention',
  oldRowsMoveToCheapStorage:
    'Old rows move to cheap storage: the bill falls, and a report waits on the restore.',
  oldRowsAreGoneTheBill:
    'Old rows are gone: the bill falls, and a report rebuilds its figures at three times the scan.',
  everyRowStaysOnTheFast: 'Every row stays on the fast tier and bills for it.',
  backups: 'Backups',
  noBackupALostTableIs: 'No backup: a lost table is lost for good.',
  aRestoreFailedThisBackupWould:
    'A restore failed: this backup would lose everything. Drill it again.',
  thisBackupRestoresDrillItAgain:
    'This backup restores. Drill it again after a change, or research Restore drills.',
  restoreDrillDH: (p0: string | number | null) => `Restore drill · ${p0} DH`,
}
