export const inspectorCdc = {
  changeStream: 'Change stream',
  itReadsEveryWriteOffThe:
    'It reads every write off the Database’s write log and publishes it to the Stream, so the Search Engine or the Warehouse follows the Database without the app writing twice.',
  linkADatabaseIntoItAnd:
    'Link a Database into it, and it into an Event Stream, before it carries anything.',
  readingPublishingTo: (p0: string | number | null, p1: string | number | null) =>
    `Reading ${p0}, publishing to ${p1}.`,
  itAddsLagAConsumerReads:
    'It adds lag: a consumer reads the Stream at its own pace, so a search result or a report is behind by the Stream’s lag. Order holds only inside a partition, and the Stream’s key decides that.',
  notBuiltTheDualWriteInconsistency:
    'Not built: the dual-write inconsistency it removes, since the build never writes twice.',
  changes: 'Changes',
  s: (p0: string | number | null) => `${p0}/s`,
  load: 'Load',
  ofS: (p0: string | number | null, p1: string | number | null) => `${p0} of ${p1}/s`,
  idle: 'idle',
  lag: 'Lag',
  caughtUp: 'caught up',
  sBehind: (p0: string | number | null) => `${p0} s behind`,
  noStream: 'no stream',
  published: 'Published',
  latency: 'Latency',
  burn: 'Burn',
}
