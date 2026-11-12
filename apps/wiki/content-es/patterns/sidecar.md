---
title: Sidecar
summary: Un sidecar se ejecuta junto a la aplicación principal en su propio proceso o contenedor y se ocupa de tareas compartidas como el registro, el proxy y la seguridad.
section: patterns
group: Outside the game
order: 1004
aliases: sidecar, sidekick, proxy, envoy, istio, linkerd, service mesh, ambassador, embajador, malla de servicios
---

Un sidecar es un proceso o contenedor auxiliar desplegado junto a una aplicación que comparte su ciclo de vida, de modo que puede añadir funciones sin tocar el código de la aplicación.

Recurre a él cuando muchos servicios en distintos lenguajes necesitan la misma tarea. Un equipo ejecuta Go y otro Ruby, y ambos necesitan TLS mutuo, reintentos y métricas. Un proxy junto a cada uno, como Envoy en una malla Istio, lo hace una sola vez para todos, y las llamadas de la aplicación pasan por él sin cambios de código. Azure también señala el aislamiento: una caída en el auxiliar no tumba el proceso de la aplicación, y los dos pueden usar lenguajes distintos y publicar versiones por separado.

Los costes son reales. Cada sidecar usa CPU y memoria en cada instancia, y Azure señala que el salto adicional añade latencia. Ahora ejecutas y actualizas una segunda cosa por pod, y un bug en el proxy afecta a todos los servicios a la vez. También es excesivo para un solo servicio, donde una biblioteca es más sencilla.

## Lo más parecido en Quorum

El juego construye este. El [Service mesh](/components/mesh) pone un proxy sidecar junto a cada Servidor de aplicaciones y Worker que se enlaza a él, les da reintentos, un circuit breaker y métricas, y les cobra la CPU y un salto por ello. Necesita la Investigación [Service mesh](/research/service-mesh), y solo los servicios que se ejecutan en un [Clúster de Kubernetes](/components/cluster) reciben un sidecar. [Divide en servicios con una malla](/patterns/split-into-services-with-a-mesh) muestra el paso, y [Circuit breaker](/patterns/circuit-breaker) es una de las funciones que reparte.

## Referencias

- [Sidecar pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/sidecar): la definición, los beneficios del aislamiento y la latencia adicional.
- [Ambassador pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/ambassador): un sidecar que hace de proxy de las llamadas salientes de un servicio.
- [Istio architecture](https://istio.io/latest/docs/ops/deployment/architecture/): cómo una malla real separa un plano de datos de proxies sidecar de un plano de control.
