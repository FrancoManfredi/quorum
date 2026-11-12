---
title: Bulkhead
summary: Da a cada dependencia o cliente su propio pool de capacidad, para que una parte que falla no pueda vaciar los recursos que necesitan todas las demás.
section: patterns
group: Resilience
order: 504
aliases: bulkheads, isolation, noisy neighbor, blast radius, thread pool isolation, mamparo, aislamiento, vecino ruidoso, radio de impacto, aislamiento de pool de hilos
---

Un bulkhead (mamparo) divide la capacidad compartida en compartimentos separados, como las paredes del interior del casco de un barco.

## Cuándo usarlo

- Un solo pool de hilos, conexiones o workers atiende a varias dependencias.
- Una dependencia lenta puede agotar ese pool entero.
- Un inquilino o un tipo de tráfico puede desplazar al resto.

## Cómo funciona

Cada dependencia recibe su propio límite. Un servicio con 100 hilos de worker podría dar 30 a la llamada de búsqueda, 30 a los pagos y 40 a todo lo demás. Cuando la búsqueda se vuelve lenta, sus 30 hilos se llenan y las siguientes llamadas de búsqueda fallan rápido, mientras los otros 70 hilos siguen sirviendo páginas. Sin la división, la búsqueda se queda con los 100 y todo el servicio se detiene, aunque solo una función estaba rota.

La misma idea funciona a cualquier tamaño: pools de conexiones separados, colas separadas, despliegues separados por nivel de cliente, o celdas separadas que sirven cada una una porción de los usuarios.

## Qué cuesta

Los muros desperdician capacidad. Un compartimento puede quedar ocioso mientras su vecino está lleno, así que el total que necesitas crece. Los límites también hay que ajustarlos, porque un compartimento demasiado pequeño rechaza trabajo que el sistema podría haber atendido. Empieza por las dependencias con más probabilidad de colgarse.

## En Quorum

::Design{id="bulkhead-search"}

Un bulkhead es un ajuste de un Enlace, no del Servidor de aplicaciones. Impide que una llamada retenga el slot de quien la hace durante más de un tiempo corto fijo, así que un Motor de búsqueda lento hace fallar sus propias llamadas y libera el slot para las llamadas a la Base de datos y a Almacenamiento. El Enlace hacia la búsqueda lo lleva, y los demás Enlaces conservan su espera normal. La búsqueda está sana con la carga resuelta, así que el pie de imagen coincide con el mismo Diseño sin el bulkhead. [Bulkheads](/research/bulkheads) lo desbloquea y necesita [Circuit breakers](/research/circuit-breakers).

El bulkhead del juego limita cuánto tiempo puede una dependencia retener un slot, que es la misma idea de compartimento aplicada al tiempo. El [Pooler de conexiones](/components/pooler) protege un pool compartido de forma parecida. El glosario define [bulkhead](/glossary/bulkhead) y [radio de impacto](/glossary/blast-radius).
