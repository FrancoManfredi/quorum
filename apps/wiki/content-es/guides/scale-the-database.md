---
title: Escalar la base de datos
summary: Lee qué límite alcanza la Base de datos y quítale carga con una máquina más grande, un Pooler, una Caché, Réplicas de lectura o un almacén dedicado para cada tipo de consulta.
section: guides
order: 4
era: 1
aliases: database, postgres, db, connections, read replica, cache, pooler, working set, scale up, base de datos, conexiones, réplica de lectura, caché, conjunto de trabajo, escalar verticalmente
gdd: /design/07-data-tier
---

Usa esta guía cuando la Base de datos es el [cuello de botella](/guides/find-the-bottleneck), o cuando
muestra un aviso rojo o ámbar en el Inspector.

Los Servidores de aplicaciones son fáciles de copiar. La Base de datos no, porque guarda el estado.
Por eso la escalas de dos maneras: le das una máquina más grande, o le envías menos trabajo. Mira
[El nivel de datos](/explanation/the-data-tier) para ver el motivo.

## Encuentra el límite

1. Selecciona la Base de datos. Se abre el Inspector.
2. Lee los avisos de la parte superior del panel. Cada uno nombra un límite distinto:
   - "Rechazando … consultas/s: demasiadas conexiones." El límite de conexiones está lleno.
   - "El conjunto de trabajo no cabe en RAM: las lecturas van a disco." Las lecturas son lentas
     porque los datos calientes son mayores que la memoria.
   - "Sin créditos de CPU: limitado al 20% de CPU." Una máquina Burstable gastó sus créditos.
   - "Una consulta nueva no tiene índice." Corre un incidente de Consulta lenta. Ve a
     [Arreglar consultas lentas](/guides/fix-slow-queries).
3. Abre **Recursos** y busca el medidor más lleno: **CPU**, **RAM** o **Conexiones**.
4. Selecciona el Nodo **Usuarios** y abre **Peticiones**, y anota qué tipos de petición sirves,
   porque cada tipo envía consultas distintas a la Base de datos.

Usa la sección de abajo que corresponda al límite.

## Las conexiones están llenas

Postgres abre un proceso por conexión, hasta 100, y cada copia de Servidor de aplicaciones mantiene
sus propias conexiones, así que más Servidores de aplicaciones pueden tumbar la Base de datos.

1. Investiga [Pooling de conexiones](/research/pooling).
2. Coloca un [Pooler de conexiones](/components/pooler) entre los Servidores de aplicaciones y la Base
   de datos. Enlaza cada Servidor de aplicaciones al Pooler, y el Pooler a la Base de datos.
3. Mantén **Modo de pooling** en **Transacción**. En este modo, muchas conexiones de la aplicación
   comparten 20 conexiones con la Base de datos. El modo **Sesión** necesita una por cliente y apenas
   ayuda.
4. Si las peticiones fallan como `caída` tras el cambio, encola la tarea **Eliminar el estado de
   sesión** en el panel del Equipo (T), porque el pooling por transacción rompe el código que guarda
   estado de sesión hasta que se entregue.

Comprueba que el medidor de Conexiones baja y que el aviso "Rechazando" desaparece.

En el Sandbox [Límite de conexiones](/sandboxes/connection-limit), un despliegue duplica cada pool.

## La CPU está llena

1. Selecciona **Más grande** en la sección **Instancia**. Cada tamaño duplica vCPU y RAM.
2. Si la Base de datos sigue siendo el cuello de botella, quítale lecturas:
   - Investiga [Caché](/research/caching) y coloca una [Caché](/components/cache) entre los
     Servidores de aplicaciones y la Base de datos. Responde lecturas desde memoria mientras los
     datos calientes quepan. Las escrituras pasan de largo.
   - Investiga [Réplicas de lectura](/research/replication) y coloca una
     [Réplica de lectura](/components/replica). Enlaza la Base de datos a ella para que se una a su
     Grupo de datos, y luego enlaza los Servidores de aplicaciones a la réplica. Responde solo
     consultas de lectura.
3. Si usas Laravel, Rails o Django, investiga [Carga anticipada](/research/eager-loading) y encola su
   tarea, porque estos frameworks con ORM envían varias consultas de lectura donde bastaría una. Mira
   [Consulta N+1](/glossary/n1-query).

Comprueba que la fila Carga de la Base de datos baja del 70% y que el contorno se aleja.

:::Note{tone="warn"}
Una Caché con un **TTL** largo acierta más y sirve más datos viejos. Una Réplica de lectura va por
detrás de las escrituras, así que algunas lecturas de la API salen `obsoleto`. Investiga
[Enrutado read-your-writes](/research/ryw-routing) y activa **Leer tus escrituras** en la sección
**Sobrecarga** de cada Servidor de aplicaciones para enviar al primario las lecturas que siguen a una
escritura.
:::

En el Sandbox [Mayoría de lecturas](/sandboxes/read-mostly), dominan las lecturas y trabajas bajo un
límite de Gasto. En el Sandbox [Estampida](/sandboxes/stampede), la Caché se reinicia vacía.

## Las lecturas van a disco

1. Abre la sección **Instancia** y elige la familia **Memoria**. Tiene el doble de RAM que General por
   vCPU.
2. O selecciona **Más grande** para tener más RAM.
3. Comprueba que el aviso "las lecturas van a disco" desaparece.

El conjunto de trabajo crece con los usuarios, así que este aviso vuelve a medida que creces.

Después de cada cambio, espera unos segundos de tiempo de juego y comprueba que la fila Carga de la
Base de datos está normal, por debajo del 70%, y que el Apdex del HUD sube hacia su objetivo. Con
[Logs estructurados](/research/logs), selecciona el Nodo Usuarios y lee **Errores por causa**, donde
`rechazado`, `obsoleto` y `caída` deben mantenerse cerca de cero.

## Lleva el trabajo al almacén adecuado

La Base de datos puede responder casi cualquier consulta, pero mal a gran volumen. Cuando llega un
tipo de petición nuevo en una Era, dale a sus consultas un Componente propio:

| Tipo de trabajo            | Componente                                               | Investigación                                            |
| -------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| Consultas de búsqueda      | [Motor de búsqueda](/components/search)                  | [Búsqueda de texto completo](/research/full-text-search) |
| Archivos subidos           | [Almacenamiento de objetos](/components/storage)         | [Almacenamiento de objetos](/research/object-storage)    |
| Trabajo lento, exportación | [Cola](/components/queue) y [Worker](/components/worker) | [Colas de mensajes](/research/queues)                    |
| Informes                   | [Almacén de datos](/components/warehouse)                | [Almacenamiento de datos](/research/data-warehouse)      |

Los informes en el primario también expulsan su caché de búfer, así que todos los demás tipos se
ralentizan. Un Almacén de datos detiene el incidente [El informe tumba la Base de datos](/incidents/report-db).

En el Sandbox [Analítica en el primario](/sandboxes/analytics-primary), un informe escanea todas las
tablas.

## Cuando una Base de datos no basta

Una segunda Base de datos no es un seguidor. Enmarca juntas las Bases de datos que guardan un mismo
conjunto de datos para crear un **Grupo de datos**, y elige su topología.

1. Coloca la segunda Base de datos.
2. Selecciona ambas Bases de datos con Mayús y pulsa **Enmarcar los nodos**. Un marco con dos o más
   Bases de datos de Primario único las pasa a Con sharding, porque un marco guarda un solo conjunto de datos.
3. Abre cualquiera de las Bases de datos y elige **Con sharding** o **Multi-leader** en **Topología**.

Un grupo con una sola Base de datos no tiene dónde copiar sus filas, así que la elección se aplica al
instante. Cuando ya hay dos Bases de datos en el grupo, un cambio posterior cuesta 24 horas de
desarrollo y una copia de las filas del grupo, como un resharding.

- **Con sharding** reparte las filas entre las Bases de datos, así que las escrituras escalan. Mantén
  las transacciones dentro de un shard cuando puedas; una que cruza shards cuesta hasta 3× y puede
  fallar en cualquiera de los dos.
- **Multi-leader** copia cada fila a cada Base de datos, así que cualquiera acepta escrituras. La
  certificación descarta las escrituras en conflicto (gana el primer commit) y cada escritura cuesta
  1.25× de CPU.

Cada grupo guarda una parte de las filas, repartidas por Servicio, así que un segundo grupo es la forma
en que un Tablero ejecuta dos productos independientes. Un marco sin ninguna Base de datos dentro solo
dibuja un área.

Desde la Era Serie C, los almacenes sin líder y de consenso aceptan escrituras en más de un nodo:

- [Almacén de columnas anchas](/components/wide) replica cada clave en N nodos con quórums ajustables.
  Investiga [Replicación sin líder](/research/leaderless).
- [SQL distribuido](/components/dsql) mantiene las transacciones en una mayoría de réplicas.
  Investiga [Bases de datos de consenso](/research/consensus).

Ambos cuestan mucho más Gasto que una Base de datos. Pasa a ellos solo cuando la Base de datos más
grande con una Caché y réplicas aún no da abasto, o cuando necesitas sobrevivir a una caída de
región. Mira [Dar el salto global](/guides/go-global).
