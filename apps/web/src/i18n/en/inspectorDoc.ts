export const inspectorDoc = {
  oneDocument: 'One document',
  multiDocument: 'Multi-document',
  aCheckoutWritesSeveralDocumentsWithout:
    'A checkout writes several documents. Without multi-document transactions one can land without the others, and a retry charges the card again; with them every write waits for the rest, at half again its latency.',
  accessPatterns: 'Access patterns',
  thereAreNoJoinsAQuery: (p0: string | number | null, p1: string | number | null) =>
    `There are no joins: a query that spans documents is a scan, at ${p0}× the ops, and each new pattern a Feature needs is its own collection and index to write. A Feature that changes the data shape costs ${p1}% fewer Dev Hours, because there is no migration; the rest cost a little more.`,
  theTeamPanelChargesTheDev:
    'The Team panel charges the Dev Hours. The Database is the other side of this trade: joins and schemas, at the price of migrations.',
  inbound: 'Inbound',
  s: (p0: string | number | null) => `${p0}/s`,
  load: 'Load',
  idle: 'idle',
  joins: 'Joins',
  connections: 'Connections',
  noneToPool: 'none to pool',
  latency: 'Latency',
  burn: 'Burn',
}
