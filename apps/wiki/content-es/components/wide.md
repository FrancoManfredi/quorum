El Almacén de columnas anchas representa a Apache Cassandra, el Componente que da nombre al juego.

## Cuándo colocarlo

- Colócalo cuando las escrituras superen a una sola [Base de datos](/components/database), por ejemplo las escrituras de timeline del fan-out en escritura. Se desbloquea con [Replicación sin líder](/research/leaderless).
- Sáltatelo para los checkouts. Usa [SQL distribuido](/components/dsql) en su lugar.

## Cómo funciona

Copia cada clave en N réplicas y usa [quórums](/glossary/quorum) para leer y escribir. Recibe consultas de lectura y escritura, transacciones y escrituras de timeline. No envía nada más allá.

Cuando R + W es mayor que N, cada lectura pregunta al menos a una réplica que tiene la última escritura. Cuando no lo es, una lectura puede perderse la última escritura: [consistencia eventual](/glossary/eventual-consistency). Una escritura cuesta N operaciones de réplica y una lectura cuesta R, así que los ajustes más altos usan más capacidad. La latencia es el tiempo de la réplica más lenta a la que esperas.

Puedes repartirlo entre tus regiones abiertas. Cada región mantiene entonces sus propias réplicas, y el Gasto crece con cada región.

## Opciones

::Options{id="wide"}

- **N**: cuántas réplicas guardan cada clave. Una N más alta sobrevive a más réplicas perdidas y almacena más copias.
- **W**: cuántas réplicas deben confirmar una escritura. Una W más alta es más segura y más lenta.
- **R**: a cuántas réplicas pregunta una lectura. Una R más alta es más consistente y más lenta.

Una lectura ve la última escritura cuando R + W es mayor que N. Cuando no lo es, una lectura puede volver obsoleta. Consulta [Lecturas y escrituras de quórum](/patterns/quorum-reads-and-writes).

- **Claves calientes**: con [Fan-out híbrido](/research/hybrid-fanout), Dividir saca una clave caliente de su shard, de modo que una sola clave deja de marcar el ritmo. Consulta [Claves calientes y shards calientes](/patterns/hot-keys-and-hot-shards).
- **Regiones**: Distribuidas mantiene un quórum en cada región abierta, de modo que el almacén sigue sirviendo durante una caída de región. Cada región añade Gasto, y una escritura espera a las regiones que necesita su quórum.

## Cómo falla

- Un quórum débil sirve lecturas obsoletas.
- Los checkouts siguen fallando de vez en cuando, incluso con un quórum fuerte, porque algunos vuelven obsoletos o duplicados. Solapamiento no es linealizabilidad.
- Cuando se pierde una réplica, no puede formarse un quórum que necesite todas las réplicas, y esas llamadas fallan.

### [Fallo de instancia](/incidents/instance)

- **Señales:** El almacén pierde una réplica. Las llamadas cuyo quórum necesita todas las réplicas fallan.
- **Qué hacer ahora:** No hay nada que pulsar: no aparece ningún botón Reemplazar, porque el almacén sigue sirviendo los quórums que aún puede formar. Termina por sí solo tras 60 s como máximo.
- **Prevenir:** Sube N y elige un quórum que sobreviva a una réplica perdida, como W y R de 2 con N de 3.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez.
- **Qué hacer ahora:** Nada devuelve la zona antes; termina por sí sola tras 120 s como máximo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y luego pon copias en zonas distintas con el ajuste Zona. Un almacén distribuido mantiene réplicas en cada zona.

### [Clave caliente](/incidents/hot-key)

- **Señales:** Un shard se pone rojo mientras los demás están ociosos.
- **Qué hacer ahora:** Pon **Claves calientes** en **Dividir** en el almacén. Necesita [Fan-out híbrido](/research/hybrid-fanout); sin él, el incidente termina por sí solo tras 90 s como máximo.
- **Prevenir:** Investiga [Fan-out híbrido](/research/hybrid-fanout) y pon **Claves calientes** en **Dividir**.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, salvo que el almacén esté distribuido.
- **Qué hacer ahora:** Nada lo acelera; termina por sí sola tras 180 s como máximo.
- **Prevenir:** Activa **Distribuidas**, para que cada región mantenga su propio quórum. Investiga [Múltiples regiones](/research/multi-region).

### [Error tipográfico del operador](/incidents/operator-typo)

- **Señales:** Todos los Nodos del almacén en su región caen. El director de incidentes elige primero la Base de datos más ocupada, así que solo llega a un Almacén de columnas anchas cuando el Diseño no tiene ninguna Base de datos ocupada.
- **Qué hacer ahora:** Coloca un Nodo nuevo de Almacén de columnas anchas en la misma región. El incidente termina cuando uno sirve.
- **Prevenir:** Investiga [Infraestructura como código](/research/infra-as-code).

## Consejos

- Usa W y R de 2 con N de 3 para leer después de escribir con un fallo de margen.

::Sandbox{id="hot-key"}
