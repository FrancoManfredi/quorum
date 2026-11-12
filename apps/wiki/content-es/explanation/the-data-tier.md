---
title: El nivel de datos
summary: Por qué el estado es lo difícil de escalar, y cómo la Base de datos, la Caché, la Réplica de lectura y los almacenes de quórum cambian velocidad por frescura.
section: explanation
order: 7
era: 1
aliases: database, postgres, cache, redis, replica, replication lag, stale, slow query, index, n+1, quorum, wide-column, distributed sql, warehouse, hot key, base de datos, caché, réplica, retraso de replicación, obsoleto, consulta lenta, índice, quórum, columnas anchas, SQL distribuido, almacén de datos, clave caliente
gdd: /design/07-data-tier
---

El estado es lo difícil de escalar. Los Servidores de aplicaciones son fáciles de copiar porque no guardan
datos, así que diez copias son tan correctas como una. Los datos son distintos, porque cada copia tiene que
coincidir con las demás o los usuarios ven la respuesta equivocada. Por eso el nivel de datos se convierte en
el reto a largo plazo de toda Empresa.

## La Base de datos es la fuente de verdad

La [Base de datos](/components/database) responde consultas de lectura, consultas de escritura y
transacciones. Hasta que enlazas un Componente mejor, también hace mal otros tres trabajos: la búsqueda de
texto completo, los archivos subidos guardados como filas y los escaneos de informes. Cada uno cuesta mucha
más CPU que una lectura normal. Un [Motor de búsqueda](/components/search), un
[Almacenamiento de objetos](/components/storage) y un [Almacén de datos](/components/warehouse) te quitan
esos trabajos.

Cuatro límites acotan una Base de datos:

- **CPU.** Cada consulta cuesta CPU, y una Base de datos en frío, recién reiniciada, necesita más por
  consulta.
- **Conexiones.** Postgres ejecuta un proceso por conexión y acepta un número fijo. MySQL da un hilo a cada
  conexión y aguanta varias veces más. Lee [Errores y reintentos](/explanation/errors-and-retries) para ver
  por qué más Servidores de aplicaciones empeoran esto.
- **Las IOPS del volumen.** Cada escritura y cada lectura que no acierta en la caché del búfer espera al
  disco. Un volumen de propósito general responde 3,000 de esas por segundo, y uno aprovisionado 64,000.
- **La caché del búfer.** Los escaneos de informes llenan la memoria con datos fríos. Las demás lecturas van
  entonces al disco, y las escrituras esperan detrás de los escaneos. Por eso la analítica y las
  transacciones no deberían compartir una Base de datos. Mira [OLTP y OLAP](/glossary/oltp-and-olap).

Una caja más grande levanta los dos primeros límites. El sharding levanta el límite de CPU en las escrituras,
porque cada shard se queda con su parte, pero cada shard factura como una Base de datos propia.

## Dos motores, dos formas de trabajo

Postgres y MySQL son el mismo trabajo con costes distintos. Postgres aguanta 100 conexiones a unos 8 MB cada
una y responde lecturas, escaneos y búsqueda de texto completo entre un 5 y un 10% más barato que MySQL. MySQL
aguanta 500 conexiones a cerca de 1 MB cada una y responde escrituras y pagos un 30% más barato, porque
InnoDB actualiza la fila en el sitio. También cambia el esquema en línea, mientras que muchos `ALTER` de
Postgres toman el bloqueo de la tabla, y solo Postgres conserva filas muertas para VACUUM, así que solo
Postgres se topa con el Bloat de tabla. Una Empresa con muchas lecturas quiere Postgres; una con muchas
escrituras quiere MySQL.

Las réplicas siempre ejecutan el motor de su primario, y un cambio de motor llega a todas las Bases de datos
a la vez. La replicación solo copia entre motores iguales.

## Más de una Base de datos: agrúpalas

Una segunda Base de datos no es una seguidora. Enmarca juntas las Bases de datos que guardan un mismo
conjunto de datos: la caja forma un **Grupo de datos**, y su topología dice cómo comparten esas Bases de datos
las filas del grupo. Primario único (el comienzo) acepta escrituras en una Base de datos y lecturas en
Réplicas de lectura. Con sharding da a cada Base de datos su partición de las filas del grupo, así que las
escrituras escalan, pero las transacciones entre shards cuestan hasta 3× y pueden fallar en cualquiera de los
dos. Multi-leader copia cada fila a cada Base de datos y deja que cada una acepte escrituras, así que las
escrituras locales son rápidas, pero la certificación descarta las escrituras en conflicto (gana el primer
commit) y cada escritura cuesta 1.25× de CPU para replicarse. Cambiar la topología de un grupo mueve sus
filas: 24 Horas de desarrollo y un minuto por GB, como un resharding. Un grupo con una sola Base de datos no
tiene a dónde moverlas, así que toma la elección al instante y la copia empieza con la segunda Base de datos
de la caja.

Las filas siguen a los Servicios. Cada Servicio posee una parte igual de los datos de la Empresa, así que un
grupo guarda las partes de los Servicios cuyos almacenes de datos están en él. Dos grupos nunca tocan las
filas del otro, y ninguno recibe la penalización de base de datos compartida por el otro, lo que permite que
un Tablero tenga dos productos independientes. Una Base de datos fuera de una caja guarda su propia parte y
está sola.

Los almacenes de quórum ([Almacén de columnas anchas](/components/wide)) y el consenso
([SQL distribuido](/components/dsql)) son las otras respuestas a "escrituras en más de un nodo": un quórum
espera R de N en una lectura y W de N en una escritura, mientras que el consenso espera a una mayoría en cada
escritura. Mira [Topologías](/design/07-data-tier#topologies).

## Las consultas lentas se esconden hasta que creces

Dos problemas de código cuestan poco al principio y mucho después.

Una **consulta sin índice** escanea la tabla. Su coste crece con el número de filas, y las filas crecen con
tus usuarios, así que es invisible en el Garaje y se convierte en el cuello de botella más tarde. El
incidente [Consulta lenta](/incidents/slow-query) es este problema. El [Análisis de consultas](/research/query-analysis)
lo muestra, y la tarea Añadir índice lo arregla.

Una **consulta N+1** viene de un ORM que envía una consulta por cada elemento de una lista. Laravel, Rails y
Django hacen lecturas extra en las vistas de página y las lecturas de API hasta que publicas la Carga
anticipada. Mira la [consulta N+1](/glossary/n1-query).

## La Caché: memoria delante de la Base de datos

Una [Caché](/components/cache) responde consultas de lectura desde memoria y envía los fallos a la Base de
datos. Su tasa de aciertos decide cuánta carga quita:

```latex
\text{hit ratio} = \sqrt{\frac{\text{memory}}{\text{hot data}}} \times \text{TTL factor} \times \text{write penalty} \times \text{warmth}
```

La raíz cuadrada modela el acceso sesgado. La mayoría de las lecturas piden unas pocas claves calientes, así
que una Caché pequeña ya guarda las más calientes, y el primer gigabyte vale más que el décimo. Los datos
calientes crecen con tus usuarios, así que una Caché que era lo bastante grande en la Era pasada puede
quedarse pequeña en la siguiente.

Las escrituras invalidan claves, así que una mezcla con muchas escrituras baja la tasa de aciertos. Un TTL
más largo conserva más aciertos pero sirve más datos obsoletos. Una Caché que se reinicia vuelve en frío, y
todos los fallos van a la Base de datos a la vez, lo que es una [estampida de caché](/glossary/cache-stampede).
La [Protección contra estampidas](/research/stampede-protection) y el [Precalentamiento de caché](/research/cache-warming)
la suavizan.

:::Note{tone="real"}
Redis responde comandos en un único hilo principal, así que un núcleo limita un nodo de Redis y un comando
lento bloquea a todos los clientes. Memcached usa todos los núcleos pero no conserva nada al reiniciarse.
Quorum modela ambos como motores de Caché con límites distintos.
:::

## Réplicas de lectura: más lecturas, datos más viejos

Una [Réplica de lectura](/components/replica) funciona como una Base de datos pero responde solo lecturas e
informes. Las escrituras van al primario y luego se transmiten a la réplica, así que la réplica siempre va un
poco por detrás, y el retraso crece con tu ritmo de escritura. Mira el [retraso de replicación](/glossary/replication-lag).

Tres Nodos quitan carga a una Base de datos ocupada, y cada uno tiene su propio trabajo:

- Una [Base de datos](/components/database) más grande es la única solución para las escrituras. Cuesta lo
  máximo, y cambiar su tamaño la reinicia.
- Una [Caché](/components/cache) es la solución más barata para las lecturas, mientras se lean una y otra vez
  las mismas filas calientes. No puede responder un informe, y su tasa de aciertos cae a medida que suben las
  escrituras.
- Una Réplica de lectura responde una lectura de cualquier fila y se encarga de los informes, a 0.7× del
  precio de caja de una Base de datos, y colocar una no reinicia nada. Algunas de sus lecturas llegan
  obsoletas.

Una lectura de una réplica con retraso puede devolver datos viejos. Que importe o no depende del tipo:

- Una vista de página acepta datos ligeramente viejos.
- Una lectura de API que llega obsoleta falla como `stale`.
- Un pago que lee su propia escritura falla como `stale`, lo que cuesta dinero de verdad.

El [Enrutado read-your-writes](/research/ryw-routing) envía al primario las lecturas que lo necesitan. Eso
arregla la mayoría de los errores `stale`, al precio de algo de carga de lectura en el primario.

::Sandbox{id="stale-checkout"}

## Quórums: el origen del nombre del juego

Un [Almacén de columnas anchas](/components/wide) guarda cada clave en N réplicas. Eliges dos números: R, las
réplicas a las que pregunta una lectura, y W, las réplicas que espera una escritura.

```latex
\begin{aligned}
R + W &> N && \qquad \text{every read asks at least one replica that has the latest write} \\
R + W &\leq N && \qquad \text{a read can miss the latest write: eventual consistency}
\end{aligned}
```

R y W más pequeños son más rápidos, porque cada operación espera una respuesta más temprana, y cuestan menos
operaciones de réplica. El precio es que un quórum débil sirve lecturas obsoletas. Un quórum que necesita a
todas las réplicas falla mientras una réplica está caída. Mira el [quórum](/glossary/quorum).

::Quiz{question="Un Almacén de columnas anchas guarda N = 3 réplicas. ¿Qué ajuste hace que toda lectura vea la última escritura?" options="R = 1, W = 1|R = 1, W = 2|R = 2, W = 2" answer="3" explain="Solo R = 2 y W = 2 da R + W > N. Los otros ajustes dejan que una lectura pregunte solo a réplicas que se perdieron la última escritura."}

El solapamiento no da una historia única y ordenada. Las escrituras concurrentes aún pueden entrar en
conflicto, así que incluso un quórum fuerte tiene alguna lectura obsoleta o algún duplicado ocasional en los
pagos. Un Nodo de [SQL distribuido](/components/dsql) lo arregla con consenso: cada escritura espera a una
mayoría de sus réplicas. Dentro de una región eso es barato, pero entre regiones cada escritura paga un viaje
de ida y vuelta largo. Mira [Raft](/glossary/raft).

## Claves calientes

Repartir los datos entre nodos solo ayuda si la carga también se reparte. En el incidente
[Clave caliente](/incidents/hot-key), una gran parte de las lecturas pide una sola clave, como la publicación
de una celebridad. Esa clave vive en un shard, así que ese shard se satura mientras los demás están ociosos.
El [Fan-out híbrido](/research/hybrid-fanout) te deja repartir las claves calientes entre shards. Mira la
[clave caliente](/glossary/hot-key).

## El patrón detrás de todo

Toda decisión de datos en Quorum es un intercambio entre velocidad, frescura y supervivencia. Una Caché y una
réplica compran velocidad con frescura, y un quórum fuerte y el consenso compran frescura con velocidad. Las
copias en otras zonas y regiones compran supervivencia con Gasto. La pista de Datos muestra la Investigación
detrás de cada herramienta:

::Track{track="data"}

Para pasos prácticos, mira [Escalar la base de datos](/guides/scale-the-database) y
[Arreglar consultas lentas](/guides/fix-slow-queries).
