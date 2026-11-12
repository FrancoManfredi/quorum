SQL distribuido mantiene correctas las transacciones entre regiones, como hace CockroachDB con el consenso de [Raft](/glossary/raft).

## Cuándo colocarlo

- Colócalo cuando tu Empresa opere en varias regiones y los checkouts deban seguir siendo correctos en todas. Se desbloquea con [Bases de datos de consenso](/research/consensus). Consulta [Dar el salto global](/guides/go-global).
- Sáltatelo para el tráfico que pueda servir una [Base de datos](/components/database) o un [Almacén de columnas anchas](/components/wide). Es el Componente de datos más caro, el almacén adecuado para los checkouts y uno caro para los feeds.

## Cómo funciona

Su capacidad se cuenta en transacciones, y una lectura cuesta una fracción de una. Cada escalón de tamaño duplica esa capacidad. Entran consultas de lectura, consultas de escritura y transacciones, y no pasa ninguna a otro Nodo.

Cada escritura espera a una mayoría de sus réplicas. En una región eso cuesta unos pocos milisegundos. Distribuida entre regiones, una escritura espera un viaje de ida y vuelta entre regiones, así que sube la latencia de escritura. Las lecturas siguen siendo locales. Cuando está distribuido, su Gasto crece con cada región.

## Opciones

::Options{id="dsql"}

- **Regiones**: Una sola mantiene todas las escrituras en una región, así que las escrituras pagan latencia local y una caída de región tumba el almacén. Distribuidas replica entre las regiones abiertas, así que el almacén sobrevive a una caída de región y cada escritura espera un viaje de ida y vuelta entre regiones. Necesita dos regiones abiertas, y su Gasto crece con cada una. Consulta [SQL distribuido y almacenes sin líder](/patterns/distributed-sql-and-leaderless-stores).

## Cómo falla

- Distribuido entre regiones, cada escritura paga el viaje de ida y vuelta. Los tipos con muchas escrituras lo notan en el p99.
- Sobrecargado, descarta consultas como cualquier Nodo de datos.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta de SQL distribuido se pone gris y su aviso dice "El host bajo esta VM murió. Sigue facturando." Las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Selecciona el Nodo y haz clic en **Reemplazar**. Cuesta Caja y vuelve en frío.
- **Prevenir:** Ejecuta un segundo Nodo del Componente, de modo que uno siga sirviendo mientras se reemplaza el otro.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez. Un Nodo distribuido entre regiones mantiene réplicas en cada zona, así que solo afecta a un Nodo en **Una sola** región.
- **Qué hacer ahora:** Nada lo acelera. El Nodo vuelve cuando termina el incidente, 120 segundos de simulación como máximo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az), o activa **Distribuidas** en Regiones.

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris. Un Nodo en **Una sola** región cae con él.
- **Qué hacer ahora:** Nada lo acelera. Distribuido entre tres regiones, sobrevive sin pérdida de datos, porque queda una mayoría, y no necesita nada de ti.
- **Prevenir:** Abre una tercera región y luego activa **Distribuidas** en Regiones. [Múltiples regiones](/research/multi-region) desbloquea las regiones, y [GeoDNS](/research/geo-dns) envía a los usuarios a la que sigue viva.

### [Partición de red](/incidents/partition)

- **Señales:** Aparece el banner **Partición de red**, y las llamadas entre regiones agotan su tiempo de espera. En un almacén basado en líder, las escrituras divergen.
- **Qué hacer ahora:** Haz clic en **Aislar al líder** en el banner. Consulta [partición de red](/glossary/network-partition).
- **Prevenir:** Investiga [Bases de datos de consenso](/research/consensus) y usa este Componente: un almacén de consenso mantiene un solo líder, así que las escrituras no divergen.

### [Error tipográfico del operador](/incidents/operator-typo)

- **Señales:** Todos los Nodos de SQL distribuido de una región caen a la vez.
- **Qué hacer ahora:** Coloca un SQL distribuido nuevo en esa región y enlázalo. El incidente termina cuando un Nodo de ese Componente vuelve a estar activo.
- **Prevenir:** Investiga [Infraestructura como código](/research/infra-as-code), para que un plan muestre lo que quita un cambio antes de ejecutarlo.

:::Note{tone="real"}
El consenso cambia latencia por corrección. Los equipos reales lo usan para el dinero y reservan almacenes más baratos para el resto.
:::

## Consejos

- Abre una tercera región antes de contar con que sobreviva a una caída de región.
