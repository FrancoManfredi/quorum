---
title: Optimización de egress
summary: Reduce la factura por los bytes que salen de tu nube comprimiendo las respuestas, sirviéndolas desde una CDN y manteniendo el tráfico conversador dentro de una zona y una región.
section: patterns
group: Cost
order: 902
aliases: egress, bandwidth cost, data transfer, transfer fees, r2, cloudflare r2, compression, gzip, brotli, cross az, cross region, cdn, coste de ancho de banda, transferencia de datos, tarifas de transferencia, compresión, entre zonas, entre regiones
---

Los proveedores de nube cobran por los datos que salen de su red, así que envía menos bytes, desde lugares más baratos, por caminos más cortos.

## Cuándo usarlo

- La factura tiene una línea grande de transferencia de datos y la app sirve imágenes, vídeo o JSON grande.
- Servicios de distintas zonas o regiones se llaman a menudo entre sí.
- Sirves archivos directamente desde el origen en lugar de una CDN.

## Cómo funciona

Cuatro palancas, en el orden en que se amortizan. **Comprime** las respuestas de texto con gzip o Brotli, que a menudo reducen el HTML y el JSON en dos tercios o más. **Cachea en una CDN**, que sirve las peticiones repetidas desde el edge, a menudo a una tarifa menor, y alivia al origen. **Elige almacenamiento con egress gratuito**, como Cloudflare R2, para los archivos que sirves públicamente. **Mantén el tráfico local**, ya que una llamada entre zonas de disponibilidad factura en ambos sentidos.

Los precios reales lo concretan. AWS cobra alrededor de $0.09 por GB hacia internet en el primer tramo, unos $0.01 por GB en cada sentido entre zonas, y R2 no cobra nada por egress. Con 50 TB al mes, los tramos de AWS (los primeros 10 TB a $0.09, los siguientes 40 TB a $0.085) suman unos $4,400 antes de cualquier franquicia gratuita.

## Qué cuesta

La compresión gasta CPU, y no hace nada con las imágenes, que ya están comprimidas. Una CDN añade un salto en un fallo y una caché que purgar. El egress gratuito suele venir con tarifas por petición.

## En Quorum

El egress se factura desde Semilla. El primer Diseño sirve una mezcla con mucho contenido multimedia directamente desde un almacén tipo S3 sin compresión. El segundo aplica tres de las palancas a los mismos Usuarios y la misma mezcla, y su pie de imagen muestra cómo baja la parte de egress del Gasto. El Gasto total no baja con esta carga, porque la CDN cuesta más que el egress que ahorra.

::Design{id="egress-heavy"}

::Design{id="egress-lean"}

La compresión del Servidor de aplicaciones se aplica a los tipos que pueden reducirse, como las páginas y las lecturas, y cuesta CPU. La CDN responde las páginas cacheables a la tarifa más barata del edge. El producto tipo R2 lleva archivos y contenido multimedia a internet sin tarifa de egress, y solo alcanza ese precio cuando un Servidor de aplicaciones se enlaza con él. [Compresión](/research/gzip), [Entrega de contenido](/research/cdn) y [Optimización de egress](/research/egress-optimization) los desbloquean, y la última necesita [Almacenamiento de objetos](/research/object-storage). Consulta las páginas de la [CDN](/components/cdn) y del [Almacenamiento de objetos](/components/storage), [Recortar la factura de la nube](/guides/cut-the-cloud-bill), y el glosario sobre [egress](/glossary/egress) y [compresión](/glossary/compression).
