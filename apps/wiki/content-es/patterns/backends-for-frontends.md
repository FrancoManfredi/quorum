---
title: Backends para frontends
summary: Backends for frontends da a cada tipo de cliente, como web, iOS y Android, su propio backend pequeño en lugar de una API compartida.
section: patterns
group: Outside the game
order: 1006
aliases: bff, backend for frontend, backends for frontends, mobile backend, api per client, edge service, backend para frontend, backends para frontends, backend móvil, API por cliente
---

Backends for frontends (BFF) pone un backend hecho a medida entre cada tipo de cliente y tus servicios, para que una app móvil y una app web no tengan que compartir una API pensada para ninguna de las dos.

Úsalo cuando los clientes quieren cosas distintas de los mismos datos. Sam Newman, que bautizó el patrón en 2015, partió del móvil: un teléfono muestra menos en pantalla, quiere llamadas menos numerosas y más pequeñas, y tiene un ciclo de lanzamientos distinto al de la app web. Una API general atiende mal a ambos, ya que cada equipo pide cambios que el otro debe revisar. Con un BFF, el equipo móvil es dueño de un backend que llama a tres servicios y devuelve exactamente una carga recortada.

El coste es más código que operar. Cada BFF necesita despliegues, monitorización y un responsable, y la lógica que todos los clientes necesitan, como las reglas de autenticación, tiende a copiarse entre ellos. Azure lo desaconseja cuando todas las interfaces hacen las mismas llamadas. La regla habitual es que un equipo sea dueño de un cliente y de su BFF, y que el comportamiento compartido viva en los servicios de debajo.

## Lo más parecido en Quorum

El juego tiene la puerta de entrada, no una por cliente. El [API Gateway](/components/gw) es un único punto de entrada que limita la tasa y enruta cada tipo de petición al grupo de Servidores de aplicaciones que elijas, lo que reparte el tráfico por tipo de petición, no por cliente. Lee [Patrones de API gateway](/patterns/api-gateway-patterns) para ver dónde encaja el BFF, e investiga [API Gateway](/research/api-gateway) para desbloquear el Componente.

## Referencias

- [Backends For Frontends, Sam Newman](https://samnewman.io/patterns/architectural/bff/): el texto original, con la motivación móvil.
- [Backends for Frontends pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends): cuándo usarlo y los inconvenientes del código duplicado.
- [API Gateway / Backends for Frontends, microservices.io](https://microservices.io/patterns/apigateway.html): compara un único gateway con uno por cliente.
