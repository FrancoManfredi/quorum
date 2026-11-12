---
title: Claves calientes y shards calientes
summary: Cuando una clave o un shard se lleva una gran parte del tráfico, añadir servidores no ayuda, así que reparte esa clave o cambia la clave de shard.
section: patterns
group: Scaling data
order: 303
aliases: hotspot, hot partition, celebrity problem, skew, key splitting, write sharding, punto caliente, partición caliente, problema de las celebridades, sesgo, división de claves, sharding de escrituras, clave caliente, shard caliente
---

Una clave caliente o un shard caliente satura una máquina mientras el resto de la flota está ocioso, así que más máquinas no compran nada.

## Cuándo usarlo

- Un shard o un nodo de caché está al rojo mientras los demás están casi ociosos.
- Un único elemento, como el perfil de una celebridad o un producto de venta flash, atrae una gran parte de las lecturas.
- Las filas nuevas caen siempre en el mismo shard, porque la clave crece con el tiempo.

## Cómo funciona

El hashing reparte las claves de forma uniforme, pero no puede repartir una sola clave. Existen dos reparaciones. Elige una clave de shard que coincida con cómo se reparte el tráfico, y para una clave que de todos modos es caliente, divídela: guarda copias bajo claves con sufijo (`item:7#0` a `item:7#9`) y lee una al azar. Una caché delante también absorbe las claves con muchas lecturas.

Una clave de rango como un ID autoincremental envía cada usuario nuevo al último shard. El hash del ID no. Una clave caliente que recibe escrituras es más difícil. Un contador puede dividirse en partes con sufijo que una lectura suma, pero un valor que debe mantenerse sincronizado no puede.

## Qué cuesta

Dividir una clave con muchas lecturas hace que las escrituras toquen cada copia, y dividir un contador hace que una lectura sume cada parte. También tienes que saber qué claves son calientes, normalmente a partir de métricas, y el conjunto caliente cambia. Una clave de tenant mantiene junto a un tenant, lo que es bueno para las consultas y malo cuando un tenant es enorme.

## En Quorum

::Design{id="hot-shard-range-key"}

La clave de rango amontona a los usuarios nuevos en un shard, así que una máquina recibe las escrituras. Frente al Diseño con hash de [Sharding](/patterns/sharding), los mismos shards, Usuarios y tamaños dan un Apdex más bajo y un p99 más largo.

::Design{id="hot-key-bare"}

::Design{id="hot-key-split"}

Ambos Tableros ejecutan un incidente de Clave caliente en la Caché. Lee la fila Load de cada tarjeta: sin división, la capacidad de la Caché cae mientras actúa la clave caliente, y con ella la capacidad se mantiene entera. Nada falla con esta carga, así que la cifra de capacidad es la prueba. En una [Caché](/components/cache), activa la división de claves para que una clave caliente se reparta entre los shards de la caché. Necesita [Fan-out híbrido](/research/hybrid-fanout). Un [Almacén de columnas anchas](/components/wide) tiene el mismo interruptor.

El incidente [Clave caliente](/incidents/hot-key) envía una gran parte de las lecturas a una sola clave, y [Shard caliente del tenant grande](/incidents/hot-shard) pone al mayor tenant en un solo shard. El glosario define la [clave caliente](/glossary/hot-key).
