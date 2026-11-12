La Réplica de lectura representa a una réplica de streaming de PostgreSQL o MySQL: una copia del primario que responde lecturas.

## Cuándo colocarla

- Colócala para añadir capacidad de lectura que la Base de datos no puede añadir sin reiniciarse. Un cambio de tamaño reinicia la Base de datos y vuelve en frío. Una réplica se incorpora al Diseño y se lleva su parte de las lecturas mientras el primario sigue sirviendo.
- Colócala para sacar los informes del primario. Un informe es un escaneo: no se puede cachear, y expulsa la caché de búfer de la Base de datos. Con una réplica enlazada, los escaneos van a la réplica y las demás consultas del primario conservan su caché.
- Colócala cuando la CPU de la Base de datos esté alta por las lecturas y una [Caché](/components/cache) no pueda contener los datos calientes. Una Caché responde lecturas repetidas de filas calientes; una réplica responde cualquier lectura, así que se lleva la cola larga que la Caché no cubre. Enlaza el primario y las réplicas con un [Balanceador de carga](/components/lb) L4, que necesita la Investigación [Balanceo de carga L4](/research/l4-lb), y las lecturas se reparten entre ellos según su algoritmo. Las escrituras van solo al primario. Con un [Pooler de conexiones](/components/pooler) delante, enlaza el pooler con el Balanceador de carga, porque el pooler admite un solo enlace de salida.
- Sáltatela cuando la mezcla tenga muchas escrituras. Eso pide un primario más grande, no más réplicas.
- Sáltatela cuando toda lectura deba ser fresca y no tengas [Enrutado read-your-writes](/research/ryw-routing). Una réplica siempre va con retraso, así que algunas lecturas fallan como `stale`.

| Necesidad                                    | Usa                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Más escrituras                               | Una [Base de datos](/components/database) más grande, o shards                             |
| Menos lecturas que lleguen a filas calientes | Una [Caché](/components/cache), la solución más barata mientras quepan los datos calientes |
| Más lecturas de cualquier fila, o informes   | Una Réplica de lectura                                                                     |

Los Sandboxes [Checkout obsoleto](/sandboxes/stale-checkout) y [Escritura perdida](/sandboxes/missed-write) muestran lecturas obsoletas.

::Sandbox{id="stale-checkout"}

## Cómo funciona

Enlaza la Base de datos con la réplica: ese enlace envía el log de escrituras, y es la única forma en que una réplica copia algo. No lleva consultas. Una réplica sin ninguna Base de datos enlazada no recibe lecturas, y su tarjeta dice "Nada: enlaza una Base de datos con ella". Una réplica copia una Base de datos, así que sigue el motor de esa Base de datos. Los Servidores de aplicaciones, o un Balanceador de carga L4, se enlazan con la réplica para enviarle lecturas.

Usa el mismo modelo de capacidad que la [Base de datos](/components/database), con un tipo de instancia y un tamaño, y tiene su propio límite de conexiones. Solo le llegan consultas de lectura y escaneos de informes, y ningún Componente queda aguas abajo de ella. Ejecuta el motor de su primario, así que el límite de conexiones sigue al del primario. Las escrituras siguen yendo al primario. La Base de datos enlazada con ella también decide su Grupo de datos: la réplica pertenece al grupo de esa Base de datos dondequiera que se dibuje, así que las filas y la capacidad del grupo se leen contra ella.

Una réplica cuesta menos que una Base de datos. Es más barata de colocar, y su máquina factura un 30% menos que una Base de datos del mismo tamaño, porque no tiene copias de seguridad, ni nivel de IOPS aprovisionadas, ni ruta de escritura que dimensionar.

Las réplicas van por detrás del primario, y el retraso crece con la tasa de escritura: 20 ms más 2 ms por cada escritura por segundo. Una cuarta parte de las lecturas dentro de esa ventana pide una fila que una escritura acaba de cambiar, así que esa parte de las lecturas vuelve obsoleta, hasta un 15%. La tarjeta muestra el retraso. Una respuesta obsoleta hace fallar una lectura de API y un checkout que lee su propia escritura, aunque las vistas de página la aceptan. Consulta [retraso de replicación](/glossary/replication-lag).

Cuando falta el primario, promueve una: la réplica pasa a ser el primario y el antiguo primario pasa a ser su réplica, aislado para que las escrituras nunca se dividan. Una réplica síncrona no tiene escrituras en vuelo, así que no se pierde nada; una asíncrona aún tenía escrituras que el primario no había enviado, así que la promoción las pierde. El nuevo primario arranca en frío. Consulta [Failover](/design/07-data-tier#failover).

## Opciones

::Options{id="replica"}

- **Replicación**: Síncrona hace que cada escritura en el primario espere a esta réplica. Entonces no sirve ninguna lectura obsoleta, y mientras está caída todas las escrituras agotan su tiempo de espera. Asíncrona es la predeterminada y puede ir con retraso, que es lo que responde el [enrutado read-your-writes](/patterns/read-your-writes). Consulta [Estrategias de replicación](/patterns/replication-strategies).
- **Motor**: la réplica ejecuta el motor de su primario; aquí no hay nada que elegir. Los límites de conexiones, los costes de consulta y el retraso siguen todos al primario.
- **Promover**: la réplica pasa a ser el primario y el antiguo primario pasa a ser su réplica. Una réplica síncrona no pierde nada; una asíncrona pierde las escrituras que aún estaban en vuelo.

## Cómo falla

- Como toda Base de datos, rechaza conexiones por encima de su límite.

### [Retraso de replicación](/incidents/repl-lag)

- **Señales:** Una ráfaga de escrituras deja a las réplicas segundos por detrás, y las lecturas posteriores a una escritura vuelven como errores `stale`.
- **Qué hacer ahora:** En los Servidores de aplicaciones que sirven las lecturas, pon el selector en **Leer tus escrituras**, para que envíen esas lecturas al primario. Necesita [Enrutado read-your-writes](/research/ryw-routing).
- **Prevenir:** Investiga [Enrutado read-your-writes](/research/ryw-routing) y activa **Leer tus escrituras** en los Servidores de aplicaciones que sirven checkouts. Una réplica **Síncrona** también se mantiene al día, con [Replicación síncrona](/research/sync-replication).

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta de la réplica se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y su parte de las lecturas falla.
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

- Activa read-your-writes en los Servidores de aplicaciones que sirven checkouts.
- Enlaza una réplica desde los Servidores de aplicaciones, y los informes salen del primario al instante.
- Compra un primario más grande, no más réplicas, para una mezcla con muchas escrituras.

:::Note{tone="real"}
La replicación asíncrona es la predeterminada en Postgres real, así que las réplicas reales también van con retraso. Consulta [consistencia de lectura de tus propias escrituras](/glossary/read-your-writes-consistency).
:::
