---
title: Precómputo
summary: Haz el trabajo costoso antes de que nadie lo pida, para que una petición lea una respuesta lista en lugar de construirla.
section: patterns
group: Scaling reads and compute
order: 214
aliases: precompute, static generation, static site, incremental static regeneration, isr, pre-rendering, build time, ahead of time, precomputar, generación estática, sitio estático, prerrenderizado, tiempo de compilación, por adelantado
---

El precómputo traslada el trabajo del momento de la petición a un momento que tú eliges, como una compilación, una programación o una escritura.

## Cuándo usarlo

- Muchos usuarios reciben la misma respuesta, como una página de producto o una clasificación.
- La respuesta es costosa de construir pero cambia poco.
- Es aceptable un pequeño retraso entre un cambio y su aparición.

## Cómo funciona

Un generador de sitios estáticos renderiza cada página en la compilación y sube archivos, así que una petición cuesta la lectura de un archivo. La regeneración estática incremental, como la hace Next.js, renderiza una página en la primera petición, guarda el resultado y lo reconstruye en segundo plano pasado un tiempo fijado. Los índices de búsqueda, las listas de recomendaciones y los informes diarios siguen el mismo plan: un trabajo los calcula y las peticiones leen el resultado.

Una página renderizada una vez y leída 100,000 veces gasta su coste una sola vez. Poner una CDN delante de los archivos hace que las lecturas repetidas sean casi gratis.

## Qué cuesta

Pagas por trabajo que quizá nadie lea, y tienes que decidir cuándo reconstruir. Las páginas que dependen del usuario no se pueden compartir. Un cambio aparece tarde, y una purga o una revalidación es la única forma de forzarlo. Los sitios grandes pueden pasar minutos reconstruyendo.

## En Quorum

Dos controles se acercan. El Framework de un [Servidor de aplicaciones](/components/server) puede ser Next.js, tras investigar [Next.js](/research/fw-nextjs) y [Node.js](/research/lang-node), que renderiza una parte de las páginas como salida estática que una [CDN](/components/cdn) puede cachear. Las lecturas de informes pueden usar una vista de la Base de datos, que cubre [Vistas materializadas y desnormalización](/patterns/materialized-views-and-denormalization).

::Design{id="precomputed"}

[CDN push y pull](/patterns/cdn-push-and-pull) cubre la capa de caché que va delante.
