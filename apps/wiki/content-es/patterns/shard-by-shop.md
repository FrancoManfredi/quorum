---
title: Shard por tienda: Shopify
summary: Shopify dividió su flota de MySQL en pods por tienda, y luego enrutó cada petición al pod que la posee.
section: patterns
group: Ran in production
order: 951
aliases: shopify, pods, sharding, multi-tenant, mysql, sorting hat, black friday, multi-inquilino, shard por tienda
---

Shopify ejecutó una gran base de datos MySQL hasta 2015, cuando comprar un servidor mayor dejó de ser una opción. El equipo hizo sharding por `shop_id`, y luego fue más allá: cada shard pasó a ser un pod con su propia base de datos, caché y servidores de aplicaciones. Un componente de balanceo llamado Sorting Hat lee la tienda de la petición y añade una cabecera que la envía al pod correcto.

## El sistema

El pod es la unidad de aislamiento. Un pod contiene un subconjunto de tiendas, su propio shard de MySQL, Redis y Memcached, y puede ejecutarse en cualquier sitio. Los servidores de aplicaciones y los workers de trabajos se comparten entre pods, así que una venta relámpago en un pod puede usar capacidad del resto de la región. En 2024 la plataforma alcanzó un pico de 489 millones de peticiones por minuto en el edge, 117 millones por minuto en los servidores de aplicaciones y 14.8 billones de consultas a la base de datos durante el fin de semana.

## El tablero

::Design{id="shopify-tenant-shards"}

La Base de datos tiene cuatro shards sobre una clave de tenant, que es el límite del pod. El Balanceador de carga representa a Sorting Hat, la Caché es el Redis y Memcached de cada pod, y la Cola y los Workers son la capa de trabajos compartida. El Proveedor de pagos responde los pagos.

## Por qué funciona

Una clave de tenant mantiene las filas de una tienda en un shard, así que la mayoría de las consultas se quedan en local y un fallo se queda dentro de un pod. El compromiso es el tenant caliente: una tienda enorme aún puede hacer que su shard sea el más ocupado, por eso Shopify da a los grandes comerciantes un pod dedicado. [Haz sharding de la base de datos](/patterns/shard-the-database) cubre el compromiso general.

## Hasta dónde llega el juego

El tablero hace sharding de la base de datos pero mantiene un solo conjunto de servidores de aplicaciones, porque Quorum no tiene una capa de aplicaciones por pod. Tampoco tiene Sorting Hat, así que la clave de shard hace el enrutado que en Shopify hace la cabecera. El pie de figura es el resultado de Quorum, no el tráfico de Shopify.

## Fuentes

- [A Pods Architecture To Allow Shopify To Scale, Shopify Engineering](https://shopify.engineering/a-pods-architecture-to-allow-shopify-to-scale): el pod, Sorting Hat y por qué el sharding solo no bastaba.
- [Shard Balancing: Moving Shops Confidently with Zero-Downtime at Terabyte-scale, Shopify Engineering](https://shopify.engineering/mysql-database-shard-balancing-terabyte-scale): cómo se mueve una tienda entre pods.
- [How we prepare Shopify for BFCM, Shopify Engineering](https://shopify.engineering/bfcm-readiness-2025): las cifras del pico de 2024 y el plan de pruebas de 2025.
