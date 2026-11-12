---
title: Archivos estáticos en almacenamiento de objetos y una CDN
summary: Sirve páginas y contenido multimedia desde el edge y guarda los archivos en Almacenamiento de objetos, para que el origen solo atienda lo que debe estar fresco.
section: patterns
group: Scaling steps
order: 109
aliases: cdn, cloudflare, s3, static assets, edge cache, object storage, egress, cache hit ratio, recursos estáticos, caché en el edge, almacenamiento de objetos, tasa de aciertos de caché
---

Pon una CDN delante del origen y guarda los archivos subidos en Almacenamiento de objetos.

## Cuándo dar el paso

- Las vistas de página y el vídeo se llevan la mayor parte de la CPU del Servidor de aplicaciones y la línea de egress es grande.
- Todos los usuarios del mundo esperan un viaje de ida y vuelta a un único origen.

## El Diseño

::Design{id="origin-serves-pages"}

::Design{id="cdn-in-front"}

En la primera imagen cada vista de página llega al Servidor de aplicaciones. En la segunda, los Usuarios llegan primero a la CDN. Esta responde lo que tiene en caché y envía al origen los fallos y todos los demás tipos de petición.

## Por qué funciona

La tasa de aciertos de la CDN es la parte de vistas de página que responde sin tocar tus servidores. Las barras de carga del Servidor de aplicaciones y de la Base de datos bajan, y el p99 baja con ellas porque el acierto se responde cerca del usuario.

Importan dos ajustes. Un TTL largo sube la tasa de aciertos, y la purga al desplegar vacía el edge cuando publicas una versión para que nadie vea páginas viejas. Una clave de caché con menos contenido sube aún más los aciertos pero puede filtrar la página de un usuario a otro.

## Qué cuesta

La CDN no cachea lecturas de API, escrituras, inicios de sesión ni pagos. Un TTL largo sin purga sirve páginas obsoletas después de un despliegue. Una purga hace que el origen reciba una ráfaga de fallos mientras el edge se rellena. Las lecturas del Almacenamiento de objetos esperan más por el primer byte que una consulta a la Base de datos.

## En Quorum

Investiga [Entrega de contenido](/research/cdn) para la [CDN](/components/cdn) y [Almacenamiento de objetos](/research/object-storage) para el [Almacenamiento de objetos](/components/storage). El glosario define una [CDN](/glossary/cdn-content-delivery-network) y el [egress](/glossary/egress). [CDN push y pull](/patterns/cdn-push-and-pull) cubre el patrón. El siguiente paso es [añadir una caché](/patterns/add-a-cache).
