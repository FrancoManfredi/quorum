---
title: Autoescalado, reactivo y programado
summary: Añade copias de un servicio cuando sube la carga y quítalas cuando baja, ya sea después de que aparezca la carga o antes de un pico que puedes predecir.
section: patterns
group: Scaling reads and compute
order: 208
aliases: autoscaler, auto scaling group, hpa, scale in, scale out, target tracking, scheduled scaling, cooldown, autoescalador, autoescalado, escalado programado, enfriamiento
---

Un autoescalador cambia el número de copias en ejecución para seguir a la demanda, así que pagas el pico solo mientras dura.

## Cuándo usarlo

- El tráfico tiene una forma diaria, así que una flota fija está ociosa de noche y corta al mediodía.
- Los picos llegan más rápido de lo que una persona puede añadir servidores.
- El nivel no guarda estado, así que una copia nueva puede recibir tráfico en cuanto arranca.

## Cómo funciona

Una política reactiva lee una señal, como la CPU, las peticiones por copia o la profundidad de la cola en el caso de los workers. Compara la señal con un objetivo y añade copias cuando lo supera. Una copia nueva tarda en arrancar y calentarse, así que una política reactiva siempre va por detrás de la carga. Un mínimo mantiene el suelo lo bastante alto para sobrevivir a un fallo, y un máximo limita la factura.

Una política programada añade copias antes de un pico conocido, como las 9 a. m. entre semana, para que estén calientes cuando lleguen los usuarios. Luego el escalado reactivo se encarga de lo que la programación no previó.

## Qué cuesta

El tiempo de arranque es el punto débil: escalar justo en el momento del pico llega tarde para un runtime que arranca despacio. Una reducción agresiva provoca oscilaciones (flapping), y la falta de un máximo convierte una inundación de bots en una factura enorme. La elección de la señal también importa. La CPU no detecta un servicio que espera a una base de datos lenta.

## En Quorum

Enlaza un [Servidor de aplicaciones](/components/server) con un [Autoescalador](/components/autoscaler) después de investigar [Autoescalado](/research/autoscaling). El interruptor de programación necesita [Escalado programado](/research/scheduled-scaling). El Diseño lo combina con slow start en el [Balanceador de carga](/components/lb), para que una copia nueva reciba tráfico poco a poco.

::Design{id="autoscaled"}

El incidente [Calentamiento de JVM bajo carga](/incidents/jvm-warmup) muestra copias frías que llegan en pleno pico. El glosario define [autoescalado](/glossary/autoscaling) y [tráfico diurno](/glossary/diurnal-traffic), y el paso [Autoescalar el nivel de cómputo](/patterns/autoscale-the-compute-tier) lo construye pieza a pieza.
