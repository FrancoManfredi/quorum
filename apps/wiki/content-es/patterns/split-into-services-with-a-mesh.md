---
title: Divide en servicios con una malla
summary: Rompe una base de código en Servicios sobre un Clúster de Kubernetes y pon un Service mesh a su lado, para que cada uno se despliegue por separado y cada llamada tenga reintentos, un breaker y métricas.
section: patterns
group: Scaling steps
order: 129
aliases: microservices, service mesh, istio, sidecar, mtls, service boundaries, kubernetes, per service deploy, blast radius, microservicios, malla de servicios, fronteras de servicio, despliegue por servicio, radio de impacto
---

Divide el monolito en Servicios que se despliegan por separado, y ejecútalos en un Clúster con un Service mesh.

## Cuándo dar el paso

- Un mal despliegue rompe todos los tipos de petición, porque todo sale junto.
- Los equipos se bloquean entre sí, porque una base de código tiene una sola versión.
- No puedes saber qué servicio llamó a cuál, y cada llamada necesita los mismos ajustes de reintentos y breaker.

## El Diseño

::Design{id="mesh-services"}

Un API Gateway envía cada tipo de petición a uno de dos Servidores de aplicaciones. Ambos llaman a la Base de datos y se enlazan al Clúster y a la Malla. Esos dos Nodos no llevan tráfico.

## Por qué funciona

Cada Servidor de aplicaciones representa un Servicio, así que un mal despliegue de uno rompe solo sus propios tipos. La malla pone un sidecar junto a cada miembro. Eso añade TLS mutuo, reintentos y un circuit breaker a cada Enlace que sale de él, y métricas por Enlace, incluso antes de la investigación correspondiente. Un Enlace que configuras tú mismo conserva tu política.

El sidecar va en el pod, así que un Servicio debe ejecutarse antes en un Clúster. El juego rechaza el enlace en caso contrario.

## Qué cuesta

La malla añade latencia a cada salto y se lleva una parte de la CPU del miembro, y factura una parte del Gasto de sus miembros. El Clúster y la malla se llevan cada uno horas de desarrollo de los Equipos de producto, a menos que un equipo de Plataforma los gestione. En una Empresa, un Servicio nuevo además necesita [Fronteras de servicio](/research/service-boundaries), un Equipo y una canalización de despliegue propios. La imagen de aquí solo divide el tráfico por tipo. Los reintentos en cada Enlace también pueden alimentar una [Tormenta de reintentos](/incidents/retry-storm).

## En Quorum

Coloca un [Service mesh](/components/mesh) y un [Clúster de Kubernetes](/components/cluster), y luego enlaza Servidores de aplicaciones a ambos. Investiga [Orquestación de contenedores](/research/containers) y [Service mesh](/research/service-mesh). Lee [orquestación de contenedores](/glossary/container-orchestration) y [radio de impacto](/glossary/blast-radius). El siguiente paso, [multirregión con GeoDNS](/patterns/multi-region-with-geodns), pone copias cerca de los usuarios lejanos.
