---
title: Encontrar el cuello de botella
summary: Encuentra el Nodo que limita tu Diseño, averigua qué recurso está lleno y por qué, y elige el arreglo que mueve el límite.
section: guides
order: 1
aliases: bottleneck, slow design, red node, amber node, limit, saturation, hottest node, high load, busy node, why is my node slow, load change, amplification, work share, cost receipt, cost per request, what if, cuello de botella, saturación, nodo rojo, nodo ámbar, carga alta, nodo lento, amplificación, coste por petición
gdd: /design/04-simulation
---

Usa esta guía cuando el Apdex cae por debajo de su objetivo, los usuarios se van y no sabes qué Nodo
arreglar. Si nunca has arreglado un límite,
[Tu primer cuello de botella](/tutorials/first-bottleneck) enseña el mismo ciclo paso a paso.

Un Diseño es tan rápido como su Nodo más lento. Ese Nodo es el
[cuello de botella](/explanation/queues), y añadir capacidad en cualquier otro sitio cuesta Caja y no
cambia nada.

## Encuentra el Nodo

1. Busca el Nodo con un contorno ámbar que pulsa. Solo un Nodo lo tiene a la vez.
2. Selecciona ese Nodo. Se abre el Inspector.
3. Lee la fila **Carga**. Muestra la [utilización](/glossary/utilization) de ese Nodo, como en
   "85% de 120/s".
4. Compara el color de la fila con estos límites:
   - Normal: menos del 70%. El Nodo está sano.
   - Ámbar: 70% o más. El tiempo de espera sube rápido.
   - Rojo: 90% o más. La latencia de cola es varias veces la mediana.

El juego vuelve a comprobarlo una vez por segundo: prueba cada uno de los Nodos más ocupados con el
doble de capacidad y marca el que más ingresos aporta. Solo los Nodos con más del 60% de carga pueden
recibir la marca.

Si ningún Nodo tiene el contorno, la capacidad no limita tus ingresos, así que ve a "Cuando no hay
marca" más abajo.

## Encuentra el recurso lleno

1. En el Inspector, lee la sección **Recursos** del Nodo cuello de botella.
2. Busca el medidor más cercano a estar lleno. Usa la tabla para elegir el arreglo.

| Medidor lleno                  | Qué significa                                                                    | Arreglo                                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| CPU                            | El Nodo hace demasiado trabajo por petición.                                     | Selecciona **Más grande**, o coloca una segunda copia detrás de un [Balanceador de carga](/components/lb).         |
| Workers ocupados, con CPU baja | Cada petición retiene un worker mientras espera a un Nodo más lento aguas abajo. | Arregla el Nodo que esperan las peticiones. O selecciona **Más workers** si en la RAM **caben** más.               |
| RAM                            | El proceso está cerca de su límite de memoria.                                   | Selecciona **Menos workers**, selecciona **Más grande**, o elige la familia **Memoria**.                           |
| Créditos de CPU                | Una máquina Burstable gastó sus créditos y funciona con una fracción de su CPU.  | Elige la familia **General** o **Cómputo**.                                                                        |
| Conexiones                     | La Base de datos está en su límite de conexiones.                                | Coloca un [Pooler de conexiones](/components/pooler). Mira [Escalar la base de datos](/guides/scale-the-database). |

Un medidor "Workers ocupados" lleno con la CPU baja es la trampa más común: el Servidor de
aplicaciones parece lleno, pero la parte lenta es la Base de datos que tiene detrás. Es la
[ley de Little](/glossary/littles-law): una petición que espera más retiene su worker más tiempo.

## Averigua por qué está ocupado

Un medidor lleno dice qué recurso se agotó, no por qué. La carga sube por una de tres razones: llegan
más peticiones, cada petición cuesta más, o el Nodo tiene menos capacidad. Cada razón tiene arreglos
distintos, así que busca la razón antes de comprar nada. La sección **Tráfico y carga** del
Inspector tiene un bloque para cada pregunta, y el enlace **¿Por qué?** de cada bloque abre su parte
de esta página.

### Lee el Cambio de carga

**Cambio de carga** compara el Nodo ahora con una hora de calendario antes.

- **Más tráfico** significa que creció la demanda. El arreglo es capacidad: un tamaño mayor, una
  segunda copia detrás de un [Balanceador de carga](/components/lb), o una [Caché](/components/cache)
  delante para que lleguen menos peticiones.
- **Cada petición cuesta más** significa que las mismas peticiones se hicieron más pesadas. Más
  capacidad lo oculta hasta que el tráfico vuelve a crecer, así que lee el bloque **Coste por
  petición** para ver qué cambió.
- **Menos capacidad** significa que el Nodo perdió margen: cayó una copia, una máquina Burstable se
  quedó sin créditos, o un reinicio dejó el Nodo en frío.

Con [Métricas](/research/metrics), el bloque divide el cambio en puntos de demanda, coste por
petición y capacidad, y suman el cambio. Una línea discontinua en el gráfico marca cada momento en que
el coste por petición dio un salto. Selecciona ese punto para leer la muestra de justo después del
salto.

### Lee la Amplificación

Con [Trazado distribuido](/research/tracing), **Amplificación** lista los tipos de petición de los
Usuarios detrás del tráfico del Nodo, como en "300/s × 4.0 = 1,200/s": un `checkout` de los Usuarios
se convierte aquí en cuatro llamadas.

- **Un multiplicador por debajo de 1** significa que la mayoría de esas peticiones nunca llega a este
  Nodo: una Caché las respondió, su ruta no lo llama, o un Nodo anterior las descartó.
- **Un multiplicador grande** en un tipo apunta al código, no al Nodo. Un ORM que envía una consulta
  por fila es una [consulta N+1](/glossary/n1-query), y la [Carga anticipada](/research/eager-loading)
  las junta en una.
- **Reintentos y hedges** es la parte del tráfico que es un segundo intento. Cuando sube mientras el
  Nodo falla llamadas, es una [Tormenta de reintentos](/incidents/retry-storm): fija **Backoff** y
  **Circuit breaker** en los Enlaces hacia el Nodo. [Detener una tormenta de reintentos](/guides/stop-a-retry-storm)
  lo recorre paso a paso.
- **Fallos de caché** es la parte que llegó a través de una Caché o un CDN que no tenía la respuesta.
  Una parte alta tras un reinicio es una Caché en frío. Una parte alta que se mantiene significa que
  la Caché es demasiado pequeña o su TTL demasiado corto.

**Llamada más lenta** nombra el Nodo al que este llama que más tarda. En un Servidor de aplicaciones
con **Workers ocupados** lleno, arregla primero ese Nodo.

### Lee el recibo de coste

Con [Profiling continuo](/research/profiling), cada operación bajo **Operaciones entrantes** muestra su
cuota de trabajo junto a su cuota de tráfico: cuánto del recurso limitante se lleva. Una operación
rara puede llevarse la mayor parte. **Coste por petición** lista las operaciones, la más cara primero.
Abre una para leer su recibo de coste: el coste base y luego cada factor que lo multiplica. Un factor
por encima de 1 sale en ámbar, y un factor por debajo de 1 es un arreglo que ya tienes.

| Línea                                     | De dónde viene                                                  | Qué la quita                                                                                                                                            |
| ----------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hinchazón de tablas                       | Filas muertas que VACUUM aún no ha limpiado.                    | Pasa la [Bloat de tabla](/incidents/table-bloat). Una ventana de [Políticas de retención](/research/retention) o un motor MySQL lo previene.            |
| Shard caliente                            | La clave de un tenant grande en un solo shard.                  | [Shard caliente del tenant grande](/incidents/hot-shard): [Sharding](/research/sharding) con una clave mejor, o [Caché](/research/caching).             |
| Escaneo sin índice                        | Una consulta que lee toda la tabla.                             | [Consulta lenta](/incidents/slow-query): el [Análisis de consultas](/research/query-analysis) encuentra el índice que falta.                            |
| Escaneos de informes en la caché de búfer | Los informes sacan las páginas calientes de la RAM.             | Mueve los informes a un [Almacén de datos](/components/warehouse). Mira [El informe tumba la Base de datos](/incidents/report-db).                      |
| Conjunto de trabajo en disco              | Los datos ya no caben en RAM.                                   | Un tamaño mayor o la familia **Memoria**, o una [Réplica de lectura](/components/replica) para las lecturas.                                            |
| Funcionalidades                           | Funcionalidades entregadas que hacen más pesadas las consultas. | El coste de la Funcionalidad. La [Desnormalización](/research/denormalization) abarata las lecturas.                                                    |
| Índices                                   | Cada índice que añadió el Equipo ralentiza cada escritura.      | El precio de leer más rápido. Añade un índice solo para una consulta que lo necesite.                                                                   |
| Fan-out de shards                         | Una búsqueda o un informe pregunta a todos los shards.          | Un Nodo [Motor de búsqueda](/components/search) para las búsquedas, un Almacén de datos para los informes.                                              |
| Arranque en frío                          | Un reinicio, o un runtime JIT que aún no se ha calentado.       | Espera, o mira [Calentamiento de JVM bajo carga](/incidents/jvm-warmup).                                                                                |
| Recolección de basura                     | El heap está casi lleno.                                        | Más RAM, o un colector mejor: [ZGC](/research/zgc), [Ajuste del GC de Go](/research/gogc-tuning). Mira [Tormenta de pausas de GC](/incidents/gc-storm). |
| Swap                                      | Al proceso se le acaba la RAM.                                  | **Menos workers**, un tamaño mayor o la familia **Memoria**.                                                                                            |
| Runtime, Framework                        | La velocidad del Stack y su sobrecarga por petición.            | [Elegir un stack](/guides/choose-a-stack).                                                                                                              |
| Serialización                             | Cada llamada que hace el código se codifica al salir.           | Menos llamadas, o [RPC binario entre servicios](/research/binary-rpc).                                                                                  |
| Muestreo de Analítica                     | Una toma de Analítica muestrea este Nodo.                       | Una tasa de muestreo menor en el Nodo [Analítica](/components/analytics).                                                                               |
| Vecinos ruidosos                          | El Mutador Tenencia compartida presta tus núcleos a otros.      | Nada: va y viene.                                                                                                                                       |

### Prueba un ¿Y si…?

Con [Profiling continuo](/research/profiling), un Nodo seleccionado que está en ámbar o rojo muestra
filas **¿Y si…?**: su carga tras un cambio que puedes hacer ya, como **Más grande** en este Nodo, en la
Caché que tiene delante o en el Nodo más ocupado al que llama, y **Sin reintentos** en los Enlaces
hacia él. Cada fila es una breve ejecución fantasma del Diseño real, así que una fila puede
sorprenderte. Un Servidor de aplicaciones más grande que espera a una Base de datos lenta deja pasar
más peticiones hacia esa Base de datos, y su propia carga sube.

Las filas muestran qué pasa, no qué comprar. Compara la bajada de cada fila con su Gasto antes de
elegir.

## Aplica el arreglo y compruébalo

1. Haz un solo cambio.
2. Espera unos segundos de tiempo de juego, para que el flujo se asiente.
3. Comprueba que la fila Carga del antiguo cuello de botella cae por debajo del 70%.
4. Comprueba que el Apdex del HUD sube hacia su objetivo.
5. Busca de nuevo el contorno. Suele pasar a un Nodo nuevo, así que repite desde el primer paso.

Si el contorno se queda en el mismo Nodo y su Carga no baja, arreglaste el recurso equivocado: vuelve
a los medidores y elige otra vez.

:::Note{tone="warn"}
**Más grande** y un cambio de familia reinician el Nodo durante un rato. Un Nodo único, sin segunda
copia, pierde su tráfico mientras se reinicia.
:::

El Sandbox Máquina compartida empieza con la Base de datos y el Servidor de aplicaciones en una misma
máquina, para que averigües qué recurso se llena primero y lo arregles dentro del límite de Gasto.

::Sandbox{id="shared-box"}

## Cuando no hay marca

El Diseño puede perder usuarios sin ningún cuello de botella, así que revisa estos sitios:

- **Una fila roja "Varada"** en la tarjeta de un Nodo. Ningún Nodo enlazado acepta un tipo de
  petición. Dibuja un Enlace a un Nodo que lo acepte.
- **Errores** en el HUD. Con [Logs estructurados](/research/logs), selecciona el Nodo Usuarios y lee
  **Errores por causa**.
- **Por qué se van los usuarios.** Selecciona **Usuarios** en el HUD. Cada fila nombra un tipo de
  petición y una causa. Una fila `lento` tiene un botón **Ver** que selecciona por ti el Nodo cuello
  de botella.

## Otras formas de encontrarlo

- Pulsa **D** para abrir el [Cuadro de mando](/explanation/observability), cuando ya tengas
  [Métricas](/research/metrics). La fila **Saturación** muestra la carga de cada Nodo a lo largo del
  tiempo. La estadística **Nodo más cargado** nombra el Nodo más ocupado.
- Con [Percentiles](/research/percentiles), la fila Latencia de cada tarjeta muestra el p99. Un Nodo
  con un p99 alto y una carga baja apunta a eventos de cola, no a capacidad. Mira
  [Leer el p99 y la latencia de cola](/guides/read-p99).
