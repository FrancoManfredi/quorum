---
title: CDN push y pull
summary: Pon copias de tu contenido en servidores cercanos a los usuarios, llenándolos bajo demanda desde tu origen (pull) o subiéndolos tú mismo (push).
section: patterns
group: Scaling reads and compute
order: 206
aliases: cdn, content delivery network, edge cache, origin pull, origin push, purge, cache key, ttl, cloudflare, red de distribución de contenido, caché del edge, purga, clave de caché
---

Una CDN guarda copias de tus respuestas en el edge, y pull y push se diferencian en quién las pone ahí.

## Cuándo usarlo

- La mayor parte del tráfico son páginas, imágenes o vídeo que comparten muchos usuarios.
- Los usuarios están lejos de tu origen, y el viaje de ida y vuelta domina la latencia.
- El egress de tus servidores es una parte grande de la factura.

## Cómo funciona

Con pull, la primera petición de un archivo falla, el edge lo trae de tu origen, lo guarda durante el TTL y sirve él mismo a los siguientes visitantes. No haces nada para publicar. Con push, subes tú los archivos a la CDN, lo que conviene a archivos grandes que cambian poco, como instaladores o segmentos de vídeo.

La clave de caché decide qué cuenta como el mismo archivo. Una clave que es solo la ruta comparte una copia entre todos y tiene la mejor tasa de aciertos. Una clave que incluye cookies mantiene separadas las páginas personales. Un TTL de una hora sube los aciertos y también deja vivir a las páginas viejas una hora, por eso los despliegues purgan la caché.

## Qué cuesta

Una clave que omite la cookie puede mostrar la página de un usuario a otro, y un TTL largo sin purga sirve el lanzamiento de ayer. Pull también hace lento al primer visitante de cada archivo, y una purga manda una oleada de fallos de vuelta al origen.

## En Quorum

Coloca una [CDN](/components/cdn) después de [Entrega de contenido](/research/cdn) y enlázala delante del Servidor de aplicaciones. El juego modela solo pull, así que push queda fuera de alcance. Lo más cercano es la purga en el despliegue: un despliegue vacía el edge, y este se vuelve a llenar desde el origen.

::Design{id="cdn-pull"}

El incidente [Fuga de página cacheada](/incidents/page-leak) es el error de la clave de caché, y [Edge-side includes](/research/esi) es lo que hace cacheable una página con sesión iniciada. El glosario define [CDN](/glossary/cdn-content-delivery-network).
