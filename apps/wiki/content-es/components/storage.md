El Almacenamiento de objetos representa a Amazon S3: un almacén de archivos que crece sin límite.

## Cuándo colocarlo

- Colócalo cuando las subidas y el vídeo carguen la Base de datos: su CPU y su latencia suben a medida que crece la parte de Subida o Vídeo en la mezcla. Se desbloquea con [Almacenamiento de objetos](/research/object-storage).
- Añade una [CDN](/components/cdn) cuando sirvas vídeo.
- Revisa su Gasto en el Ledger a medida que envejece la Empresa, porque solo crece.

El Sandbox [Subidas lentas](/sandboxes/slow-uploads) muestra una subida lenta reteniendo un slot de Servidor de aplicaciones.

::Sandbox{id="slow-uploads"}

## Cómo funciona

No tiene límite de capacidad, y cada petición espera al primer byte, que es más lento que una consulta de base de datos. Los puts y gets de objetos llegan con archivos subidos y vídeo, y ningún Componente queda detrás. Consulta [almacenamiento de objetos](/glossary/object-storage).

Su Gasto crece con los datos que guarda, y esos datos nunca se reducen. Cada subida suma.

Hasta que enlazas Almacenamiento de objetos, la [Base de datos](/components/database) guarda los archivos como filas. Cuando un Servidor de aplicaciones se enlaza con ambos, los archivos van al Almacenamiento de objetos, y la Base de datos deja de aceptarlos.

## Opciones

::Options{id="storage"}

**Producto.** El almacén es S3, o R2 con [Optimización de egress](/research/egress-optimization). R2 no tiene egress a internet, y una lectura espera un poco más a su primer byte salvo que haya una CDN en el tablero. Cada lectura y escritura también factura por petición, al precio de su producto.

**Clase de almacenamiento.** La clase fija lo que cuesta conservar los bytes y lo que cuesta volver a leerlos.

| Clase                 | Precio de almacenamiento | Volver a leerlo                                                                        |
| --------------------- | ------------------------ | -------------------------------------------------------------------------------------- |
| Estándar              | Precio completo          | Al instante.                                                                           |
| Acceso poco frecuente | Mitad de precio          | Al instante, y una tarifa de recuperación por GB, en la misma línea de la factura.     |
| Archivo               | Una décima parte         | Solo tras una restauración. Mientras tanto, una petición `media` falla como `timeout`. |

Acceso poco frecuente sirve para archivos que se escriben una vez y se leen rara vez. Archivo sirve para los que se conservan solo porque una regla lo exige. Ninguno es gratis de leer, porque la tarifa de recuperación y la restauración son el precio del almacenamiento más barato. El Inspector y [Capa de datos](/design/07-data-tier#object-storage) contienen los precios.

**Ciclo de vida.** [Reglas de ciclo de vida del almacenamiento](/research/lifecycle-rules) mueven los objetos por sí solas cuando son lo bastante antiguos. Cada objeto que pasa de la ventana baja una clase, de Estándar a Acceso poco frecuente y de Acceso poco frecuente a Archivo. Un almacén que lleva un tiempo llenándose tiene la mayoría de sus bytes en la clase más barata, y la parte más antigua de sus lecturas falla como timeout hasta que se restauran esos objetos. El Inspector muestra qué parte del almacén ha pasado de la ventana, y [Capa de datos](/design/07-data-tier#object-storage) contiene la regla.

## Cómo falla

El Almacenamiento de objetos no se sobrecarga ni falla por sí solo en el juego. Sus problemas son la latencia y el coste.

- La latencia del primer byte se suma a cada vídeo y a cada subida. Una CDN responde la mayor parte del vídeo en el edge.
- El Gasto de almacenamiento solo crece. Revísalo en el Ledger a medida que envejece la Empresa.
- Una subida lenta retiene un slot de Servidor de aplicaciones mientras el archivo sube por la red. Envía las subidas a través de una [Cola](/components/queue) para que el Servidor de aplicaciones conserve solo la parte síncrona corta.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, y el tablero de esa región se pone gris con ellos.
- **Qué hacer ahora:** Nada lo acelera. **Hacer failover** mueve solo Nodos que no guardan datos, así que este sigue caído hasta que termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error. Un almacén repartido entre regiones no necesita nada de ti.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region) y [GeoDNS](/research/geo-dns), y luego ejecuta una copia en una segunda región.

## Consejos

- Combina el Almacenamiento de objetos con una CDN cuando sirvas vídeo.
- Enlaza los Workers con el Almacenamiento de objetos cuando envíes las subidas a través de una Cola.
