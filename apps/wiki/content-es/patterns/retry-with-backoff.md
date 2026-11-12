---
title: Reintentos con backoff y jitter
summary: Reintenta una llamada fallida tras una espera creciente y aleatoria, para que un fallo breve se cure en lugar de convertirse en una tormenta de reintentos.
section: patterns
group: Resilience
order: 502
aliases: retry, backoff, jitter, exponential backoff, retry storm, thundering herd, retry budget, reintento, backoff exponencial, tormenta de reintentos, efecto estampida, presupuesto de reintentos
---

Un reintento cura un fallo breve solo si espera más cada vez y varía la espera, porque los llamadores que reintentan a la vez mantienen caída a una dependencia en apuros.

## Cuándo usarlo

- Una llamada falla por una razón que puede pasar: una conexión caída, un despliegue, una sobrecarga breve.
- Es seguro repetir la llamada.
- Muchos llamadores hablan con la misma dependencia, así que sus reintentos se suman.

## Cómo funciona

El llamador espera un retraso base tras el primer fallo y lo duplica tras cada uno, hasta un tope: 100 ms, 200 ms, 400 ms. El jitter elige un punto aleatorio dentro de esa ventana, de modo que mil llamadores que fallaron juntos no vuelven juntos. Un presupuesto de reintentos limita los reintentos a una parte del tráfico normal, digamos el 10%, y se detiene cuando se agota el presupuesto.

Sin backoff la aritmética es cruel. Una base de datos que se ralentiza durante 20 segundos, tras llamadores que reintentan 3 veces de inmediato, recibe hasta 4 llamadas por cada petición. La lentitud termina y la carga no.

## Qué cuesta

Cada reintento es carga extra sobre una dependencia que ya está en apuros. El backoff la suaviza y un presupuesto la acota, pero ninguno la elimina, y los reintentos en varias capas se multiplican: 3 intentos en cada una de 3 capas son 27 llamadas para una petición. Reintenta en una sola capa, normalmente la más cercana al usuario. Combina los reintentos con un [circuit breaker](/patterns/circuit-breaker) para el caso en que el fallo no pase.

## En Quorum

Los dos Diseños de abajo ponen el mismo tiempo de espera corto en un Enlace hacia una Base de datos infradimensionada. Solo cambia la política de reintentos.

::Design{id="retries-naive"}

Con reintentos **Ingenuos**, cada llamada fallida se envía de nuevo al instante. El pie de figura muestra el daño como errores y una cola larga, porque la Base de datos recibe más llamadas de las que enviaron los Usuarios.

::Design{id="retries-backoff"}

Con **Backoff**, los reintentos esperan y se reparten, y las llamadas extra se quedan dentro de un presupuesto pequeño. El Apdex sube y el p99 baja respecto al primer Diseño, aunque la Base de datos sigue siendo demasiado pequeña y sigue descartando peticiones. El backoff limita el daño, y solo la capacidad arregla la causa. El backoff necesita [Backoff con jitter](/research/backoff-jitter) además de [Tiempos de espera y reintentos](/research/timeouts).

El incidente [Tormenta de reintentos](/incidents/retry-storm) muestra el fallo, y [Detener una tormenta de reintentos](/guides/stop-a-retry-storm) explica la solución paso a paso. El glosario define los [reintentos con backoff y jitter](/glossary/retry-with-backoff-and-jitter) y el [efecto estampida](/glossary/thundering-herd).
