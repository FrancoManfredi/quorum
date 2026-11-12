---
title: Percentiles, no promedios
summary: Informa de p50, p95 y p99 en lugar de la media, porque la media diluye las peticiones lentas de las que se quejan los usuarios reales.
section: patterns
group: Operate and observe
order: 703
aliases: percentile, p99, p95, p50, mean, average latency, histogram, tail, percentil, media, latencia media, histograma, cola
---

Mide la latencia en percentiles, porque la media dice casi nada de las peticiones lentas que los usuarios recuerdan.

## Cuándo usarlo

- La latencia media se ve sana pero los usuarios reportan lentitud.
- Una página hace muchas llamadas, así que una llamada lenta estropea toda la página.
- Fijas o compruebas un objetivo de latencia.

## Cómo funciona

El p99 es el tiempo que 99 de cada 100 peticiones superan con ventaja. Si una pausa de GC añade 150 ms al 2% de las peticiones, el p99 salta 150 ms y la media se mueve 3 ms. Los dos números son ciertos, pero solo uno coincide con lo que sintieron los usuarios más lentos.

Guarda histogramas y no percentiles precalculados. No puedes promediar un p99 entre servidores, pero sí puedes sumar los cubos de sus histogramas y leer un p99 de toda la flota a partir de la suma.

Las colas también se acumulan. Una página que espera 100 llamadas al backend, cada una lenta el 1% de las veces, encuentra una llamada lenta en cerca del 63% de las cargas. Jeff Dean y Luiz Barroso lo describieron en "The Tail at Scale".

## Qué cuesta

Los percentiles altos son ruidosos con poco tráfico, ya que un p99 sobre 50 peticiones es una sola petición. Los histogramas necesitan límites de cubo acordados, y un cubo demasiado ancho oculta un cambio. No persigas el p99.99 salvo que el producto gane dinero con ello.

## En Quorum

[Percentiles](/research/percentiles) muestra p50, p95 y p99 junto a la media en el HUD, y el Nodo de Usuarios los muestra para cada tipo de petición. [Lee el p99](/guides/read-p99) explica cómo encontrar el tipo y el Nodo que hay detrás de una cola, y [Latencia y percentiles](/explanation/latency) explica por qué la media engaña. [Latencia de cola](/patterns/tail-latency) es la base que hay detrás, y el glosario define [percentiles](/glossary/percentile-p50-p95-p99) y [tail at scale](/glossary/tail-at-scale).
