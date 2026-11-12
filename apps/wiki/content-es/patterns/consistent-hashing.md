---
title: Hashing consistente
summary: Coloca las claves en un anillo de servidores, para que añadir o quitar un servidor mueva solo su parte de las claves en lugar de casi todas.
section: patterns
group: Scaling data
order: 302
aliases: hash ring, rendezvous hashing, virtual nodes, vnodes, modulo hashing, key placement, hashing consistente, anillo de hash, nodos virtuales, colocación de claves
---

El hashing consistente asigna claves a servidores de modo que un cambio en la lista de servidores mueve solo una pequeña parte de las claves.

## Cuándo usarlo

- Una clave debe llegar siempre al mismo servidor, como una entrada de caché, un shard o la sesión de un usuario.
- Los servidores entran y salen, y un simple `hash(key) % n` movería casi todas las claves cada vez que cambia `n`.

## Cómo funciona

Aplica el hash de cada servidor sobre un anillo, aplica el hash de cada clave sobre el mismo anillo y entrega la clave al siguiente servidor en el sentido de las agujas del reloj. Con 10 servidores, quitar uno entrega sus claves a su vecino y deja las claves de los otros nueve donde estaban. El hashing por módulo reasignaría cerca del 90% de todas las claves con el mismo cambio.

Un solo punto por servidor da porciones desiguales. Los sistemas reales colocan cada servidor en el anillo muchas veces, como nodos virtuales, para que las porciones se igualen y las claves de un servidor caído se repartan entre muchos vecinos en lugar de uno.

## Qué cuesta

El anillo reparte las claves de forma uniforme, no la carga. Una clave popular sigue cayendo en un servidor, lo que es una [clave caliente](/patterns/hot-keys-and-hot-shards). La colocación también ignora lo ocupado que está un servidor, así que uno lento conserva su parte. La capa de enrutado debe conocer el mismo anillo en todas partes, o dos clientes discreparán sobre dónde vive una clave.

## En Quorum

::Design{id="hash-balanced-pair"}

Un [Balanceador de carga](/components/lb) puede repartir por **Consistent hash**. Cada destino recibe una parte igual de las claves sea cual sea su carga, y un destino que se va mueve solo sus propias claves. Los dos Servidores de aplicaciones tienen el mismo tamaño a propósito, porque el reparto ignora la carga. La opción de Política necesita [Algoritmos de balanceo de carga](/research/lb-algorithms).

Un [Almacén de columnas anchas](/components/wide) coloca cada clave en sus réplicas de la misma forma. El glosario define el [hashing consistente](/glossary/consistent-hashing), y el [sharding](/patterns/sharding) usa la misma idea para los datos.
