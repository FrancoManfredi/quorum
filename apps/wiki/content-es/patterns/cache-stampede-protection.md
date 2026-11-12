---
title: Protección contra estampidas de caché
summary: Evita que muchos lectores reconstruyan a la vez la misma clave de caché caducada, para que una sola clave popular no tumbe la base de datos.
section: patterns
group: Scaling reads and compute
order: 203
aliases: stampede, thundering herd, dogpile, request coalescing, single flight, early expiration, stale-while-revalidate, swr, estampida, efecto estampida, fusión de peticiones, caducidad anticipada
---

Una estampida ocurre cuando una clave caliente caduca y todos los lectores en espera piden la clave a la base de datos en el mismo instante.

## Cuándo usarlo

- La CPU de la base de datos se dispara a intervalos regulares que coinciden con un TTL de la caché.
- Una clave se lleva una gran parte de las lecturas, así que su caducidad importa más que ninguna otra.
- El reinicio de una caché hace caer la base de datos y la mantiene caída mientras la caché se llena.

## Cómo funciona

Hay tres soluciones, y se combinan. La fusión de peticiones (coalescing, también llamada single flight) deja que el primer lector obtenga el dato mientras los demás esperan su respuesta, así que mil fallos se convierten en una consulta. La caducidad anticipada hace que los lectores refresquen una clave poco antes de que caduque, elegida al azar, para que las claves no se vayan todas juntas. Stale-while-revalidate sirve el valor viejo mientras una petición lo refresca, así que nadie espera.

Si una clave recibe 2,000 lecturas por segundo y la consulta tarda 200 ms, una caducidad sin protección envía unas 400 consultas antes de que llegue la primera respuesta. La fusión envía una.

## Qué cuesta

La fusión hace más lentos a los que esperan mientras esperan, y una obtención atascada los retiene a todos. La caducidad anticipada gasta unas cuantas lecturas extra. Stale-while-revalidate sirve datos viejos a propósito, algo que un precio o un recuento de inventario puede no permitir. Nada de esto arregla una base de datos demasiado pequeña para la tasa de fallos.

## En Quorum

Coloca una [Caché](/components/cache) e investiga [Protección contra estampidas](/research/stampede-protection). El primer Diseño no tiene protecciones, y el segundo activa dos de ellas. El pie de imagen de cada uno muestra el resultado con los mismos Usuarios. En estado estable la diferencia es pequeña y viene de la caducidad anticipada, porque la fusión solo ayuda mientras la Caché está fría, como tras un reinicio.

::Design{id="stampede-bare"}

::Design{id="stampede-guarded"}

El juego también tiene stale-while-revalidate como interruptor de la Caché, que sirve datos viejos y aparece como respuestas obsoletas en el registro. El incidente [Estampida de caché](/incidents/stampede) lo pone a prueba, y el glosario define [estampida de caché](/glossary/cache-stampede) y [efecto estampida](/glossary/thundering-herd).
