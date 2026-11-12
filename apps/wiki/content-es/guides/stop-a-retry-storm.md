---
title: Detener una tormenta de reintentos
summary: Termina una Tormenta de reintentos cortando los reintentos que mantienen sobrecargada la Base de datos, y fija timeouts, backoff y circuit breakers para que la próxima ralentización sea pequeña.
section: guides
order: 6
era: 3
aliases: retry storm, retries, metastable failure, timeout, backoff, jitter, circuit breaker, cascade, tormenta de reintentos, reintentos, fallo metaestable, tiempo de espera, cascada
gdd: /design/11-incidents
---

Usa esta guía cuando corre un incidente de [Tormenta de reintentos](/incidents/retry-storm), o cuando
los errores siguen altos después de que pase una ralentización de la Base de datos.

En una tormenta de reintentos, la Base de datos se ralentiza durante 20 segundos. Los llamadores
agotan el tiempo y reintentan a la vez, así que la Base de datos recibe varias llamadas por cada
petición. La ralentización termina, pero los reintentos mantienen llena la Base de datos. Es un
[fallo metaestable](/glossary/metastable-failure): el estado de sobrecarga se sostiene solo. El
incidente termina solo cuando la Base de datos ha drenado su cola pendiente.

## Antes de empezar

Los ajustes de llamada necesitan [Tiempos de espera y reintentos](/research/timeouts). Hasta que la
tengas, cada Enlace espera 30 segundos y nunca reintenta. **Backoff** necesita
[Backoff con jitter](/research/backoff-jitter), y **Circuit breaker** necesita
[Circuit breakers](/research/circuit-breakers).

El director elige este incidente sobre todo cuando un Enlace hacia la Base de datos usa **Reintentar 3×**.

## Reconoce la tormenta

- La fila Carga de la Base de datos sigue en rojo pasados los primeros segundos del incidente.
- La proporción de errores del HUD sigue alta, sobre todo `timeout` en **Errores por causa** del Nodo
  Usuarios.
- Con [Alertas](/research/alerting), salta el aviso por errores.

## Páralo ahora

1. Pulsa **Espacio** para pausar, si necesitas tiempo.
2. Selecciona el primer Servidor de aplicaciones que enlaza a la Base de datos. Se abre el Inspector.
3. Abre la sección **Llamadas**. Lista cada Enlace que sale del Servidor de aplicaciones por el Nodo
   en su extremo.
4. Bajo **Base de datos**, cambia **Reintentar 3×** a **Backoff**. Con backoff, los reintentos esperan
   y se reparten, dentro de un presupuesto de un 10% más de llamadas. Si no tienes Backoff,
   selecciona **Sin reintentos**.
5. Si tienes Circuit breakers, selecciona **Circuit breaker** bajo el mismo Enlace. Un breaker se abre
   cuando falla la mitad de las llamadas del Enlace. No envía nada durante 5 segundos y falla rápido,
   y luego lo intenta de nuevo.
6. Repite los pasos 2 a 5 para cada Servidor de aplicaciones y Worker que llame a la Base de datos.
7. Si tienes [Descarte de carga por prioridad](/research/load-shedding), abre **Sobrecarga** en cada
   Servidor de aplicaciones y selecciona **Descartar lo menos valioso**. Los Servidores de
   aplicaciones descartan primero los tipos más baratos, así que llega menos trabajo a la Base de
   datos.
8. Reanuda el juego y vigila la fila Carga de la Base de datos.

Si la fila Carga baja y la proporción de errores cae por debajo del 1%, la cola pendiente se está
drenando. El incidente termina cuando queda vacía.

Si la Carga sigue en rojo, la Base de datos también es demasiado pequeña para la carga normal.
Selecciona **Más grande** en la Base de datos, o mira [Escalar la base de datos](/guides/scale-the-database).

:::Note{tone="warn"}
Un timeout más corto no detiene una tormenta. Un timeout de **1 s** con **Reintentar 3×** se rinde
pronto y vuelve a enviar la llamada, lo que añade carga. Usa un timeout corto solo con Backoff o un
Circuit breaker.
:::

## Previene la siguiente

- Fija cada Enlace hacia un Nodo de datos en **Backoff**, no en **Reintentar 3×**.
- Añade un **Circuit breaker** en los Enlaces hacia Nodos que pueden ralentizarse: la Base de datos, un
  Motor de búsqueda y el Proveedor de pagos.
- Fija **Descartar lo menos valioso** en cada Servidor de aplicaciones como valor por defecto.
- Mantén capacidad de reserva en la Base de datos. Una tormenta crece solo cuando la Base de datos
  ralentizada no da abasto con sus reintentos.
- Acepta el elemento de acción cuando llegue el Correo del postmortem. El mensaje de Tormenta de
  reintentos ofrece primero Backoff con jitter, luego Circuit breakers y luego Descarte de carga por
  prioridad.

:::Note{tone="tip"}
Los reintentos al Proveedor de pagos tienen su propio riesgo. Un cobro que agotó el tiempo y se
vuelve a enviar puede cobrar dos veces. Investiga [Claves de idempotencia](/research/idempotency-keys)
antes de reintentar checkouts.
:::

Cuando la cola pendiente se vacía, tres cosas lo confirman: `timeout` bajo **Errores por causa** en el
Nodo Usuarios se mantiene cerca de cero, el gráfico **Errores** del Cuadro de mando vuelve a bajar de
su regla del 1% tras la línea roja del incidente, y el Apdex del HUD vuelve a su objetivo.

El Sandbox [Tormenta de reintentos](/sandboxes/retry-storm) empieza con cada llamada de Servidor de
aplicaciones a la Base de datos fijada en un timeout de 1 s y **Reintentar 3×**, y ralentiza la Base
de datos dos veces. La segunda vez, además debes mantenerte por debajo de un límite de Gasto.
[Errores y reintentos](/explanation/errors-and-retries) explica por qué se multiplica la carga, y el
glosario define [reintentos con backoff y jitter](/glossary/retry-with-backoff-and-jitter),
[circuit breaker](/glossary/circuit-breaker) y [tiempo de espera](/glossary/timeout).
