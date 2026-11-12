El Hub en tiempo real representa a Phoenix Channels, Socket.IO, Centrifugo o Pusher: el servidor que mantiene abierta una conexión por cada usuario en línea.

## Cuándo colocarlo

- Colócalo cuando tus Servidores de aplicaciones funcionen con un runtime que no puede mantener conexiones ([PHP-FPM](/runtimes/php_fpm) y Gunicorn sync rechazan `rt` de plano). Se desbloquea con [WebSockets](/research/websockets).
- Colócalo cuando las conexiones abiertas se estén comiendo la memoria que necesitan tus peticiones.
- Añade Clustering cuando necesites más de una máquina.

## Cómo funciona

El tiempo real se diferencia de todos los demás tipos. Un mensaje no hace una petición y espera una respuesta. Mantiene una conexión abierta, 300 s por cada mensaje que lleva. Así, un Hub que sirve 100 mensajes por segundo mantiene 30,000 conexiones, y su capacidad se cuenta en esas conexiones y no en peticiones. 320 mensajes por segundo son 96,000 conexiones abiertas.

Cuántas conexiones caben es asunto del runtime. Una máquina de 8 GB aguanta aproximadamente 1.6 millones de conexiones BEAM, 800,000 de Go, 400,000 de Node.js y 8,000 hilos de plataforma de Java ([Runtimes](/design/06-runtimes#realtime-connections)). Cada escalón de tamaño duplica la RAM que les da.

Recibe `rt` y nada más, y no envía nada más allá: responde él mismo el mensaje. Pon un [API Gateway](/components/gw) delante, enruta solo Tiempo real al Hub, y pon el Hub detrás del [Balanceador de carga](/components/lb) junto a tus [Servidores de aplicaciones](/components/server). Un Balanceador de carga reparte todos los tipos que recibe; el Gateway es lo que enruta por tipo.

## Opciones

::Options{id="ws"}

- **Runtime**: el servidor que mantiene las conexiones. El runtime fija cuántas caben en una máquina, porque uno que mantiene un worker por conexión aguanta muchas menos que un bucle de eventos o la BEAM. Consulta [Runtimes](/runtimes).
- **Presencia**: rastrea quién está en línea. Aporta más por mensaje en las funcionalidades sociales que la necesitan, y gasta algo de la CPU de la máquina en entradas y salidas, así que una máquina aguanta menos conexiones.
- **Backoff de reconexión**: reparte la oleada de clientes que se reconectan tras un reinicio. Sin él vuelven todos a la vez, un [efecto estampida](/glossary/thundering-herd), y el Hub rechaza la mitad mientras se calienta.
- **Clustering**: da a varios hubs un backbone pub/sub compartido. Hace falta por encima de una máquina: sin él solo la primera máquina acepta conexiones, y los tamaños mayores añaden Gasto y ningún espacio.

## Cómo falla

- Un runtime que mantiene un worker o un hilo por conexión no mantiene ninguna conexión, en un Hub igual que en un Servidor de aplicaciones. Esas conexiones se rechazan.
- Por encima de las conexiones que caben en su máquina, descarta el resto. La fila Conexiones de la tarjeta es el límite.
- Una sola máquina con Clustering desactivado limita el Hub por grande que sea.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Hub en tiempo real se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Pulsa **Reemplazar** en su Inspector y paga el precio. Vuelve en frío.
- **Prevenir:** Ejecuta una segunda copia: [Balanceo de carga](/research/load-balancing) pone las copias detrás de un Balanceador de carga, y las [Comprobaciones de estado](/research/health-checks) se saltan el host caído.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez.
- **Qué hacer ahora:** Nada devuelve la zona antes. **Hacer failover** promueve un **Standby**, y este Componente no tiene ninguno, así que termina por sí solo tras 120 s como máximo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y luego pon copias en zonas distintas con el ajuste Zona.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, y el tablero de esa región se pone gris con ellos.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region) y [GeoDNS](/research/geo-dns), y luego ejecuta una copia en una segunda región.

### [Tormenta de reconexiones](/incidents/reconnect)

- **Señales:** Un Hub que se reinicia vuelve en frío, todos los clientes se reconectan a la vez, y sin Backoff de reconexión un reinicio descarta a la mitad de los clientes que vuelven. El Hub rechaza lo que no puede asumir.
- **Qué hacer ahora:** Pulsa **Limitar conexiones** en el banner o en la tarjeta del Hub. El Hub admite entonces la oleada al ritmo que puede asumir, como hace el Backoff de reconexión, así que no rechaza a nadie mientras se calienta. No necesita investigación. Si no, termina cuando el Hub se ha calentado, tras 20 s como máximo.
- **Prevenir:** Elige **Backoff con jitter** en la sección Clientes. Un Balanceador de carga persistente devuelve a cada cliente al Hub que tenía, así que un Hub reiniciado recibe solo su propia mitad. Investiga [WebSockets](/research/websockets).

### [Split brain](/incidents/split-brain)

- **Señales:** La mitad de los mensajes en tiempo real del Hub fallan como `stale`. Golpea a un Hub Elixir ocupado en un clúster de Erlang distribuido.
- **Qué hacer ahora:** Pulsa **Reiniciar Hub** en el banner, o **Reiniciar** en la tarjeta del Hub. El reinicio vuelve a unir el clúster y termina el incidente, y el Hub vuelve en frío, así que sus clientes se reconectan (consulta [Tormenta de reconexiones](#reconnect-storm)). Si no, termina por sí solo tras 90 s como máximo.
- **Prevenir:** Investiga [Ingeniería del caos](/research/chaos-engineering).

### [Día del lanzamiento](/incidents/launch-day)

- **Señales:** Solo en backend de juegos. La demanda de `rt` va a ×6 y todos los clientes se conectan a la vez.
- **Qué hacer ahora:** Aumenta el tamaño del Hub. Con Clustering desactivado un tamaño mayor no añade espacio, así que cambia primero a **En clúster**.
- **Prevenir:** Dimensiona el Hub para el pico, elige **Backoff con jitter**, e investiga [WebSockets](/research/websockets) y [Descarte de carga por prioridad](/research/load-shedding).

## Consejos

- Llega a él a través del Balanceador de carga y mantén Tiempo real fuera de los Enlaces de los Servidores de aplicaciones: un pool mixto envía algunos mensajes en tiempo real a un runtime que puede rechazarlos.
- Mejora el runtime, no el tamaño: una máquina BEAM aguanta doscientas veces lo que aguanta una de hilos de plataforma de Java antes de que pagues una segunda máquina.
- Vigila las conexiones, no los mensajes por segundo.
