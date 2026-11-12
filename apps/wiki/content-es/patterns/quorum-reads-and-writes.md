---
title: Lecturas y escrituras de quórum
summary: Mantén varias copias de cada clave y haz que una lectura y una escritura consulten cada una las suficientes para solaparse, de modo que las lecturas vean la última escritura sin un líder.
section: patterns
group: Scaling data
order: 306
aliases: quorum, n r w, tunable consistency, dynamo, cassandra, leaderless, sloppy quorum, quórum, consistencia ajustable, sin líder, quórum laxo
---

Un almacén de quórum guarda N copias de cada clave, espera a W de ellas en una escritura y consulta a R de ellas en una lectura.

## Cuándo usarlo

- El almacén debe seguir aceptando escrituras mientras una réplica está caída.
- Puedes elegir un nivel de consistencia por consulta, cambiando velocidad por frescura.
- Los datos están repartidos entre varias máquinas o regiones y ningún líder único debería ser un cuello de botella.

## Cómo funciona

Si R + W es mayor que N, cualquier conjunto de lectura y cualquier conjunto de escritura comparten al menos una réplica, así que una lectura se encuentra con la última escritura confirmada. Con N igual a 3, W igual a 2 y R igual a 2 se cumple y se sobrevive a una réplica caída. W igual a 1 y R igual a 1 es el ajuste más rápido, pero una lectura puede perderse la última escritura.

El solapamiento es más débil de lo que suena. Las escrituras concurrentes, una escritura que falló en algunas réplicas y los quórums laxos aún pueden devolver valores viejos, así que un quórum no es linealizabilidad. El dinero necesita un almacén de [consenso](/patterns/consensus-and-leader-election).

## Qué cuesta

Una escritura cuesta N operaciones de réplica y una lectura cuesta R, así que los ajustes más fuertes usan más capacidad y esperan a la réplica más lenta que necesitan. Un ajuste que necesita todas las réplicas falla cuando se pierde una. Los ajustes débiles sirven lecturas obsoletas, que la aplicación debe tolerar.

## En Quorum

El [Almacén de columnas anchas](/components/wide) toma N, R y W en su tarjeta, y los dos Diseños se diferencian solo en R y W.

::Design{id="quorum-strong"}

::Design{id="quorum-weak"}

El fuerte lee la última escritura y el débil usa menos operaciones de réplica pero sirve algunas lecturas obsoletas. Ninguno es seguro para los pagos, porque el solapamiento no es linealizabilidad y una parte sigue saliendo mal. El almacén se desbloquea con [Replicación sin líder](/research/leaderless). El glosario define [quórum](/glossary/quorum) y [consistencia eventual](/glossary/eventual-consistency). El incidente [Clave caliente](/incidents/hot-key) muestra una clave sobrecargando sus réplicas.
