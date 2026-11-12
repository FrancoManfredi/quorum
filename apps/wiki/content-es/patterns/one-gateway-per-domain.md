---
title: Un gateway por dominio: Uber
summary: Uber agrupó 2,200 microservicios críticos en dominios, puso un gateway delante de cada uno y usó una malla para las llamadas entre ellos.
section: patterns
group: Ran in production
order: 961
aliases: uber, doma, microservices, api gateway, service mesh, domain oriented, layers, microservicios, orientado a dominios, capas
---

En 2020 Uber ejecutaba 2,200 microservicios críticos. La Domain-Oriented Microservice Architecture los agrupa en dominios, cada uno con una API y un responsable, y pone un gateway delante del dominio. Quien llama depende del gateway, no de cada servicio que hay detrás.

## El sistema

DOMA ordena los dominios en capas. La capa de infraestructura responde por el almacenamiento y la red, la capa de negocio contiene las capacidades compartidas entre productos, y la capa de producto contiene los servicios que llama un pasajero o un conductor. Un dominio no puede depender de un dominio que esté por encima, así que el grafo tiene una sola dirección. Cada dominio expone una API, y su gateway es la única entrada que necesita quien llama. Un service mesh añade reintentos, circuit breakers, TLS mutuo y métricas por llamada entre los servicios.

## El tablero

::Design{id="uber-domain-gateway"}

El Balanceador de carga reparte el tráfico entre los gateways. El API Gateway representa la entrada de un dominio. En el tablero valida el token una vez y envía la llamada al Servidor de aplicaciones, que representa los servicios del dominio. La Base de datos pertenece al dominio. El Clúster de Kubernetes y el Service mesh son Nodos de control y no llevan tráfico.

## Por qué funciona

Un gateway por dominio significa que quien llama tiene un contrato que aprender y un responsable al que llamar, y un cambio dentro del dominio no le llega. La malla hace que cada llamada entre servicios lleve la misma política de reintentos, breaker y métricas. [Divide en servicios con una malla](/patterns/split-into-services-with-a-mesh) y [patrones de API gateway](/patterns/api-gateway-patterns) cubren las dos piezas.

## Hasta dónde llega el juego

El tablero tiene un dominio, no 2,200 servicios y cinco capas. No puede mostrar la regla de capas, la propiedad de los dominios ni las capas de producto y de negocio. El pie de figura es el resultado de Quorum, no el tráfico de Uber.

## Fuentes

- [Introducing Domain-Oriented Microservice Architecture, Uber Engineering](https://www.uber.com/blog/microservice-architecture): los dominios, las cinco capas, el gateway y los 2,200 servicios.
- [The Uber Engineering Tech Stack, Part I: The Foundation, Uber Engineering](https://www.uber.com/blog/tech-stack-part-one-foundation): los servicios, el almacenamiento y el descubrimiento que hay debajo de DOMA.
- [Istio architecture, Istio](https://istio.io/latest/docs/ops/deployment/architecture/): cómo un plano de datos de sidecars y un plano de control se reparten el trabajo de una malla.
