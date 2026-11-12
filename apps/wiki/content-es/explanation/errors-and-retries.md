---
title: Errores y reintentos
summary: Por qué fallan las peticiones, cómo los tiempos de espera y los reintentos pueden convertir una ralentización breve en una caída larga, y por qué más Servidores de aplicaciones pueden romper la Base de datos.
section: explanation
order: 4
era: 1
aliases: errors, timeout, retry, retry storm, backoff, jitter, circuit breaker, connections, refused, max_connections, idempotency, duplicate, errores, tiempo de espera, reintento, tormenta de reintentos, conexiones, idempotencia, duplicado
gdd: /design/04-simulation
---

Una petición fallida no gana nada y cuenta como un usuario frustrado. Todo fallo tiene una causa, y cada
causa apunta a una solución distinta. Algunos fallos además crean más carga, y así es como un problema
pequeño se convierte en una caída.

## Todo fallo tiene una causa

Hasta que estudies [Logs estructurados](/research/logs), la pantalla muestra los errores como un solo
número. La investigación divide ese número por causa:

- `stranded`: ningún Nodo del camino acepta ese tipo.
- `dropped`: el Nodo superó su capacidad y no tenía espacio.
- `refused`: un límite dijo que no, como el límite de conexiones de la Base de datos.
- `down`: el Nodo está en una caída.
- `timeout`: quien llamaba dejó de esperar.
- `oom`: el proceso se quedó sin memoria y lo mataron.
- `crash`: un bug o un cuelgue tumbó la petición.
- `stale`: una lectura devolvió datos viejos donde el tipo necesita datos frescos.
- `blocked`: el WAF bloqueó por error a un usuario real.
- `upstream`: falló un servicio gestionado, como el Proveedor de pagos.
- `throttled`: un límite de tasa rechazó la petición.
- `duplicate`: un pago reintentado cobró la tarjeta dos veces.

Con esa división, "los errores han subido" pasa a ser una pregunta que puedes responder.

## Los tiempos de espera protegen a quien llama

Un Enlace espera una respuesta hasta que se cumple su tiempo de espera. Antes de la investigación
[Tiempos de espera y reintentos](/research/timeouts), todo Enlace espera 30 segundos y nunca reintenta.
Después, tú fijas el tiempo de espera y la política de reintentos de cada Enlace.

Un [tiempo de espera](/glossary/timeout) es un intercambio. En un runtime que reserva un slot por
petición, quien llama conserva su slot hasta que la llamada responde o vence. Un tiempo de espera corto
libera el slot antes, así que una sola Base de datos lenta no puede llenar todos los Servidores de
aplicaciones. El precio es que las llamadas lentas fallan en lugar de terminar tarde, y el trabajo que
quien recibía la llamada ya hizo para ellas se desperdicia, porque nadie usa la respuesta.

## Los reintentos multiplican la carga

Un reintento convierte un fallo en otro intento. Con reintentos ingenuos, un Enlace reintenta de inmediato,
hasta tres veces. Si una proporción `f` de las llamadas falla, cada llamada se convierte en este número de
intentos:

```latex
\text{attempts} = 1 + f + f^{2} + f^{3}
```

Con una tasa de fallos del 50%, eso es casi el doble de carga para quien recibe la llamada. Fallaba porque
estaba sobrecargado, así que los reintentos le entregan casi el doble de trabajo.

::Quiz{question="Un Enlace reintenta de inmediato, hasta tres veces. La mitad de sus llamadas falla. ¿Aproximadamente cuánta carga recibe ahora quien responde, comparado con no tener reintentos?" options="1.5 veces|Casi 2 veces|4 veces" answer="2" explain="Los intentos por llamada son 1 + 0.5 + 0.25 + 0.125, que son cerca de 1.9. La carga casi se duplica justo cuando quien responde menos puede soportarla."}

## Cómo una tormenta de reintentos sobrevive a su causa

Los reintentos forman un bucle de retroalimentación: la sobrecarga causa fallos, los fallos causan
reintentos y los reintentos causan más sobrecarga. La Simulación arrastra la proporción de fallos de cada
Enlace que reintenta al siguiente Paso, así que el bucle sigue por su cuenta.

En el incidente [Tormenta de reintentos](/incidents/retry-storm), la Base de datos se ralentiza durante un
rato breve. Con reintentos ingenuos, la carga se mantiene por encima de su capacidad cuando la
ralentización termina, y la Base de datos encola lo que no puede atender. El incidente termina solo cuando
ese retraso acumulado se drena. Es un [fallo metaestable](/glossary/metastable-failure): el sistema tiene
dos estados estables, y el malo se sostiene a sí mismo.

::Sandbox{id="retry-storm"}

Tres herramientas rompen el bucle:

- [Backoff con jitter](/research/backoff-jitter) espera antes de cada reintento, con un retraso aleatorio,
  y mantiene las llamadas extra dentro de un pequeño presupuesto de reintentos. Durante una tormenta, la
  mayoría de los fallos no se reintentan.
- [Circuit breakers](/research/circuit-breakers) detienen las llamadas de un Enlace cuando la mayoría
  falla. El breaker hace fallar las llamadas de inmediato durante unos segundos y luego vuelve a probar.
- [Descarte de carga por prioridad](/research/load-shedding) descarta los tipos de menor valor en un
  Servidor de aplicaciones sobrecargado, para que las peticiones que conserva sigan siendo rápidas.

:::Note{tone="real"}
Bronson y otros describieron los fallos metaestables en HotOS 2021, y Huang y otros los midieron en caídas
reales en OSDI 2022. Los proveedores de nube aconsejan backoff exponencial con jitter para todo cliente, y
muchos servicios además limitan los reintentos con un presupuesto.
:::

Para una solución paso a paso durante la partida, mira [Detener una tormenta de reintentos](/guides/stop-a-retry-storm).

## Conexiones: por qué más servidores pueden romper la Base de datos

La Base de datos ejecuta un proceso por conexión, así que acepta solo un número limitado de ellas. Cada
proceso de Servidor de aplicaciones tiene su propio pool de conexiones, y la Base de datos necesita la suma
de todos los pools.

Así que añadir Servidores de aplicaciones sube la necesidad. Pasado el límite, las consultas extra fallan
como `refused`, y la solución que aplicaste para la CPU rompe la Base de datos. El incidente
[Agotamiento de conexiones](/incidents/connections) lo empeora al duplicar cada pool.

Un [Pooler de conexiones](/components/pooler) lo arregla. En modo transacción, muchas conexiones de la app
comparten unas pocas conexiones del servidor. El precio es que se rompe el código que guarda estado de
sesión, hasta que despliegas la tarea que lo elimina. Mira [pooling de conexiones](/glossary/connection-pooling).

::Sandbox{id="connection-limit"}

## Reintentos y dinero

Un pago no debe ejecutarse dos veces. Envía un cobro al Proveedor de pagos, y si el cobro vence y el Enlace
reintenta, puede que el primer intento ya haya tenido éxito. El cliente paga dos veces y la petición falla
como `duplicate`.

La investigación [Claves de idempotencia](/research/idempotency-keys) y la tarea de ingeniería Claves de
idempotencia que la lleva al código dan a cada cobro una clave, de modo que un reintento nunca cobra dos
veces. Sin ellas, fija los reintentos del Enlace de cobro en ninguno. Mira [idempotencia](/glossary/idempotency)
y el incidente [Cobro duplicado](/incidents/double-charge).
