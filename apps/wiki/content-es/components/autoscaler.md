El Autoescalador añade y quita copias de un servidor según cambia la carga, como un grupo de Auto Scaling de AWS.

## Cuándo colocarlo

- Colócalo cuando la demanda oscile a lo largo del día y, o pagas copias ociosas por la noche, o vas al límite en el pico. Se desbloquea con [Autoescalado](/research/autoscaling).

## Cómo funciona

Cambia cuántas copias de cada Servidor de aplicaciones o Worker enlazado se ejecutan, un Nodo cada vez. Por él no pasa tráfico: enlazas un Nodo con él y, desde ese momento, escala solo. Cuando el Nodo funciona por encima del objetivo, el Autoescalador pide más copias. Cuando queda muy por debajo, devuelve una. Consulta [autoescalado](/glossary/autoscaling).

Las copias nuevas no son instantáneas. Una VM tarda minutos en arrancar, mientras que un pod de un [Clúster de Kubernetes](/components/cluster) tarda segundos. Entre dos acciones de escalado sobre un mismo Nodo, el Autoescalador espera un tiempo de enfriamiento. Además, las copias nuevas arrancan en frío, así que un runtime con JIT las ejecuta despacio al principio. Consulta [arranque en frío](/glossary/cold-start).

## Opciones

::Options{id="autoscaler"}

- **Señal**: lo que lee. La CPU sirve para un runtime limitado por CPU. La carga lee el límite más ajustado del Nodo, así que sirve para un runtime que espera E/S y llena sus workers mientras la CPU sigue baja. La tasa de peticiones sigue al tráfico sea cual sea el runtime. La profundidad de la cola sirve para un Worker alimentado por una Cola.
- **Objetivo**: la utilización que mantiene cada copia. Un objetivo más alto concentra más trabajo en cada copia y deja menos margen para un pico. Uno más bajo mantiene holgura y cuesta más.
- **Copias mín.**: el suelo. Mantenlo lo bastante alto para aguantar los primeros minutos de un pico, porque una copia nueva tarda en arrancar y calentarse.
- **Copias máx.**: el techo, y tu protección de costes. Sin máximo, un bucle descontrolado factura sin fin.
- **Programación**: con [Escalado programado](/research/scheduled-scaling), el Autoescalador aprovisiona para el pico diario un par de horas antes de que llegue, de modo que las copias estén calientes cuando aterrice la demanda. Con la opción de carga, espera a la carga.

Un Nodo al que ninguna Cola alimenta marca cero en profundidad de cola, así que elige una señal que su tráfico mueva. Un Nodo escalado también necesita delante un [Balanceador de carga](/components/lb) que reparta el tráfico entre sus copias, o algo más que reparta el trabajo.

## Cómo falla

- Un pico más rápido que el tiempo de arranque sigue haciendo daño. Un [Pico de tráfico](/incidents/spike) puede haber terminado antes de que las VM nuevas sirvan.
- La CPU es la señal equivocada para runtimes que esperan E/S, porque su CPU se mantiene baja mientras sus workers están llenos. Usa la carga.
- Escalar bajo carga puede empeorar el p99 al principio, mientras se calientan las copias en frío.

### [Factura descontrolada](/incidents/runaway-bill)

- **Señales:** El Gasto sube sin ingresos adicionales, y las copias del Autoescalador suben hasta su máximo, o hasta donde lleguen si no hay máximo.
- **Qué hacer ahora:** Elige un **máx.** más bajo en la tarjeta del Autoescalador.
- **Prevenir:** Mantén un **máx.** bajo en cada Autoescalador, nunca **sin máx.**, y lee la factura de la nube línea por línea. [Autoescalado](/research/autoscaling) es la Investigación que cita el postmortem.

## Consejos

- Pon los Servidores de aplicaciones escalados en un Clúster para acortar el tiempo de reacción.
- Mantén el mínimo lo bastante alto para aguantar los primeros minutos de un pico.
