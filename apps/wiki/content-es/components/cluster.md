El Clúster de Kubernetes agrupa tus servicios en máquinas compartidas, como hace Kubernetes.

## Cuándo colocarlo

- Colócalo cuando ejecutes muchos Servidores de aplicaciones y Workers, y el Gasto o la velocidad de escalado importen más que la simplicidad. Se desbloquea con [Orquestación de contenedores](/research/containers).

## Cómo funciona

Los Servidores de aplicaciones y Workers enlazados con él se ejecutan como pods, empaquetados en nodos compartidos, así que cuestan menos Gasto por la misma capacidad. El Clúster en sí no recibe tráfico. Un [Autoescalador](/components/autoscaler) añade pods en segundos, en lugar de arrancar VM durante minutos. Consulta [orquestación de contenedores](/glossary/container-orchestration).

También aporta:

- **Despliegues rolling**: un despliegue defectuoso se detiene tras su primer lote de pods, así que solo falla una parte del tráfico.
- **Autorreparación**: cuando muere el host de un pod, el Clúster lo reprograma.

Los costes:

- **Vecinos ruidosos**: los pods comparten CPU, y los vecinos ocupados añaden retraso a una parte de las peticiones.
- **Trabajo de plataforma**: sin un Equipo de plataforma, cada Clúster consume horas de desarrollo de tus equipos de producto. Consulta [Equipo y velocidad](/explanation/team-and-velocity).
- **Actualizaciones**: cada versión de Kubernetes tiene soporte durante un tiempo limitado.

## Cómo falla

- Si el Clúster cae, sus pods vuelven a ejecutarse como VM normales, con Gasto completo y escalado lento.
- Los vecinos ruidosos elevan el p99 cuando los nodos compartidos van cargados.

### [Actualización forzada del clúster](/incidents/cluster-upgrade)

- **Señales:** La tarjeta del Clúster dice "El proveedor está forzando una actualización. Los pods que usan APIs eliminadas se caen." y los pods entran en bucle de fallos.
- **Qué hacer ahora:** Haz clic en **Actualizar clústeres** en la tarjeta. Pone en cola una tarea de horas de desarrollo, y el incidente termina cuando el Equipo la acaba.
- **Prevenir:** Ejecuta la tarea **Actualizar clústeres** cada trimestre, o dota de personal un Equipo de plataforma. Consulta [Tareas del Equipo](/team#tasks).

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris y el Clúster de Kubernetes que hay en ella cae.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region), mantén una copia en una segunda región y añade [GeoDNS](/research/geo-dns) para enviar allí a los usuarios.

## Consejos

- Usa un Clúster para muchos servicios. Cuesta menos tiempo de plataforma que varios Clústeres.
- Combina un Clúster con un Autoescalador. El escalado rápido de pods es la mayor parte de su valor.
