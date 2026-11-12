El Conector CDC publica como evento cada cambio que hace una Base de datos, como hace Debezium.

## Cuándo colocarlo

- Colócalo cuando una segunda copia de los datos deba seguir a la [Base de datos](/components/database): un índice de búsqueda, un almacén de datos o un feed para otro servicio. Se desbloquea con [Captura de cambios de datos](/research/cdc) en la Serie B, por 18,000 ◇, tras [Streaming de eventos](/research/event-streaming) y [Almacenamiento de datos](/research/data-warehouse). Está en la Serie B porque necesita un consumidor que merezca la pena alimentar, y normalmente un flujo que reparta los cambios a más de uno.
- Cópialo cuando añadas una segunda Base de datos, ya que cada Base de datos necesita su propio conector.

## Cómo funciona

Debezium es una herramienta de **captura de cambios de datos** que lee el write-ahead log de una base de datos y publica cada insert, update y delete como un evento. Arrastra desde el puerto de salida de la Base de datos hasta el conector, y luego desde el puerto de salida del conector hasta un [Flujo de eventos](/components/log), un [Motor de búsqueda](/components/search), un [Almacén de datos](/components/warehouse) o una [Caché](/components/cache). Toma una copia de las escrituras que procesó la Base de datos, un cambio por cada una, y las publica como cambios a **20,000 cambios por segundo**. Nada más en el Diseño ve la copia, así que las escrituras de los Servidores de aplicaciones siguen yendo a la Base de datos y ella sigue respondiéndolas.

Eso es lo que lo hace útil. El [Motor de búsqueda](/components/search), el [Almacén de datos](/components/warehouse) y una [Caché](/components/cache) pueden seguir cada uno a la Base de datos, y la aplicación nunca escribe el mismo dato dos veces. Un flujo puede alimentar a los tres a la vez; un enlace directo alimenta a uno. La alternativa es una **escritura doble**: la aplicación escribe en la Base de datos y en el índice en una misma petición, y una caída entre las dos las deja en desacuerdo para siempre.

No lleva tráfico propio y no tiene opciones. Sus ajustes son la Base de datos que lee y el único Nodo al que publica. Nunca ralentiza una escritura.

## Cómo falla

- **Retraso.** Los cambios llegan al flujo o directamente al consumidor, y el consumidor los lee a su ritmo. Un resultado de búsqueda o un informe va por detrás de ese retraso, y un consumidor más atrasado que la ventana de retención pierde los cambios más antiguos. La tarjeta del conector muestra ese retraso, porque el conector no guarda nada en búfer: el flujo retiene lo que aún no se ha leído.
- **Orden.** Un cambio es una copia, así que no lleva más orden que el del commit de las escrituras. Un flujo con varias particiones solo mantiene el orden dentro de una partición, de modo que un flujo sin clave permite que una escritura reemplazada aterrice después de la que la sustituyó. Pon como clave del flujo la clave primaria de la fila.
- **Su propia tasa.** Por encima de 20,000 cambios por segundo descarta lo que no puede publicar, como cualquier Componente de capacidad plana. Una Base de datos ocupada supera a un solo conector.
- **Sin consumidor.** Si no hay nada enlazado que lea los cambios, quedan atascados.
- **Un bucle.** Un consumidor que escribe de vuelta en la Base de datos, con el flujo leyendo esa Base de datos, cierra un bucle que el tablero rechaza: un cambio que provoca una escritura que provoca un cambio.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Conector CDC se pone gris y su aviso dice "El host bajo esta VM murió. Sigue facturando." Las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Selecciona el Nodo y haz clic en **Reemplazar**. Cuesta Caja y vuelve en frío.
- **Prevenir:** Ejecuta un segundo Nodo del Componente, de modo que uno siga sirviendo mientras se reemplaza el otro.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez, el Conector CDC con ellos.
- **Qué hacer ahora:** Nada devuelve la zona antes. **Hacer failover** promueve un **Standby**, y este Componente no tiene ninguno, así que termina por sí solo tras 120 s como máximo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y mantén una copia del Componente en una segunda zona.

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris y el Conector CDC que hay en ella cae.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region), mantén una copia en una segunda región y añade [GeoDNS](/research/geo-dns) para enviar allí a los usuarios.

## Consejos

- Colócalo junto a la Base de datos que lee y el flujo en el que escribe.
- Lee el retraso, no la latencia del conector.
- Busca la solución de un diseño lento en el consumidor o en el flujo, no en el conector.
