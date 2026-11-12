---
title: Commit en dos fases
summary: El commit en dos fases hace que varias bases de datos confirmen o aborten una transacción juntas, votando primero y confirmando después, al precio de bloquearse cuando falla el coordinador.
section: patterns
group: Outside the game
order: 1008
aliases: two-phase commit, 2pc, xa, distributed transaction, atomic commit, coordinator, commit en dos fases, transacción distribuida, commit atómico, coordinador
---

El commit en dos fases (2PC) es un protocolo de confirmación atómica: un coordinador pide a cada participante que se prepare, y solo si todos votan que sí les dice que confirmen.

Recurre a él cuando una transacción debe ser todo o nada entre unas pocas bases de datos que controlas y la latencia es aceptable. Mover dinero entre dos cuentas guardadas en dos bases de datos es el caso de manual. En la fase uno el coordinador pide a ambas que se preparen, y cada una escribe el cambio en su log y vota. En la fase dos, si ambas dijeron que sí, el coordinador les dice que confirmen, y si alguna dijo que no, les dice que aborten.

Cuesta disponibilidad y velocidad. Un participante que ha votado que sí mantiene sus bloqueos hasta oír el veredicto, así que si el coordinador muere tras la votación, esperan, y nada más puede tocar esas filas. Cada transacción necesita viajes de ida y vuelta adicionales y es tan lenta como el participante más lento. Pat Helland sostuvo en 2007 que las aplicaciones grandes y escalables rara vez asumen transacciones distribuidas, porque su fragilidad pone una presión inaceptable sobre la disponibilidad. Los equipos suelen recurrir a sagas o a un outbox, y aceptan la consistencia eventual.

## Lo más parecido en Quorum

El juego no tiene 2PC. Un Nodo de SQL distribuido logra el acuerdo en cada escritura de otra manera, esperando a la mayoría de sus réplicas con Raft, y la Investigación [Bases de datos de consenso](/research/consensus) lo desbloquea. Mira [Consenso y elección de líder](/patterns/consensus-and-leader-election), el Componente [SQL distribuido](/components/dsql) y [Raft](/glossary/raft). La alternativa sin transacciones distribuidas es el [Outbox transaccional](/patterns/transactional-outbox), y [Saga](/patterns/saga) cubre el lado de la compensación.

## Referencias

- [Two-phase commit protocol, Wikipedia](https://en.wikipedia.org/wiki/Two-phase_commit_protocol): las fases de votación y de confirmación y los casos de fallo en los que hace falta reparación manual.
- [Life beyond Distributed Transactions, Pat Helland (CIDR 2007)](https://www.cidrdb.org/cidr2007/papers/cidr07p15.pdf): por qué los sistemas escalables evitan las transacciones distribuidas.
- [Saga pattern, microservices.io](https://microservices.io/patterns/data/saga.html): el reemplazo habitual en microservicios, con sus propios compromisos.
