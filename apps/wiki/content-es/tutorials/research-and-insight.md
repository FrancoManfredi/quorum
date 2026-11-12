---
title: Gana Conocimiento e investiga
summary: Mira cómo Analítica convierte tu tráfico en Conocimiento y haz tus primeros Estudios, Stripe Billing y Logs estructurados.
section: tutorials
order: 4
aliases: insight, research, study, studies, pools, recipe, analytics, stripe billing, structured logs, conocimiento, investigación, estudio, estudios, pools, receta, analítica, logs estructurados
gdd: /design/12-observability
---

En esta lección descubres de dónde viene el Conocimiento y lo gastas en dos Estudios: Stripe Billing,
que cobra los ingresos por ti, y Logs estructurados, que muestra por qué falló una petición. Ambos
se pueden hacer en el Garaje o en Pre-semilla.

## Encuentra tu Conocimiento

El Conocimiento es lo que aprendes al observar tu propio tráfico. Analítica muestrea los Nodos que se
enlazan a ella, y cada tipo de petición muestreado llena su propio pool de Conocimiento.

1. Mira la tarjeta de Analítica en el tablero. Muestra **Muestreo**, **Conservadas** y hasta tres filas
   con un icono de pool y una tasa, como `+0.4/s`.
2. Mira bajo el HUD, arriba a la izquierda. La tarjeta **Conocimiento** lista cada pool que tienes o
   ganas, con su cantidad y su tasa.

La tarjeta de Conocimiento aparece en cuanto tus pools reúnen lo suficiente para el elemento de
Investigación más barato. En una Empresa nueva, eso ocurre en cerca de un minuto.

Cada pool tiene su propio icono y color. El color coincide con las partículas del tipo de petición en
el tablero, así que el Conocimiento de vistas de página se parece al tráfico de vistas de página.

::Component{id="analytics"}

## Lee la ayuda

1. Selecciona el botón **?** de la tarjeta de Conocimiento. Se abre **Sobre el Conocimiento**.
2. Lee las cuatro partes: **Pools**, **Ganancia**, **Gasto** y **Retención**.
3. Pulsa **Esc** para cerrarla.

Dos reglas importan más. Un pool gana con la raíz cuadrada de sus muestras, así que un tipo de petición
nuevo gana más que más tráfico del mismo tipo, y deja de llenarse en su tasa por la ventana de
retención de Analítica. Gasta el Conocimiento en lugar de acapararlo.

## Abre la Investigación

1. Pulsa **R**. También puedes seleccionar la fila superior de la tarjeta de Conocimiento. Se abre la
   pantalla de Investigación.
2. Mira el árbol. Cada línea crece hacia arriba desde su raíz, con una banda por Era. Los elementos de
   Eras posteriores salen en gris o difuminados.

Cada elemento muestra su coste en fichas, una ficha por cada pool que lo paga. Los pools que pagan son
la **receta** del elemento. La mayoría de los elementos del Garaje cuestan Conocimiento de página y de
lectura. La mayoría de los de Pre-semilla cuestan Conocimiento de escritura y de inicio de sesión.

## Haz tu primer Estudio

1. Haz clic en **Stripe Billing** en el árbol. Su panel de detalle se abre abajo a la derecha.
2. Lee la descripción: **Los pagos se cobran solos.**
3. Lee las filas de **Coste**. Cada fila muestra el pool, el coste y cuánto tienes.
4. Selecciona **Iniciar estudio**. El botón también muestra cuánto dura el Estudio.

Un Estudio no se lleva todo su Conocimiento de golpe. Toma Conocimiento de sus pools mientras corre, así
que los pools bajan despacio. El pool que se queda corto primero marca el ritmo.

5. Pulsa **Esc** para cerrar la pantalla de Investigación.
6. Mira la tarjeta de Conocimiento. Su fila superior muestra **Stripe Billing** y un porcentaje, con una
   barra de progreso.

Cuando termina el Estudio, mira la tarjeta de Pagos. Su botón dice ahora **Cobrado automáticamente**, y
los ingresos van directos a la Caja. Pulsar **C** pasa a ser opcional.

## Pon en cola un segundo Estudio

1. Pulsa **R** otra vez.
2. Haz clic en **Logs estructurados**, en la línea de Observabilidad.
3. Selecciona **Iniciar estudio**.

Si ya corre un Estudio, el nuevo se une a la **Cola** del panel de detalle. El primer Estudio de la
cola corre, y los demás esperan. Puedes subir o bajar un Estudio, o cancelarlo. Un Estudio cancelado
pierde su progreso y el Conocimiento que tomó.

También puedes hacer doble clic en un elemento del árbol para ponerlo en cola.

::Track{track="observability"}

## Mira qué muestran los logs

Cuando Logs estructurados es tuyo, los errores tienen causas.

1. Espera hasta que la fila **Errores** aparezca en el HUD. Aparece cuando falla la primera petición.
2. Pasa el puntero sobre la fila **Errores**. Su título lista cada causa y su tasa.
3. Selecciona el Nodo **Usuarios**. El Inspector muestra **Errores por causa**.

Causas como `varada` y `caído` te dicen qué arreglar. Sin logs, solo ves que las peticiones fallan.

:::Note{tone="tip"}
Las peticiones fallidas y lentas llenan un pool aparte, el Conocimiento de fallos. Un incidente lo
llena rápido. La mitad del coste de cada elemento de Fiabilidad es Conocimiento de fallos, así que un
incidente ayuda a pagar la Investigación que previene el siguiente.
:::

## Cuando un pool se queda corto

En Pre-semilla, algunos elementos cuestan Conocimiento de escritura y de inicio de sesión, y el inicio
de sesión llega en una pequeña parte de la mezcla. Un Estudio de uno de esos corre al ritmo del inicio
de sesión.

1. Pulsa **R** y haz clic en el elemento que corre ahora.
2. Mira bajo la fila de coste de inicio de sesión. La tarjeta dice que tu Conocimiento de inicio de
   sesión es demasiado bajo, y da ambas tasas: lo que gana el inicio de sesión por segundo y lo que
   necesita el Estudio. Su botón nombra el paso y sus horas de desarrollo, y bajo el título muestra
   hasta dónde llega ese paso y qué cuesta en crecimiento de usuarios.
3. Selecciona **Construir**. El paso se une al backlog del Equipo, y un Equipo gasta en él las horas de
   desarrollo.
4. Pulsa **Esc**, luego **T**, y mira cómo el elemento llega a **En despliegue**. Cuando aterriza su
   despliegue, la cuota del tipo sube y su pool gana más rápido. El Estudio en curso coge velocidad.

Un paso también quita un poco al crecimiento de usuarios y carga los Nodos que sirven ese tipo, así que
una palanca de inicio de sesión se nota en los Servidores de aplicaciones. Empieza por el pool que
nombra la tarjeta, no por el pool más ocupado del tablero.

## Gana Conocimiento más rápido

- Enlaza más Nodos a Analítica. Arrastra desde el puerto de salida azul de un Nodo hasta la tarjeta de
  Analítica. La Base de datos es una buena primera elección.
- Sirve tipos de petición nuevos. Cada tipo nuevo llena un pool propio.
- Selecciona **Más muestras** en el Inspector de Analítica para muestrear una parte mayor del tráfico.
  Muestrear cuesta algo de CPU en cada Nodo que muestrea.

Con logs, un error lleva una causa, y la causa suele nombrar el siguiente Nodo que arreglar.
[Encontrar el cuello de botella](/guides/find-the-bottleneck) cubre ese recorrido, y
[Conocimiento y observabilidad](/explanation/observability) es de donde vienen los pools.
