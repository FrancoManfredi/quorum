El Flujo de eventos representa a Apache Kafka, Redpanda y Amazon Kinesis: un **log** particionado y replicado que conserva los mensajes después de leerlos.

## Cuándo colocarlo

- Colócalo cuando más de un consumidor necesite los mismos eventos, como un índice de búsqueda, un almacén de datos o un segundo servicio que lea aquello sobre lo que actuó el primero.
- Colócalo cuando los eventos deban sobrevivir. Se desbloquea con [Streaming de eventos](/research/event-streaming) en la Serie B, por 15,000 ◇, después de Colas de mensajes.

## Cómo funciona

Los productores añaden, los consumidores leen a su propio ritmo y los mensajes permanecen después de leerse. Eso lo separa de una [Cola](/components/queue). Una Cola entrega una tarea a un Worker y la olvida. Un log la conserva durante la ventana de retención, así que un consumidor puede leerla dos veces, un segundo consumidor puede leerla sin más, y un índice nuevo o un Worker reconstruido pueden reproducirla sin tocar la [Base de datos](/components/database).

Recibe `task` de los Nodos que producen trabajo asíncrono y la envía a los Workers que la consumen. También recibe `change` de un [Conector CDC](/components/cdc) y la envía a un [Motor de búsqueda](/components/search), un [Almacén de datos](/components/warehouse) o una [Caché](/components/cache). Cada consumidor de cambios enlazado ve todos los cambios; los Workers se reparten las tareas. Un broker añade **100,000 mensajes por segundo** en su primer tamaño, y la tasa se duplica en cada uno de sus seis tamaños. Cada append espera cinco milisegundos multiplicados por su ajuste de confirmación.

El **retraso del consumidor** es la métrica que hay que vigilar: los eventos que guarda un flujo y que sus consumidores no han leído. Es la versión del log de la profundidad de cola. Un productor nunca espera a sus consumidores, así que el primer daño de un Worker lento es un log que crece, no una petición lenta.

## Opciones

::Options{id="log"}

- **Particiones**: cuántos consumidores leen a la vez. Un grupo de consumidores usa un consumidor por partición, así que un flujo lee a su tasa por partición por cada partición que tiene.
- **Clave de partición**: Con clave mantiene los eventos de una entidad en una partición, así que conservan el orden, y una clave caliente llena una partición. Round robin reparte de forma uniforme y pierde el orden.
- **Réplicas**: copias de cada partición. Cada réplica factura de nuevo. Con una sola réplica, un broker que falla se lleva todos los eventos que guardaba. Con más, las confirmaciones deciden qué se pierde.
- **Confirmaciones**: lo que espera un productor antes de continuar. Sin ack no espera, Líder espera al líder de la partición, y Todas las réplicas espera a cada copia. Una espera más larga es una escritura más segura.
- **Retención**: cuánto tiempo permanece un mensaje. Un consumidor más atrasado que la ventana pierde los eventos más antiguos, y las tareas que llevaban no se ejecutan nunca.

## Cómo falla

- **Un broker caído.** Con una sola réplica se lleva la única copia de cada evento que guardaba. Con más réplicas, `all` no pierde ninguno, `1` pierde los eventos que los seguidores no habían copiado, y `0` pierde los últimos eventos del productor. Los eventos perdidos gastan el presupuesto de error.
- **Retención.** Un consumidor más atrasado que la ventana pierde los eventos más antiguos, y el trabajo que llevaban no se hace nunca. Una ventana más larga aquí solo cuesta tiempo, mientras que un producto real factura el disco.
- **Orden.** Round robin con más de una partición pierde el orden, así que una escritura reemplazada puede aterrizar después de la que la sustituyó. El valor que escribe un consumidor es el más antiguo, y el juego lo cuenta como un resultado obsoleto.
- **Particiones.** Una partición significa un consumidor, así que un consumidor lento retiene a todos los que tiene detrás. Más particiones leen más rápido y dividen el orden con más finura.
- **Una clave caliente.** El tráfico de una clave llena una partición, sea cual sea el número de particiones, y esa partición marca la velocidad de todo el flujo. El incidente [Clave caliente](/incidents/hot-key) lo muestra.
- **Sin consumidor enlazado.** Nada consume el flujo, y cada tarea o cambio que llega a él queda atascado.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Flujo de eventos se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Pulsa **Reemplazar** en su Inspector y paga el precio. Vuelve en frío.
- **Prevenir:** Ejecuta una segunda copia: [Balanceo de carga](/research/load-balancing) pone las copias detrás de un Balanceador de carga, y las [Comprobaciones de estado](/research/health-checks) se saltan el host caído.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez.
- **Qué hacer ahora:** Nada devuelve la zona antes. **Hacer failover** promueve un **Standby**, y este Componente no tiene ninguno, así que termina por sí solo tras 120 s como máximo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y luego pon copias en zonas distintas con el ajuste Zona.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, y el tablero de esa región se pone gris con ellos.
- **Qué hacer ahora:** Nada lo acelera. **Hacer failover** mueve solo Nodos que no guardan datos, así que este sigue caído hasta que termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error. Un almacén repartido entre regiones no necesita nada de ti.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region) y [GeoDNS](/research/geo-dns), y luego ejecuta una copia en una segunda región.

## Consejos

- Vigila el retraso, no la latencia.
- Pon como clave del flujo la entidad cuyo orden importa, como un pedido o una cuenta.
- Configura más particiones que consumidores tengas.
- Usa `acks=all` con tres réplicas para dinero. El ajuste más barato es una réplica sin ninguna confirmación.
