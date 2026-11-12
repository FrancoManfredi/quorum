El Balanceador de carga reparte las peticiones entre tus Servidores de aplicaciones, o las consultas entre una Base de datos y sus Réplicas de lectura, como hace un proxy inverso tipo NGINX o HAProxy.

## Cuándo colocarlo

- Colócalo cuando necesites un segundo Servidor de aplicaciones.
- Colócalo cuando los hosts detrás de [DNS](/components/dns) tengan tamaños mezclados.
- Auméntalo de tamaño cuando su tarjeta lo muestre cerca de su límite de rendimiento.
- Deja las sesiones persistentes desactivadas hasta que una caché o un Hub se beneficien de ellas.

## Cómo funciona

Abarca todas las zonas, así que una caída de zona no lo tumba. Entran todos los tipos de petición y todos pasan, y uno L4 deja pasar además todos los tipos de consulta, de modo que puede situarse delante de una [Base de datos](/components/database) y sus [Réplicas de lectura](/components/replica). Uno L7 lee HTTP y rechaza consultas. Añade algo de latencia, y cada escalón de tamaño duplica su límite de rendimiento.

Por defecto reparte el tráfico según la capacidad de cada destino, así que un Servidor de aplicaciones grande recibe una parte mayor. Retira un host caído en su siguiente [comprobación de estado](/glossary/health-check). Envía cada tipo que recibe a todos los destinos, así que lo que envía las vistas de página y las llamadas de API a grupos de servidores distintos es un [API Gateway](/components/gw) delante.

## Opciones

::Options{id="lb"}

- **Variante**: L7 termina HTTP, así que puede reintentar una llamada fallida y comprobar el estado. L4 reenvía TCP y deja pasar también consultas, así que puede situarse delante de una [Base de datos](/components/database) y sus [Réplicas de lectura](/components/replica). L4 lleva mucho más tráfico, añade menos latencia y factura menos, y renuncia a los reintentos y al conocimiento de HTTP. Consulta [Balanceo de carga de capa 4 y capa 7](/patterns/layer-4-and-layer-7-load-balancing).
- **Política**: cómo elige un destino. Ponderado, el predeterminado, reparte según la capacidad de cada destino, así que un Servidor de aplicaciones mayor recibe una parte mayor. Round robin da a cada destino un turno igual. Menos conexiones sirve para tamaños o runtimes mezclados. Dos opciones maneja más tráfico con un pequeño desequilibrio. Hash consistente mantiene una clave en su destino, y un destino que se va mueve solo sus propias claves. Consulta [Algoritmos de balanceo de carga](/patterns/load-balancing-algorithms).
- **Sesiones**: Persistente mantiene a un usuario en el destino al que llegó primero, de modo que una caché en proceso o un cliente en tiempo real encuentra su memoria. También desequilibra la carga, porque los usuarios fijados no se mueven cuando añades una copia, y un destino que cae se lleva sus sesiones. Consulta [Sesiones persistentes](/patterns/sticky-sessions).
- **Arranque lento**: un destino que acaba de unirse recibe una parte creciente del tráfico en lugar de su parte completa. Así una copia nueva de JVM nunca responde a su velocidad en frío, y el incidente de [Calentamiento de JVM bajo carga](/incidents/jvm-warmup) es mucho menos probable. Consulta [Arranque en frío](/glossary/cold-start).
- **Comprobaciones de salud**: cada cuánto pregunta el Balanceador de carga a cada destino si está vivo. Un intervalo más corto retira antes un destino caído y añade comprobaciones. Una comprobación **Profunda** pregunta también por la Base de datos que hay detrás del destino, así que una Base de datos lenta puede retirar todos los destinos a la vez. Un intervalo distinto del predeterminado y una comprobación profunda necesitan [Comprobaciones de estado](/research/health-checks). Consulta [Descartar nodos caídos con comprobaciones de estado](/patterns/drop-dead-nodes-with-health-checks).

## Cómo falla

- Sobrecargado, descarta peticiones antes de que lleguen a ningún Servidor de aplicaciones.
- Una comprobación profunda retira todos los Servidores de aplicaciones cuya Base de datos está caída o sobrecargada. Si son todos, el Balanceador de carga no tiene adónde enviar tráfico, así que una Base de datos lenta se convierte en una caída total.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Balanceador de carga se pone gris y su aviso dice "El host bajo esta VM murió. Sigue facturando." Las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Selecciona el Nodo y haz clic en **Reemplazar**. Cuesta Caja y vuelve en frío.
- **Prevenir:** Ejecuta un segundo Balanceador de carga. Un intervalo de comprobación de estado corto evita que enrute a un Servidor de aplicaciones caído que tiene detrás, y uno largo sigue enviando a ese host su parte. [Comprobaciones de estado](/research/health-checks) fija el intervalo.

### [Certificado caducado](/incidents/certificate)

- **Señales:** Aparece el banner **Certificado caducado**, y todas las peticiones que pasan por el Balanceador de carga fallan, igual que por cualquier otro Nodo TLS.
- **Qué hacer ahora:** Haz clic en **Renovar** en el banner.
- **Prevenir:** Investiga [Automatización de certificados](/research/cert-automation) y coloca un Nodo de [Secretos y certificados](/components/pki), que renueva los certificados antes de que caduquen.

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris y el Balanceador de carga que hay en ella cae.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region), mantén una copia en una segunda región y añade [GeoDNS](/research/geo-dns) para enviar allí a los usuarios.

:::Note{tone="real"}
Las comprobaciones de estado pueden causar caídas además de evitarlas. Los equipos reales mantienen estrechas las comprobaciones profundas por esta razón.
:::

## Consejos

- Usa menos conexiones cuando los Servidores de aplicaciones tengan tamaños o runtimes mezclados.
- Enruta los tipos lentos, como las exportaciones, a sus propios Servidores de aplicaciones.
