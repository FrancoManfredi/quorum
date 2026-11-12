El Service mesh representa a Istio y Linkerd: un **proxy sidecar** junto a cada servicio.

## Cuándo colocarlo

- Colócalo cuando tus Servidores de aplicaciones y Workers sean demasiados para que los ajustes por Enlace sigan siendo manejables.
- Colócalo cuando lo que te haga daño sea una tormenta de reintentos.
- Sáltatelo en una Base de datos: una Base de datos no es un servicio con sidecar.

Se desbloquea con [Service mesh](/research/service-mesh) en la Serie B, por 20,000 ◇, después de [Orquestación de contenedores](/research/containers). Es el mismo equilibrio que un [Clúster de Kubernetes](/components/cluster): la automatización compensa a partir de cierto tamaño, y tiene un coste operativo real.

## Cómo funciona

En el producto real, el proxy vive en el mismo pod que el servicio y se encarga de sus llamadas de red. Enlaza Servidores de aplicaciones y Workers con él. Antes tienen que ejecutarse en un [Clúster de Kubernetes](/components/cluster), porque el sidecar viaja en el pod. Cada uno recibe un sidecar, y cada Enlace que sale de él cambia:

| Aporta                                                                   | Cuesta                                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Reintentos inmediatos, y un circuit breaker que se abre ante el fallo    | 5% de la CPU del miembro                                                       |
| Métricas por Enlace, y 20% más de Conocimiento sobre el tráfico vigilado | +1 ms en cada salto                                                            |
| TLS mutuo entre servicios                                                | 5% del Gasto del miembro, como parte del sidecar                               |
|                                                                          | 0.5 ingenieros de horas de desarrollo de Plataforma, o un Equipo de plataforma |

Los reintentos y el breaker no necesitan Investigación propia: el sidecar los ejecuta por ti. Un Enlace cuyo jugador fijó su propia política la conserva, porque el mesh es un valor por defecto, no una sustitución. El 1 ms, el 5% y el 20% son las cifras que usa el mesh.

## Cómo falla

- **Los reintentos ingenuos amplifican.** Una dependencia que falla recibe de nuevo sus llamadas fallidas, hasta tres veces. En un mal día eso es una tormenta de reintentos, y el mesh forma parte del porqué.
- **El breaker esconde la verdad.** Mientras está abierto, el Enlace falla rápido y no envía nada, así que las llamadas que dependen de él fallan como rechazadas, no como lentas.
- **El 5% se paga siempre.** Un sidecar cuesta su parte de la máquina haya mucho tráfico o poco, y el mesh la factura en su propia línea.
- **El 1 ms es por salto.** Un checkout que hace seis llamadas paga 6 ms además de su trabajo.
- **Horas de desarrollo de Plataforma.** Cada mesh se lleva medio ingeniero de los equipos de producto salvo que lo gestione un Equipo de plataforma.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, y el tablero de esa región se pone gris con ellos.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region) y [GeoDNS](/research/geo-dns), y luego ejecuta una copia en una segunda región.

## Consejos

- Pon el mesh en los servicios que más se llaman entre sí, no en todos los Nodos.
- Investiga [Circuit breakers](/research/circuit-breakers) para que un Enlace pueda fijar su propio breaker y su política de reintentos. Entonces el mesh aporta solo las métricas y el milisegundo.
- Vigila la línea de Conocimiento: un mesh sobre los servicios que Analítica ya muestrea aporta un 20% más, y eso paga los sidecars.
