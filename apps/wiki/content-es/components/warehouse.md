El Almacén de datos representa a BigQuery: una base de datos columnar construida para escanear tablas grandes en busca de informes.

## Cuándo colocarlo

- Colócalo cuando aparezcan Informes en la mezcla y la Base de datos se ralentice en todos los tipos, no solo en los informes. Se desbloquea con [Almacenamiento de datos](/research/data-warehouse).
- Colócalo antes de que crezcan los informes de la Era de la Serie B, no después del primer incidente.

El Sandbox [Analítica en el primario](/sandboxes/analytics-primary) lo muestra.

::Sandbox{id="analytics-primary"}

## Cómo funciona

Cada escaneo es lento pero no tiene límite de capacidad, y pagas por cada escaneo además de un pequeño Gasto. Los escaneos de informes son todo lo que atiende, y ningún Componente queda detrás. Consulta [OLTP y OLAP](/glossary/oltp-and-olap).

Hasta que enlazas un Almacén de datos, la [Base de datos](/components/database) ejecuta los escaneos de informes en el primario. Un escaneo ahí expulsa la caché de búfer y retiene bloqueos, así que se ralentizan las lecturas y escrituras de todos los tipos. Cuando un Servidor de aplicaciones se enlaza con ambos, los escaneos van al Almacén, y el primario deja de ejecutarlos.

## Cómo falla

El Almacén en sí no se sobrecarga en el juego. Lo que sale mal:

- Cada escaneo es lento, así que la latencia de los informes se mantiene alta. Los informes se juzgan contra su propio objetivo, así que normalmente no pasa nada.
- Al pagarse por escaneo, una mezcla pesada de informes aparece como un coste de terceros en el Ledger.

### [El informe tumba la Base de datos](/incidents/report-db)

- **Señales:** Un informe de fin de trimestre escanea todas las tablas del primario, todos los tipos se ralentizan, y el Inspector de la Base de datos dice "Un informe está escaneando todas las tablas."
- **Qué hacer ahora:** Selecciona la Base de datos y pulsa **Cancelar informe**.
- **Prevenir:** Coloca un Almacén de datos. Se lleva el escaneo, así que nunca llega al primario.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, y el tablero de esa región se pone gris con ellos.
- **Qué hacer ahora:** Nada lo acelera. **Hacer failover** mueve solo Nodos que no guardan datos, así que este sigue caído hasta que termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error. Un almacén repartido entre regiones no necesita nada de ti.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region) y [GeoDNS](/research/geo-dns), y luego ejecuta una copia en una segunda región.

:::Note{tone="real"}
Separar la analítica de las transacciones es una lección clásica. Los equipos reales copian los datos a un almacén para que los informes nunca compitan con los checkouts.
:::
