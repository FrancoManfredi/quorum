import type { Messages } from '../messages.ts'
import { isOne } from '../plural.ts'

export const inspectorLog: Messages['inspectorLog'] = {
  partitions: 'Particiones',
  keyed: 'Con clave',
  roundRobin: 'Round robin',
  oneKeyKeepsAnEntityIn:
    'Una clave mantiene una entidad en una partición, así sus eventos conservan el orden. Una clave caliente llena una partición y la ralentiza.',
  eventsSpreadEvenlyAndOrderIs:
    'Los eventos se reparten por igual y el orden se pierde: una escritura reemplazada puede llegar después de la que la sustituyó.',
  aConsumerGroupReadsOneConsumer: (p0: string | number | null) =>
    `Un grupo de consumidores lee un consumidor por partición, así que este flujo entrega como máximo ${p0}/s.`,
  durability: 'Durabilidad',
  retention: 'Retención',
  messagesStayAfterTheyAreRead:
    'Los mensajes permanecen después de leerse, así que un consumidor puede reproducirlos en un índice nuevo o en un segundo Worker sin tocar la base de datos. Un consumidor que va más atrás que la ventana pierde los eventos más antiguos.',
  inbound: 'Entrada',
  s: (p0: string | number | null) => `${p0}/s`,
  lag: 'Retraso',
  behind: 'Por detrás',
  caughtUp: 'al día',
  s2: (p0: string | number | null) => `${p0} s`,
  replicas: 'Réplicas',
  burn: 'Gasto',
  aProducerWaitsForTheAppend: (multiple: string | number) =>
    `Un productor espera ${multiple}× el append de 5 ms. Cada réplica a partir de la primera cuesta medio gasto de broker más.`,
  replicaCount: (count: number) => `${count} ${isOne('es', count) ? 'réplica' : 'réplicas'}`,
  oneReplicaHoldsTheOnlyCopy:
    'Una réplica guarda la única copia: un broker que falla se lleva todos los eventos que tenía.',
  aBrokerThatFailsLoses: (share: string | number) =>
    `Un broker que falla pierde el ${share}% de los eventos que tenía: los que sus réplicas no habían copiado.`,
  everyReplicaHadEveryEvent:
    'Cada réplica tenía todos los eventos confirmados, así que un broker que falla no pierde ninguno.',
  events: (count: string | number) => `${count} eventos`,
  replicasAndAcks: (replicas: string | number, acks: string) => `${replicas} · acks ${acks}`,
}
