---
title: Estrategias de replicación
summary: Elige cómo se mantienen sincronizadas las copias de los datos, cambiando latencia de escritura y escrituras perdidas por lecturas obsoletas y complejidad.
section: patterns
group: Scaling data
order: 305
aliases: leader follower, primary replica, async replication, sync replication, multi-leader, leaderless, raft, master slave, líder y seguidores, primaria y réplica, replicación asíncrona, replicación síncrona, sin líder, maestro esclavo
---

La replicación mantiene más de una copia de los datos, y la estrategia decide cuándo se da una escritura por terminada.

## Cuándo usarlo

- El fallo de una máquina no debe perder datos ni detener las lecturas.
- Las lecturas superan a las escrituras y una copia no puede servirlas todas.
- Los usuarios de otras regiones necesitan una copia cerca de ellos.

## Cómo funciona

Hay cuatro formas habituales.

- **Líder y seguidores, asíncrono.** El líder confirma al instante y los seguidores se ponen al día. Las escrituras son rápidas, un seguidor puede retrasarse, y un líder que muere puede perder las últimas escrituras.
- **Líder y seguidores, síncrono.** El líder espera a un seguidor. No se pierde nada de lo confirmado, y cada escritura paga el viaje de ida y vuelta.
- **Multi-leader.** Cada líder guarda todas las filas y acepta escrituras. Las escrituras locales son rápidas, pero la certificación debe elegir un ganador cuando dos líderes tocan la misma fila a la vez.
- **Sin líder.** Un cliente escribe en varias réplicas y lee de varias, y la regla del [quórum](/patterns/quorum-reads-and-writes) decide lo que ve una lectura.
- **Consenso.** Una mayoría debe ponerse de acuerdo en cada escritura, así que el grupo sobrevive al fallo de una minoría. Mira [consenso y elección de líder](/patterns/consensus-and-leader-election).

## Qué cuesta

Cada forma renuncia a algo. Las copias asíncronas sirven lecturas obsoletas y pierden escrituras en una caída, las síncronas ralentizan cada escritura y detienen las escrituras si la réplica cae, y los almacenes sin líder necesitan matemáticas de quórum. Aceptar escrituras en más de un nodo, como hacen las configuraciones multi-leader y sin líder, añade conflictos de escritura que alguien debe resolver. La replicación tampoco protege de un borrado erróneo, porque el borrado también se replica, así que conserva copias de seguridad.

## En Quorum

::Design{id="sync-replica"}

Una [Réplica de lectura](/components/replica) es asíncrona por defecto, así que se retrasa y algunas lecturas vuelven obsoletas. Activar **Síncrona** hace que cada escritura la espere, lo que elimina las lecturas obsoletas y añade un viaje de ida y vuelta, y si la réplica cae, las escrituras vencen hasta que vuelve. Necesita [Replicación síncrona](/research/sync-replication) tras [Réplicas de lectura](/research/replication).

Un Diseño también puede ejecutar cada Base de datos como líder: con Multi-leader cada Base de datos guarda todas las filas y acepta escrituras, la certificación descarta las escrituras en conflicto (gana el primer commit, el perdedor es rechazado), y cada escritura cuesta 1.25× de CPU para replicarse. Enruta las escrituras relacionadas a un solo líder para evitar conflictos, ya que fusionar después es la alternativa cara.

Cuando la primaria desaparece, promueve una réplica: pasa a ser la primaria y la antigua primaria pasa a ser su réplica, aislada para que las escrituras nunca se dividan. Una réplica síncrona no pierde nada; una asíncrona pierde las escrituras que aún estaban en vuelo.

El [Almacén de columnas anchas](/components/wide) es sin líder, y [SQL distribuido](/components/dsql) es consenso. El incidente [Retraso de replicación](/incidents/repl-lag) muestra el coste asíncrono. El glosario define la [replicación síncrona](/glossary/synchronous-replication) y el [retraso de replicación](/glossary/replication-lag).
