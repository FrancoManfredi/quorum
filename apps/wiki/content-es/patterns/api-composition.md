---
title: Composición de API
summary: La composición de API responde una consulta que abarca varios servicios llamando a cada uno y uniendo los resultados en memoria.
section: patterns
group: Outside the game
order: 1007
aliases: api composition, gateway aggregation, aggregator, scatter gather, join across services, in-memory join, composición de API, agregación en el gateway, agregador, unión entre servicios, unión en memoria
---

La composición de API (API composition) responde una consulta cuyos datos viven en varios servicios haciendo que un compositor llame a cada dueño y una las respuestas en memoria. Cuando un gateway hace esto por un cliente, se llama agregación en el gateway (gateway aggregation).

Es la forma más simple de leer a través de las fronteras entre servicios, y encaja cuando cada llamada es barata y el resultado es pequeño. La página de un pedido necesita el pedido de un servicio, el cliente de otro y el estado del repartidor de un tercero. El compositor llama a los tres en paralelo y devuelve una sola respuesta, así que el cliente hace una petición en lugar de tres. Azure señala que esto reduce las conversaciones innecesarias en redes móviles lentas.

Se rompe cuando los datos crecen. Chris Richardson lo resume como uniones ineficientes en memoria de conjuntos de datos grandes, así que una consulta como "clientes con un pedido de más de $500 en el último año" no se puede ejecutar así. También multiplica los fallos: tres servicios al 99.9% dan una página con 99.7% de disponibilidad, y la llamada más lenta marca la latencia, que es el problema de la cola de [Latencia de cola](/patterns/tail-latency). Usa tiempos de espera y deja que la página se muestre sin las partes opcionales. Para consultas pesadas, mantén en su lugar un modelo de lectura precalculado.

## Lo más parecido en Quorum

El juego no tiene compositor, pero puedes construir la forma. Un [API Gateway](/components/gw) va delante de los Servidores de aplicaciones, y un Servidor de aplicaciones que llama a varios Nodos de datos espera a cada uno en secuencia, así que sus latencias se suman y sus tasas de éxito se multiplican. [Patrones de API gateway](/patterns/api-gateway-patterns) cubre la agregación en el borde. La alternativa a componer en el momento de la lectura es guardar la respuesta ya unida, como en [Vistas materializadas y desnormalización](/patterns/materialized-views-and-denormalization), y la página de [Tiempos de espera](/patterns/timeouts) cubre la protección que necesita cada llamada.

## Referencias

- [API Composition, microservices.io](https://microservices.io/patterns/data/api-composition.html): el patrón para consultas entre servicios, con su beneficio y su desventaja de unión en memoria.
- [Gateway Aggregation pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation): poner el compositor en un gateway para reducir clientes demasiado habladores.
- [The Tail at Scale, Dean and Barroso](https://cacm.acm.org/research/the-tail-at-scale/): por qué una petición que espera a muchos servidores se topa con el más lento de ellos.
