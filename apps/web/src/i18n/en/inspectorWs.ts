export const inspectorWs = {
  runtime: 'Runtime',
  holdsNoConnectionsPickARuntime: (p0: string | number | null) =>
    `${p0} holds no connections. Pick a runtime that does.`,
  holdsAboutConnections: (p0: string | number | null) => `Holds about ${p0} connections.`,
  clients: 'Clients',
  noPresence: 'No presence',
  presence: 'Presence',
  reconnectAtOnce: 'Reconnect at once',
  backoffWithJitter: 'Backoff with jitter',
  oneBox: 'One box',
  clustered: 'Clustered',
  boxesShareAPubSubBackbone: 'Boxes share a pub/sub backbone, so every size step adds room.',
  oneBoxTakesEveryConnectionLarger:
    'One box takes every connection: larger sizes add Burn and no room.',
  connections: 'Connections',
  messages: 'Messages',
  s: (p0: string | number | null) => `${p0}/s`,
  latency: 'Latency',
  dropped: 'Dropped',
  burn: 'Burn',
}
