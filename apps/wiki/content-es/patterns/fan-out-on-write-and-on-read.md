---
title: Fan-out en escritura y en lectura
summary: Construye el feed de un usuario o cuando alguien publica, copiando la publicación a cada seguidor, o cuando el usuario lee, reuniendo las publicaciones de todos a quienes sigue.
section: patterns
group: Scaling reads and compute
order: 212
aliases: fan-out, fanout, feed, timeline, push model, pull model, hybrid fan-out, celebrity problem, twitter, fan-out en escritura, fan-out en lectura, línea de tiempo, modelo push, modelo pull, fan-out híbrido, problema de las celebridades
---

El fan-out en escritura hace el trabajo al publicar, y el fan-out en lectura lo hace al ver.

## Cuándo usarlo

- Las lecturas del feed superan con mucho a las publicaciones, así que el coste pertenece a la escritura.
- Un feed debe cargar rápido, porque es la primera pantalla.
- Las cuentas tienen un número acotado de seguidores, o puedes tratar aparte a las enormes.

## Cómo funciona

En lectura (pull), la petición del feed pide las últimas publicaciones de cada cuenta seguida y las fusiona. Publicar es barato y leer es lento. En escritura (push), una publicación se copia en la línea de tiempo guardada de cada seguidor, así que leer es una sola búsqueda. Si un usuario tiene 200 seguidores, una publicación hace 200 escrituras pequeñas.

El problema es la cuenta con 50 millones de seguidores, donde una publicación supone 50 millones de escrituras. El diseño publicado de Twitter hace push para la mayoría de las cuentas y hace pull, en el momento de la lectura, de las publicaciones de las más seguidas. Este híbrido es la respuesta común.

## Qué cuesta

Push multiplica las escrituras, guarda una línea de tiempo por usuario y desperdicia trabajo en seguidores que nunca inician sesión. Pull hace que la petición más concurrida sea la más cara y lenta en la cola. El híbrido necesita una regla para decidir quién cuenta como grande, y la fusión añade complejidad.

## En Quorum

El fan-out es un ajuste del [Servidor de aplicaciones](/components/server): pull o push. Push escribe las líneas de tiempo a través del nivel de datos. Investigar [Fan-out híbrido](/research/hybrid-fanout) convierte push en el híbrido y deja que una [Caché](/components/cache) divida las claves calientes. Los feeds empiezan en una Era tardía, así que ambos Diseños se ejecutan allí con los backends de los demás tipos enlazados.

::Design{id="fanout-pull"}

::Design{id="fanout-push"}

El incidente [Clave caliente](/incidents/hot-key) es el problema de las celebridades. El glosario define [fan-out](/glossary/fan-out) y [fan-out en escritura](/glossary/fan-out-on-write).
