---
title: Tiempos de espera
summary: Da a cada llamada de red un plazo, porque una llamada que espera para siempre retiene como rehenes un hilo, una conexión y un usuario.
section: patterns
group: Resilience
order: 501
aliases: timeout, deadline, hang, slow dependency, connect timeout, read timeout, tiempo de espera, plazo, bloqueo, dependencia lenta, tiempo de espera de conexión, tiempo de espera de lectura
---

Un tiempo de espera es un plazo en una llamada a otro servicio, y cada llamada de ese tipo necesita uno.

## Cuándo usarlo

- Un servicio llama a otro servicio, a una base de datos o a una API de terceros.
- Los llamadores retienen un recurso mientras esperan: un hilo, una conexión, un hueco de worker.
- Una dependencia puede ser lenta sin estar caída, que es el caso común.

## Cómo funciona

El llamador inicia un reloj cuando envía la petición. Si no llega respuesta a tiempo, se rinde, libera lo que retenía y falla o recurre a una alternativa. Fija el plazo a partir del p99 de la dependencia, no de su media. Un servicio que responde en 40 ms en el p50 y 300 ms en el p99 encaja con un tiempo de espera de 500 ms, que solo corta las llamadas atascadas.

Los plazos deberían reducirse a medida que una petición avanza hacia dentro. Si el navegador del usuario espera 3 segundos, el servicio frontal concede 2.5 a su llamador y 1 a la llamada a la base de datos, de modo que ninguna llamada interna sobreviva a la petición que la necesitó.

## Qué cuesta

Un tiempo de espera convierte una respuesta lenta en un error, así que un plazo demasiado corto hace fallar peticiones que habrían funcionado. Un plazo demasiado largo no hace nada: con 30 segundos en cada llamada, una base de datos lenta ata todos los hilos mucho antes de que venza el primero. Un tiempo de espera tampoco te dice si el trabajo terminó, así que un reintento posterior debe ser seguro de repetir (mira [Claves de idempotencia](/patterns/idempotency-keys)).

## En Quorum

::Design{id="link-timeout"}

El tiempo de espera es un ajuste del Enlace del Servidor de aplicaciones a la Base de datos. Un Enlace espera por defecto un tiempo largo y nunca reintenta hasta que tienes [Tiempos de espera y reintentos](/research/timeouts), que te permite elegir un plazo más corto. El Diseño fija el corto porque una Base de datos responde en milisegundos, así que el pie de figura coincide con un Enlace con la espera por defecto. Una llamada que pasa el plazo falla con un error `timeout`, y el hueco del llamador se libera en ese momento en lugar de más tarde.

[Detener una tormenta de reintentos](/guides/stop-a-retry-storm) muestra lo que hace un plazo bajo carga, y [Errores y reintentos](/explanation/errors-and-retries) muestra qué le pasa a la carga cuando los llamadores se rinden. El glosario define el [tiempo de espera](/glossary/timeout).
