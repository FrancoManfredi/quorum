DNS responde un dominio con varias direcciones, como hace un servicio de nombres gestionado tipo Route 53.

## Cuándo colocarlo

- Colócalo cuando un Servidor de aplicaciones no baste y aún no puedas permitirte un [Balanceador de carga](/components/lb). El síntoma es un tablero que rechaza un segundo enlace desde Usuarios.

## Cómo funciona

Convierte el único enlace de [Usuarios](/components/users) en muchos, y da a cada enlace una parte igual del tráfico, que es el round robin. Todos los tipos de petición pasan sin cambios, sin latencia añadida y sin límite de capacidad. Consulta [round robin de DNS](/glossary/dns-round-robin).

DNS ignora el tamaño, así que un Servidor de aplicaciones pequeño recibe la misma parte que uno grande. Tampoco tiene comprobaciones de estado, así que un host caído conserva su parte y esas peticiones fallan.

## Opciones

::Options{id="dns"}

- **TTL**: cuánto tiempo conserva una respuesta un resolver. La Investigación de [Comprobaciones de estado](/research/health-checks) hace que DNS retire un host caído cuando vence su TTL, y te deja fijar el TTL. Un TTL corto retira antes un host caído y añade consultas. Un TTL largo sigue enviando usuarios a un host que murió.

## Cómo falla

- [Fallo de instancia](/incidents/instance): un host cae, y su parte de las peticiones falla hasta que DNS lo retira, o para siempre sin Comprobaciones de estado.
- Los tamaños mezclados sobrecargan primero el host más pequeño, porque cada uno recibe una parte igual. Mantén los hosts del mismo tamaño.

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris y el DNS que hay en ella cae.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region), mantén una copia en una segunda región y añade [GeoDNS](/research/geo-dns) para enviar allí a los usuarios.

:::Note{tone="real"}
Los clientes reales cachean las respuestas de DNS durante el TTL y a menudo más, así que DNS es un balanceador de carga lento y tosco. Los equipos reales ponen un Balanceador de carga detrás.
:::

## Consejos

- Mantén todos los hosts detrás de DNS del mismo tamaño.
- Sustituye DNS por un Balanceador de carga cuando investigues [Balanceo de carga](/research/load-balancing).
