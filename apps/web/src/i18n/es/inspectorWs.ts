import type { Messages } from '../messages.ts'

export const inspectorWs: Messages['inspectorWs'] = {
  runtime: 'Runtime',
  holdsNoConnectionsPickARuntime: (p0: string | number | null) =>
    `${p0} no mantiene conexiones. Elige un runtime que sí lo haga.`,
  holdsAboutConnections: (p0: string | number | null) => `Mantiene unas ${p0} conexiones.`,
  clients: 'Clientes',
  noPresence: 'Sin presencia',
  presence: 'Presencia',
  reconnectAtOnce: 'Reconectar al instante',
  backoffWithJitter: 'Backoff con jitter',
  oneBox: 'Una máquina',
  clustered: 'En clúster',
  boxesShareAPubSubBackbone:
    'Las máquinas comparten una red troncal pub/sub, así que cada paso de tamaño añade capacidad.',
  oneBoxTakesEveryConnectionLarger:
    'Una sola máquina recibe todas las conexiones: los tamaños mayores añaden gasto y ninguna capacidad.',
  connections: 'Conexiones',
  messages: 'Mensajes',
  s: (p0: string | number | null) => `${p0}/s`,
  latency: 'Latencia',
  dropped: 'Descartados',
  burn: 'Gasto',
}
