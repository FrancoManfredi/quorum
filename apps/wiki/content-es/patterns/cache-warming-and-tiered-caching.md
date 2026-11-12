---
title: Calentamiento de caché y caché en niveles
summary: Llena una caché antes de que reciba tráfico, y pon una segunda caché entre la primera y el origen, para que una caché fría o lejana no envíe cada lectura a la fuente.
section: patterns
group: Scaling reads and compute
order: 204
aliases: warm cache, cold cache, prewarm, tiered cache, origin shield, regional cache, cache hierarchy, calentamiento de caché, caché fría, precalentar, caché en niveles, escudo de origen, caché regional, jerarquía de cachés
---

El calentamiento llena una caché antes de la demanda, y los niveles hacen que un fallo pregunte a una caché cercana antes de preguntar al origen.

## Cuándo usarlo

- El reinicio de una caché o un despliegue deja la base de datos sobrecargada durante minutos.
- Muchos edges de CDN fallan con el mismo archivo grande y cada uno lo trae de tu origen.
- Sabes qué se va a calentar antes de que se pida, como la página de un lanzamiento.

## Cómo funciona

El calentamiento reproduce claves recientes o populares en la caché antes de que reciba usuarios. Las herramientas lo hacen leyendo una lista de claves de la base de datos, o cargando una instantánea, como hace Redis cuando recarga su archivo de datos tras un reinicio.

Los niveles añaden una capa. Un edge de CDN que falla pregunta a una caché regional, y solo esa caché llama al origen. Diez edges que fallan con el mismo vídeo le cuestan al origen una obtención, no diez. Cloudflare y Fastly lo venden como shield o caché en niveles.

## Qué cuesta

El calentamiento lleva tiempo y lecturas propias a la base de datos, así que una pasada de calentamiento en horas punta puede causar la carga que debía evitar. Una lista de claves anticuada calienta los datos equivocados. Los niveles añaden un salto en un fallo y una caché más que purgar, así que una purga que solo llega al edge deja contenido viejo en el nivel regional.

## En Quorum

El calentamiento es un interruptor de la [Caché](/components/cache), y necesita [Precalentamiento de caché](/research/cache-warming), que a su vez necesita [Protección contra estampidas](/research/stampede-protection). La caché en niveles es un efecto de la [CDN](/components/cdn) sin interruptor: [Caché por niveles](/research/tiered-caching) hace que los edges pidan el vídeo a un nivel regional, y el Diseño la lista como una investigación que necesita.

::Design{id="cache-warmed-tiered"}

El incidente [Estampida de caché](/incidents/stampede) es lo que previene el calentamiento. El glosario define [calentamiento de caché](/glossary/cache-warming) y [caché en niveles](/glossary/tiered-caching).
