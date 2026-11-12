La Función serverless ejecuta tu código por petición, sin una máquina propia, como hacen AWS Lambda, Google Cloud Functions y Azure Functions.

## Cuándo colocarla

- Colócala cuando el tráfico sea a picos. Se desbloquea con [Serverless](/research/serverless) en la Serie A, por 3,500 ◇, y no tiene coste de colocación.
- Colócala cuando un endpoint necesite su propia capacidad sin una segunda máquina.
- Sáltatela para una carga estable por encima de un 30% de utilización de una VM equivalente, donde cuesta más que la VM.
- Sáltatela para trabajo `job` largo. Ese pertenece a un [Worker](/components/worker) detrás de una [Cola](/components/queue).

## Cómo funciona

Ejecuta el Stack de tu Servicio sin tipo de instancia ni tamaño que elegir, así que el runtime por sí solo decide la rapidez con que se ejecuta una petición y lo que dura un arranque en frío. Entran todos los tipos de petición y se responden como los responde un [Servidor de aplicaciones](/components/server), convertidos en las llamadas al backend que hace.

Se diferencia de un Servidor de aplicaciones en tres cosas:

- **Factura por uso.** Nada queda en pie mientras está ociosa. Cada petición paga un precio por petición más un precio por los GB-segundo que duró su ejecución, y toda la factura cae en la línea Peticiones de la [factura de la nube](/design/09-economy#the-cloud-bill). Una llamada lenta a la Base de datos alarga cada ejecución, así que la factura sube con la latencia de la capa de datos.
- **Escala desde cero hasta un tope.** Un entorno de ejecución atiende una petición a la vez, así que la función sirve tantas peticiones por segundo como permiten 1,000 ejecuciones concurrentes. Por encima del tope el proveedor aplica throttling, y el exceso se descarta, no se encola.
- **Arranca en frío.** Un entorno que estuvo ocioso desaparece, y la siguiente invocación arranca uno nuevo. Consulta [arranque en frío](/glossary/cold-start). La Simulación lo cobra a una parte de las peticiones: casi todas con un goteo de tráfico, casi ninguna con carga estable.

Como nada permanece residente, una función es barata con volumen bajo y a picos. Por encima de un 30% de utilización estable de una VM equivalente cuesta más que la VM, porque el Gasto de la VM no crece con el trabajo que hace.

## Cómo falla

- **El tope.** Un pico por encima de 1,000 ejecuciones concurrentes sufre throttling, y se pierden las peticiones.
- **Arranques en frío tras un minuto tranquilo.** Una función en Java puede pagar dos segundos antes de que se ejecute su código, mientras que Go y Rust pagan 50 ms. Un goteo de tráfico lo paga más a menudo.
- **Conexiones.** Cada ejecución concurrente abre sus propias conexiones a la base de datos. Sin un [Pooler de conexiones](/components/pooler), un pico agota Postgres.
- **Duración.** Una función detiene una ejecución a los 15 minutos. Una exportación (`job`) tarda 4 segundos por cada GB que guardan las Bases de datos, así que por encima de 225 GB falla como `timeout`. El trabajo `job` largo pertenece a un Worker detrás de una Cola, que no tiene límite.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta de la Función serverless se pone gris y su aviso dice "El host bajo esta VM murió. Sigue facturando." Las peticiones enviadas a ella quedan atascadas.
- **Qué hacer ahora:** Selecciona el Nodo y haz clic en **Reemplazar**. Cuesta Caja y vuelve en frío.
- **Prevenir:** Ejecuta una segunda copia detrás de un [Balanceador de carga](/components/lb) que se salte los hosts caídos. [Balanceo de carga](/research/load-balancing) y [Comprobaciones de estado](/research/health-checks) los desbloquean.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez, la Función serverless con ellos.
- **Qué hacer ahora:** Nada devuelve la zona antes. **Hacer failover** promueve un **Standby**, y este Componente no tiene ninguno, así que termina por sí solo tras 120 s como máximo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y mantén una copia del Componente en una segunda zona.

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris y la Función serverless que hay en ella cae.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region), mantén una copia en una segunda región y añade [GeoDNS](/research/geo-dns) para enviar allí a los usuarios.

## Consejos

- Pon una [CDN](/components/cdn) o una [Caché](/components/cache) delante, porque una función paga por cada petición que le llega.
- Apunta a una carga base estable en Servidores de aplicaciones y deja las funciones para los picos: máquinas reservadas para el suelo, capacidad por uso para el pico.
