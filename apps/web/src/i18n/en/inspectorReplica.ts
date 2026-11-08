export const inspectorReplica = {
  replication: 'Replication',
  asynchronous: 'Asynchronous',
  synchronous: 'Synchronous',
  runsThePrimaryEngine: "Runs the primary's engine.",
  noWriteCostAndTheReplica:
    'No write cost, and the replica lags: a read after a write can be stale.',
  everyWriteWaits: (wait: string | number) =>
    `Every write waits ${wait} for this replica, more across zones and regions. It serves no stale read, and writes stall while it is down.`,
}
