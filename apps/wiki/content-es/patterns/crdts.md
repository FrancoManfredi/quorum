---
title: CRDT
summary: Un tipo de dato replicado libre de conflictos permite que cada réplica acepte escrituras por su cuenta y aun así se fusione en el mismo estado sin coordinación.
section: patterns
group: Outside the game
order: 1009
aliases: crdt, conflict-free replicated data type, merge, collaborative editing, offline first, g-counter, local-first, tipo de dato replicado libre de conflictos, fusión, edición colaborativa, offline first
---

Un CRDT es una estructura de datos construida para que dos réplicas cualesquiera que hayan visto las mismas actualizaciones lleguen al mismo estado, sea cual sea el orden en que llegaron las actualizaciones. El sitio crdt.tech los describe como estructuras que se encargan de resolver los conflictos por ti.

Úsalo cuando las réplicas deben seguir escribiendo estando desconectadas. Dos teléfonos editan una lista de la compra compartida en un avión. Cada uno añade elementos sin conexión, y al aterrizar se sincronizan. Con un conjunto add-wins, un elemento que un teléfono añadió se conserva aunque el otro lo quitara a la vez, y ambos teléfonos muestran la misma lista sin que ningún servidor decida. Los contadores, los conjuntos, los registros y las secuencias de texto tienen formas CRDT, y los editores colaborativos las usan.

El coste es la libertad de diseño. Cada tipo tiene reglas de fusión fijas, así que una regla que no querías, como add-wins, viene incorporada. Los metadatos crecen, ya que las réplicas suelen guardar tombstones de los elementos eliminados o un vector de contadores por réplica, y el estado necesita compactación. Los invariantes como "el stock nunca baja de cero" no se pueden imponer sin coordinación, que es justo la esencia del trueque. Elige CRDT para datos en los que cualquier resultado fusionado es aceptable.

## Lo más parecido en Quorum

El juego no tiene CRDT. La idea más cercana es un almacén que acepta escrituras en varias réplicas y concilia después. Un Almacén de columnas anchas con [replicación sin líder](/glossary/leaderless-replication) hace esto, y la Investigación [Replicación sin líder](/research/leaderless) lo desbloquea. Sus lecturas obsoletas son lo que cuesta la [consistencia eventual](/glossary/eventual-consistency), y un [quórum](/glossary/quorum) débil es el mando. Lee [Estrategias de replicación](/patterns/replication-strategies) y [Modelos de consistencia](/patterns/consistency-models) para el contexto.

## Referencias

- [About CRDTs, crdt.tech](https://crdt.tech/): una definición breve y el argumento a favor del funcionamiento descentralizado, con enlaces a artículos.
- [CRDT Glossary, crdt.tech](https://crdt.tech/glossary): define los conjuntos add-wins, los tipos basados en estado y en operaciones, y los CRDT delta.
- [Conflict-free Replicated Data Types (Preguiça, Baquero, Shapiro, 2018)](https://arxiv.org/abs/1805.06358): un artículo de visión general que enuncia las propiedades de convergencia.
