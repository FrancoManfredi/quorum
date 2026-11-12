---
title: Ten tu propio edge: Netflix
summary: Netflix construyó su propia CDN y puso una capa de memcached delante de la base de datos, para que el vídeo y las lecturas personalizadas nunca toquen el origen.
section: patterns
group: Ran in production
order: 953
aliases: netflix, open connect, cdn, evcache, memcached, streaming, edge propio
---

Netflix empezó Open Connect en 2011, cuando el crecimiento del streaming volvió demasiado cara una CDN estándar. Open Connect es la red propia de Netflix de dispositivos de caché, colocados dentro de puntos de intercambio de internet y, para los ISP que cumplen los requisitos, dentro del propio centro de datos del ISP. Netflix dijo en 2016 que transportaba el 100% de su tráfico de vídeo, unos 125 millones de horas al día, desde cerca de 1,000 ubicaciones.

## El sistema

El plano de control corre en AWS: el registro, la navegación, la reproducción y los datos personalizados que hay detrás. EVCache, una capa de memcached, guarda esos datos. Cada escritura va a todas las zonas de la región, y una canalización de Kafka la replica entre regiones, así que cualquier región puede atender a cualquier miembro. El vídeo en sí nunca toca AWS. El reproductor pide los bits a Open Connect.

## El tablero

::Design{id="netflix-own-cdn"}

La CDN es Open Connect: una caché cerca del espectador que responde con contenido multimedia sin pasar por el origen. Los Servidores de aplicaciones son el plano de control, la Caché es EVCache, la Base de datos es la fuente de verdad, y el Almacenamiento de objetos guarda los objetos de vídeo que el edge aún no ha cacheado.

## Por qué funciona

Dos cachés responden dos preguntas distintas. El edge responde los mismos bytes a millones de espectadores, así que una copia cerca de ellos elimina casi todo el tráfico de larga distancia. EVCache responde una lectura personalizada desde memoria, así que la base de datos ve menos consultas. [CDN push y pull](/patterns/cdn-push-and-pull) y [caché por niveles](/patterns/cache-warming-and-tiered-caching) cubren las dos capas.

## Hasta dónde llega el juego

La CDN del juego es un Componente gestionado, no una flota de dispositivos de Netflix dentro de los ISP. El tablero no muestra la replicación de EVCache entre regiones con Kafka ni sus escrituras por zona. El pie de figura es el resultado de Quorum, no el tráfico de Netflix. Lo que se traslada es la forma: un edge para los bytes, una capa en memoria para los datos personales.

## Fuentes

- [Open Connect Overview, Netflix](https://openconnect.netflix.com/Open-Connect-Overview.pdf): qué es Open Connect, cómo se colocan los dispositivos y qué hace el plano de control.
- [Caching for a Global Netflix, Netflix Technology Blog](https://netflixtechblog.com/caching-for-a-global-netflix-7bcc457012f1): EVCache, sus escrituras por zona y la vía de replicación con Kafka.
- [How Netflix works with ISPs around the globe, About Netflix](https://about.netflix.com/en/news/how-netflix-works-with-isps-around-the-globe-to-deliver-a-great-viewing-experience): las cifras de 2016 sobre la cuota de vídeo y el número de ubicaciones.
