---
title: Limitación de tasa
summary: Limita cuántas peticiones por segundo puede enviar un cliente o un servicio, para que un solo llamador ruidoso no consuma la capacidad que todos comparten.
section: patterns
group: Resilience
order: 506
aliases: rate limit, throttle, token bucket, 429, quota, api limit, limitación de tasa, límite de peticiones, cuota, límite de API
---

Un límite de tasa rechaza las peticiones por encima de una tasa acordada antes de que lleguen al servicio que hay detrás.

## Cuándo usarlo

- Un cliente, un bot o un tenant puede enviar mucho más de lo que le corresponde.
- Un backend tiene un techo fijo, como una API de terceros de pago o una base de datos.
- Necesitas decir a los llamadores que vayan más despacio con una respuesta clara, como HTTP 429.

## Cómo funciona

Un token bucket guarda tokens que se reponen a la tasa del límite. Cada petición toma uno, y una petición que encuentra el cubo vacío es rechazada. El tamaño del cubo fija la ráfaga: un cubo de 50 con una reposición de 10 por segundo deja pasar de golpe un pico de 50 y luego mantiene el promedio en 10. Un sitio habitual para ponerlo es el gateway, así que las llamadas rechazadas no cuestan nada a los servicios que hay detrás.

## Qué cuesta

Un límite fijado por debajo de la demanda real tira tráfico bueno, y uno demasiado alto no protege nada. Los límites por cliente necesitan una identidad contra la que contar, lo que cuesta una consulta. Una petición rechazada sigue siendo un error para quien llama, así que los clientes bien educados deben retroceder. La limitación de tasa no es [descarte de carga](/patterns/load-shedding): un límite mira quién envía, y el load shedding mira cuán lleno está el servidor.

## En Quorum

::Design{id="gateway-rate-limit"}

El límite es un ajuste de un API Gateway, elegido de una lista corta de tasas o desactivado. Es un único tope para todo el Gateway, no uno por cliente. Por encima del límite, el Gateway responde `throttled` y el Servidor de aplicaciones nunca ve esas peticiones, por lo que el pie de figura muestra errores por el límite y no por capacidad. El Gateway necesita [API Gateway](/research/api-gateway). [Limitación de tasa](/research/rate-limiting) añade un token bucket al Gateway, de modo que una ráfaga corta pasa entera mientras el promedio se mantiene en el límite. El glosario define la [limitación de tasa](/glossary/rate-limiting) y el [token bucket](/glossary/token-bucket). En una [Oleada de bots](/incidents/bot-surge) el tope frena a los Usuarios reales junto con los bots, así que la solución del juego es un WAF.
