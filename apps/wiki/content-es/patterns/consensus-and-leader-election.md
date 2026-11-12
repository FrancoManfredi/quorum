---
title: Consenso y elección de líder
summary: Haz que un grupo de servidores se ponga de acuerdo en un único orden de escrituras mediante una votación por mayoría, para que los datos sigan correctos mientras falla una minoría.
section: patterns
group: Scaling data
order: 307
aliases: raft, paxos, leader election, etcd, zookeeper, cockroachdb, majority, split brain, fencing, consenso, elección de líder, mayoría, cerebro dividido, fencing
---

El consenso permite que un grupo de servidores se ponga de acuerdo en un único registro de escrituras, y elige a un líder para añadir entradas a él.

## Cuándo usarlo

- Los datos deben ser correctos, como el dinero o el inventario, y una escritura obsoleta o perdida es inaceptable.
- El sistema debe sobrevivir al fallo de un servidor o de una zona sin que intervenga una persona.
- Necesitas un único dueño para un lock, un lease o un valor de configuración.

## Cómo funciona

El líder añade cada escritura a su registro y la envía a los seguidores. La escritura se confirma (commit) cuando una mayoría la ha guardado, así que con 5 servidores bastan 3 cualesquiera y el grupo aguanta 2 fallos. Si el líder muere, los seguidores celebran una elección y gana el que tiene el registro más actualizado. Raft y Paxos son los algoritmos habituales, y etcd y CockroachDB usan Raft.

Una partición de red es el caso difícil. Solo el lado que aún tiene una mayoría puede elegir un líder y confirmar, así que el lado minoritario deja de aceptar escrituras en lugar de divergir.

## Qué cuesta

Cada escritura espera a una mayoría, así que la latencia es como mínimo el viaje de ida y vuelta hasta la réplica que completa la mayoría, y entre regiones eso son decenas de milisegundos. El throughput es menor que el de un almacén sin líder, y necesitas un número impar de servidores para mantener una mayoría clara. No lo uses para datos que toleran la obsolescencia, donde basta un almacén más barato.

## En Quorum

::Design{id="consensus-store"}

[SQL distribuido](/components/dsql) representa a CockroachDB y funciona sobre [Raft](/glossary/raft). Su tarjeta tiene **Spread**, que replica entre las regiones abiertas, y con una tercera región abierta una mayoría sobrevive a la pérdida de una. Una escritura espera a una mayoría, las lecturas siguen siendo locales, y es el almacén adecuado para los pagos y uno caro para los feeds.

Se desbloquea con [Bases de datos de consenso](/research/consensus). Una [Partición de red](/incidents/partition) es menos probable con él, porque mantiene un solo líder. En un almacén basado en líder las escrituras divergen hasta que **Fence leader** pone fin a la partición. La guía [Dar el salto global](/guides/go-global) cubre las regiones.
