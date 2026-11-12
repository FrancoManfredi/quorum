---
title: Leer el p99 y la latencia de cola
summary: Lee el p99 en el HUD, en el Nodo Usuarios y en cada tarjeta, encuentra el tipo de petición y el Nodo que forman la cola, y elige el arreglo para su causa.
section: guides
order: 2
era: 1
aliases: p99, p95, p50, percentile, tail latency, slow requests, mean latency, latency, percentil, latencia de cola, peticiones lentas, latencia media, latencia
gdd: /design/12-observability
---

Usa esta guía cuando el Apdex está por debajo del objetivo pero la latencia media parece bien, o
cuando el p99 del HUD es mucho mayor que la media.

El p99 es el tiempo que 99 peticiones de cada 100 mejoran. El 1% más lento queda por encima. Una
media esconde ese 1%, pero tus usuarios lo sienten igualmente y pagan menos por ello. Mira
[Latencia y percentiles](/explanation/latency) para ver el motivo.

## Antes de empezar

Necesitas la Investigación [Percentiles](/research/percentiles). Se abre en la Era Pre-semilla y
necesita antes [Métricas](/research/metrics). Sin ella, el juego muestra solo la media.

## Lee el p99

1. Mira la cifra de latencia del HUD. Con Percentiles dice **p99**, y la media aparece al lado tras
   **μ**.
2. Compara los dos valores.
   - Si el p99 es unas pocas veces la media, la cola es normal para un Diseño ocupado.
   - Si el p99 es diez o más veces la media, una pequeña parte de las peticiones es muy lenta.
     Continúa con el paso 3.
3. Selecciona el Nodo **Usuarios**. Se abre el Inspector.
4. En la sección **Peticiones**, lee la línea bajo cada tipo de petición. Muestra la media, el p50, el
   p95 y el p99 de ese tipo.
5. Busca el tipo cuyas cifras salen en ámbar. Ámbar significa que su p99 supera su objetivo de Apdex.
   Una cifra en rojo significa que el tipo además falla a menudo.

Cada tipo tiene su propio objetivo. Una lectura de la API debe ser rápida. Un informe puede tardar
segundos. La [mezcla de peticiones de cada Era](/eras) lista los tipos que sirves.

## Encuentra el Nodo que forma la cola

1. Lee la fila **Latencia** de la tarjeta de cada Nodo. Con Percentiles muestra la media y luego el
   p99.
2. Sigue el camino del tipo lento desde el Nodo Usuarios hasta la capa de datos.
3. Encuentra el primer Nodo cuyo p99 se dispara muy por encima de su media.

## Empareja el patrón con la causa

Busca el patrón en la tabla, nombra la causa y aplica su arreglo.

| Lo que ves                                                                                                     | Causa                                                                                         | Arreglo                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El Nodo está en ámbar o rojo en Carga, y todos los tipos que atiende son lentos.                               | Cola de espera cerca de la capacidad total.                                                   | Añade capacidad. Mira [Encontrar el cuello de botella](/guides/find-the-bottleneck).                                                                                              |
| Un Servidor de aplicaciones Node.js tiene un p99 alto en todos los tipos, y los inicios de sesión están en él. | Una petición que usa mucha CPU bloquea el [bucle de eventos](/glossary/event-loop).           | Investiga el [Pool de hilos de libuv](/research/libuv-pool), coloca un [Proveedor de autenticación](/components/auth) o usa el [Modo clúster de Node.js](/research/node-cluster). |
| Un Servidor de aplicaciones Java o Go tiene un p50 normal y un p99 alto.                                       | [Pausas de recolección de basura](/glossary/gc-pause).                                        | Selecciona **Más grande** para tener más RAM. En Java, elige ZGC en **Colector** ([ZGC](/research/zgc)). En Go, cambia **GOGC** ([Ajuste del GC de Go](/research/gogc-tuning)).   |
| El p99 sube justo después de que arranquen copias Java nuevas.                                                 | [Calentamiento JIT](/glossary/jit-warmup): las copias nuevas funcionan despacio al principio. | Mantén las copias calientes con un mínimo mayor en el [Autoescalador](/components/autoscaler).                                                                                    |
| El p99 es alto solo en un Nodo al que llaman muchas peticiones.                                                | [Tail at scale](/glossary/tail-at-scale): un backend lento ralentiza toda la petición.        | Arregla primero ese backend.                                                                                                                                                      |

Después espera un poco de tiempo de juego y comprueba dos cosas: las cifras en ámbar bajo el Nodo
Usuarios vuelven a la normalidad, y el Apdex del HUD sube. Si el p99 no cambia, la causa está en otro
Nodo del camino, así que empieza de nuevo el recorrido desde el Nodo Usuarios.

:::Note{tone="tip"}
El p99 de un tipo importa más cuando supera el objetivo de ese tipo. Una petición más lenta que el
objetivo gana la mitad. Una petición cuatro veces más lenta que el objetivo no gana nada.
:::

## Mira la cola a lo largo del tiempo

- Pulsa **D** para abrir el Cuadro de mando. El gráfico **Latencia** dibuja la media con las líneas de
  p50, p95 y p99. Busca el momento en que el p99 se separó de las demás.
- Selecciona **Usuarios** en el HUD para abrir **Por qué se van los usuarios**. Una fila `lento`
  muestra el p99 del tipo frente a su objetivo, y nombra la parte del Apdex que te cuesta ese tipo.
- Investiga [Alertas](/research/alerting) para recibir un aviso cuando el p99 se mantiene alto.

El Sandbox [Bloqueo del bucle de eventos](/sandboxes/event-loop-stall) ejecuta Node.js con los inicios
de sesión en el mismo Servidor de aplicaciones, y mantienes el p99 por debajo de su límite cuando el
hash de contraseñas se vuelve más lento. Para la recolección de basura, prueba el Sandbox
[Pausas de GC](/sandboxes/gc-pauses).

::Sandbox{id="event-loop-stall"}

El glosario define [percentil](/glossary/percentile-p50-p95-p99),
[Apdex e ingresos](/explanation/apdex-and-revenue) explica cómo una petición lenta pierde dinero, y
[Conocimiento y observabilidad](/explanation/observability) explica qué te deja ver cada
Investigación.
