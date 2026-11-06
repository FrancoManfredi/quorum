export const inspectorLog = {
  partitions: 'Partitions',
  keyed: 'Keyed',
  roundRobin: 'Round robin',
  oneKeyKeepsAnEntityIn:
    'One key keeps an entity in one partition, so its events stay in order. A hot key fills a partition and slows it.',
  eventsSpreadEvenlyAndOrderIs:
    'Events spread evenly, and order is lost: a superseded write can land after the one that replaced it.',
  aConsumerGroupReadsOneConsumer: (p0: string | number | null) =>
    `A consumer group reads one consumer per partition, so this stream hands on at most ${p0}/s.`,
  durability: 'Durability',
  retention: 'Retention',
  messagesStayAfterTheyAreRead:
    'Messages stay after they are read, so a consumer can replay them into a new index or a second Worker without touching the Database. A consumer further behind than the window loses the oldest events.',
  inbound: 'Inbound',
  s: (p0: string | number | null) => `${p0}/s`,
  lag: 'Lag',
  behind: 'Behind',
  caughtUp: 'caught up',
  s2: (p0: string | number | null) => `${p0} s`,
  replicas: 'Replicas',
  burn: 'Burn',
  aProducerWaitsForTheAppend: (multiple: string | number) =>
    `A producer waits ${multiple}× the 5 ms append. A replica past the first bills half a broker's Burn again.`,
  replicaCount: (count: number) => `${count} ${count === 1 ? 'replica' : 'replicas'}`,
  oneReplicaHoldsTheOnlyCopy:
    'One replica holds the only copy: a broker that fails takes every event it held.',
  aBrokerThatFailsLoses: (share: string | number) =>
    `A broker that fails loses ${share}% of the events it held: the ones its replicas had not copied.`,
  everyReplicaHadEveryEvent:
    'Every replica had every acknowledged event, so a broker that fails loses none.',
  events: (count: string | number) => `${count} events`,
  replicasAndAcks: (replicas: string | number, acks: string) => `${replicas} · acks ${acks}`,
}
