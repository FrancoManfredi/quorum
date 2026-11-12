---
title: CAP y PACELC
summary: Cuando la red se parte, un almacén replicado debe rechazar algunas peticiones o servir datos obsoletos, e incluso estando sano cambia latencia por consistencia.
section: patterns
group: Foundations
order: 12
aliases: cap theorem, pacelc, partition tolerance, consistency vs availability, ap, cp, pa/el, pc/ec, teorema CAP, tolerancia a particiones, consistencia frente a disponibilidad
---

CAP dice que cuando una partición de red divide un sistema replicado, este puede mantenerse consistente o mantenerse disponible, pero no ambas cosas. PACELC añade lo que CAP deja fuera: cuando no hay partición, igualmente eliges entre latencia y consistencia.

Imagina un vendedor de entradas con una base de datos en Fráncfort y una copia en Virginia, y el enlace entre ambas se cae. Un diseño **CP** rechaza escrituras en el lado que no alcanza a la mayoría, así que ningún asiento se vende dos veces, pero algunos clientes ven errores. Un diseño **AP** sigue vendiendo en ambos lados y concilia después, así que todos reciben una respuesta, y el asiento 14C puede acabar vendido a dos personas. La partición no es una elección. Solo eliges a qué renuncias mientras dura.

Las particiones son raras, así que los largos tramos entre ellas importan más. Aquí PACELC pregunta: Else, Latency or Consistency? (si no, ¿latencia o consistencia?). Una escritura que debe llegar a Virginia antes de confirmarse añade un viaje de ida y vuelta de unos 90 ms entre Fráncfort y Virginia. Una escritura confirmada localmente es rápida, y un lector del otro lado puede ver datos viejos durante un rato. Daniel Abadi, que propuso PACELC, clasifica así los sistemas reales. Dynamo, Cassandra y Riak son PA/EL: renuncian a la consistencia por la disponibilidad en una partición y por la latencia en el resto del tiempo. VoltDB y BigTable son PC/EC. MongoDB es PA/EC.

## Qué cambia en un diseño

Decide por cada dato, no por empresa. Un carrito de compra puede ser AP, porque una línea duplicada es fácil de corregir. El saldo de una cuenta o el recuento de asientos debería ser CP. Un mismo sistema suele guardar ambos, así que te interesa un almacén que puedas ajustar por consulta ([Lecturas y escrituras de quórum](/patterns/quorum-reads-and-writes)).

CAP también es más estrecho de lo que la gente lo usa. Su "consistencia" significa linealizabilidad, y su "disponibilidad" significa que todo nodo que no falla responde. Estrictamente, un sistema que devuelve error en el 0.1% de las escrituras durante una partición no está disponible en el sentido de CAP, aunque sus usuarios dirían que funciona. Consulta [Modelos de consistencia](/patterns/consistency-models) para las garantías más débiles intermedias.

## En Quorum

El Incidente [Partición de red](/incidents/partition) corta las llamadas entre regiones y hace divergir las escrituras basadas en líder, y [Split brain](/incidents/split-brain) muestra lo que cuestan dos mitades de un clúster en tiempo real. Un Nodo de SQL distribuido mantiene un líder Raft, que es la elección CP, mientras que un Almacén de columnas anchas con un [quórum](/glossary/quorum) débil es la AP. Las Investigaciones [Bases de datos de consenso](/research/consensus) y [Replicación sin líder](/research/leaderless) desbloquean ambos. Lee [Consenso y elección de líder](/patterns/consensus-and-leader-election) para ver cómo funciona el lado CP.
