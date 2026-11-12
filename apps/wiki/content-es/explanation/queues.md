---
title: Capacidad, utilización y colas
summary: Por qué un Nodo se vuelve lento mucho antes de llenarse, qué significan las tarjetas ámbar y roja y cómo las Colas cambian espera por seguridad.
section: explanation
order: 3
aliases: utilization, capacity, saturation, queueing, hockey stick, backlog, queue depth, little's law, headroom, utilización, capacidad, saturación, encolado, palo de hockey, retraso acumulado, profundidad de la cola, ley de Little, margen
gdd: /design/04-simulation
---

Un Nodo se vuelve lento mucho antes de llenarse. Cada Nodo tiene una capacidad, el máximo de trabajo que puede
hacer por segundo, y lo lleno que está decide cuánto esperan las peticiones. Esa relación es una curva, y
explica la mayoría de las ralentizaciones que encuentras en Quorum.

## Utilización

La [utilización](/glossary/utilization), escrita ρ (rho), es el trabajo que llega dividido por el trabajo que
el Nodo puede hacer:

```latex
\text{utilization} = \frac{\text{offered work}}{\text{capacity}}
```

El trabajo se mide en la unidad propia del Nodo. Un Servidor de aplicaciones cuenta tiempo de CPU, slots de
worker, memoria y red. Una Base de datos cuenta CPU y conexiones. El límite más estrecho fija la capacidad
del Nodo. La barra de carga de cada tarjeta muestra la utilización, y la tarjeta cambia de color a medida que
sube:

- **Menos del 70%.** Sano. Las peticiones apenas esperan.
- **Del 70% al 90%.** Ámbar. El tiempo de espera sube rápido.
- **90% o más.** Rojo. La cola de latencia es varias veces la mediana.
- **Más del 100%.** Saturado. El Nodo procesa lo que puede y descarta el resto como errores.

## El palo de hockey

El tiempo de espera crece con `ρ / (1 − ρ)` veces el tiempo de servicio. Con un 50% de utilización, una
petición espera más o menos lo que tarda en servirse. Con un 90%, espera cerca de nueve veces eso. La curva
se mantiene plana durante mucho tiempo y luego se dispara, como un palo de hockey.

Así que un Nodo al 85% no está "bien con un 15% de sobra". Ya es lento, y un pequeño aumento de tráfico lo
vuelve mucho más lento. La misma curva significa que una pequeña mejora en un Nodo caliente puede ayudar
mucho.

::Quiz{question="Un Nodo funciona al 90% de utilización. Duplicas su capacidad, así que pasa a funcionar al 45%. ¿Cuánto cambia aproximadamente su espera en cola?" options="Se reduce a la mitad|Cae unas diez veces|No cambia" answer="2" explain="La espera crece con ρ / (1 − ρ). Al 90% eso es 9, y al 45% es cerca de 0.8, así que la espera cae más de diez veces."}

:::Note{tone="real"}
Los servidores reales no siguen exactamente la cola de un solo servidor (M/M/1), porque la mayoría tiene
muchos workers y tiempos de servicio irregulares. La forma se mantiene de todos modos: la latencia se queda
plana con poca carga y sube con fuerza cuando la utilización se acerca al 100%. Los operadores mantienen un
margen de holgura exactamente por esta razón.
:::

## La holgura no es desperdicio

La demanda sigue un ciclo diario, y el pico de la tarde está muy por encima del promedio diario, así que un
Diseño dimensionado para el promedio va en rojo cada tarde. La capacidad de sobra también absorbe un pico de
tráfico y la pérdida de un Nodo. Por eso un Diseño sano va casi siempre muy por debajo de la línea ámbar.

Puedes comprar holgura de tres maneras:

- **Escalar verticalmente.** Cambia el tamaño de un Nodo a una instancia mayor. Cada escalón duplica vCPU y
  RAM, pero el Nodo se reinicia y vuelve en frío. Algunos programas no pueden usar los núcleos extra.
- **Escalar horizontalmente.** Añade copias detrás de DNS o de un Balanceador de carga. Cada copia de un
  Componente cuesta más de colocar que la anterior.
- **Escalar con la demanda.** Un [Autoescalador](/components/autoscaler) añade copias cuando la carga pasa de
  su objetivo y las quita cuando la carga baja. Las copias nuevas tardan en arrancar, así que mantén un
  margen de todos modos.

Mira el [escalado vertical y horizontal](/glossary/vertical-and-horizontal-scaling) y la referencia de
[Infraestructura](/infrastructure) para ver tamaños y precios de instancias.

## Slots, no solo CPU

Un Servidor de aplicaciones puede estar lleno con la CPU ociosa. Runtimes como PHP-FPM, Gunicorn, Puma y
Tomcat retienen un worker o un hilo por cada petición hasta que termina, incluido el tiempo que espera a la
Base de datos. Cuando todos los slots esperan, las peticiones nuevas hacen cola aunque la CPU no tenga nada
que hacer.

La [ley de Little](/glossary/littles-law) lo explica: los slots en uso equivalen a la tasa de llegada por el
tiempo que cada petición retiene un slot. Duplica la espera y un pool fijo atiende la mitad de las
peticiones. Puedes arreglar la llamada lenta, añadir workers o pasar a un runtime que espera sin retener un
slot. Las páginas de [Runtimes](/runtimes) muestran qué modelo usa cada runtime, y
[Cómo fluyen las peticiones](/explanation/requests) explica por qué esto enlaza tus Servidores de aplicaciones
con tu Base de datos.

## Colas: esperar a propósito

Una [Cola](/components/queue) es un Componente que guarda trabajo para que los [Workers](/components/worker)
puedan hacerlo más tarde. Un Servidor de aplicaciones enlazado a una Cola entrega la parte lenta y asíncrona
de algunas peticiones, como redimensionar una subida o construir una exportación. El usuario espera solo el
encolado.

Una Cola no descarta trabajo cuando los Workers se quedan atrás. Guarda el exceso como **profundidad**, y los
Workers la drenan cuando pueden, así que una ráfaga se convierte en un retraso en lugar de errores. La
profundidad tiene un precio:

- Una tarea nueva espera detrás de todas las tareas que ya están en la Cola. Los usuarios puntúan una subida
  o una exportación por el momento en que su resultado está listo, así que una Cola profunda los frustra.
- Sin un límite de longitud, la profundidad puede crecer sin fin cuando los Workers drenan más despacio de lo
  que llegan las tareas.
- La longitud máxima de una Cola es [contrapresión](/glossary/backpressure). Pasado ese punto, la Cola
  rechaza tareas nuevas, y la petición que envió una falla de inmediato.

Una tarea que falla vuelve para otro intento más tarde, y sin una cola de mensajes fallidos, una tarea que
siempre falla sigue volviendo. Mira la [cola de mensajes fallidos](/glossary/dead-letter-queue) y el
incidente [Mensaje envenenado](/incidents/poison).

## Leer una tarjeta roja

Cuando una tarjeta se pone roja, pregunta cuál es su límite más estrecho. Si es la CPU, añade capacidad o
haz el trabajo más barato. Si son los slots, busca aguas abajo la llamada lenta. Si son las conexiones, lee
[Errores y reintentos](/explanation/errors-and-retries). El marcador de cuello de botella te dice qué tarjeta
roja arreglar primero.
