---
title: Balanceo de carga de capa 4 y capa 7
summary: Elige entre un balanceador que reenvía conexiones TCP con rapidez y uno que lee cada petición HTTP para poder enrutar según el contenido.
section: patterns
group: Scaling reads and compute
order: 211
aliases: l4, l7, tcp load balancer, http load balancer, nlb, alb, content routing, path routing, balanceador TCP, balanceador HTTP, enrutado por contenido, enrutado por ruta, capa 4, capa 7
---

Un balanceador de capa 4 reenvía conexiones sin mirar dentro, y uno de capa 7 lee la petición y decide con lo que encuentra.

## Cuándo usarlo

- L7: quieres reintentar una llamada fallida en otro servidor, o comprobar la salud de un destino por HTTP.
- L4: el throughput bruto y la baja latencia importan más que el enrutado, o el tráfico no es HTTP.
- Cualquiera: un único balanceador es el nodo más ocupado del tablero.

## Cómo funciona

Un balanceador L4 trabaja con direcciones IP y puertos. Elige un backend y pasa los bytes, así que hace poco trabajo por petición y maneja volúmenes muy grandes. Un balanceador L7 termina la conexión, analiza HTTP, y puede enviar `/api` a un pool y `/images` a otro, añadir cabeceras y reintentar. Ejemplos reales son el Network Load Balancer de AWS para L4 y su Application Load Balancer para L7.

Dividir los pools por tipo también los aísla: una avalancha de vistas de página no puede dejar sin recursos a los servidores de API. Quorum da esa división al [API Gateway](/components/gw) y deja que el balanceador reparta lo que le llega.

## Qué cuesta

L7 hace más trabajo por petición, así que tiene un techo más bajo, cuesta más por petición y añade latencia. L4 no puede ver rutas ni reintentar una petición, y reparte la carga por conexión, así que una conexión de larga vida puede fijar a un servidor.

## En Quorum

Un [Balanceador de carga](/components/lb) tiene una variante. L7 es la predeterminada, y L4 necesita [Balanceo de carga L4](/research/l4-lb). L4 reenvía todos los tipos de petición en cada Enlace. Ninguna variante enruta por tipo: poner `page` en un grupo de servidores y `read` en otro es tarea del [API Gateway](/components/gw).

::Design{id="lb-layer-7"}

::Design{id="lb-layer-4"}

El glosario define el [balanceador de carga](/glossary/load-balancer). Combínalo con [Algoritmos de balanceo de carga](/patterns/load-balancing-algorithms).
