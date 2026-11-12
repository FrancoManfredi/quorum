El Proveedor de notificaciones push representa a Amazon SNS y SES: servicios que entregan por ti notificaciones push y correo electrónico.

## Cuándo colocarlo

- Colócalo cuando lances la Funcionalidad de notificaciones push de la página de [Equipo](/team#features). Sin él, los mensajes push no tienen adónde ir.

Se desbloquea con la Investigación [Notificaciones](/research/notifications).

## Cómo funciona

La entrega tarda un momento, pero los usuarios no la esperan. Los mensajes push entran y no se enlaza con nada aguas abajo. Es un Componente gestionado, así que colocarlo no cuesta nada, sirve a todas las regiones y factura por cada mensaje. Su límite de rendimiento es alto, y cada escalón de tamaño lo duplica.

Las notificaciones le llegan desde tu código. Una petición Notificar hace casi todo su trabajo de forma asíncrona. Con una [Cola](/components/queue) enlazada, un [Worker](/components/worker) envía el mensaje push. Sin ella, lo envía el propio Servidor de aplicaciones. Enlaza con el Proveedor de notificaciones push el Nodo que las envíe.

## Cómo falla

- Por encima de su límite, descarta mensajes. Con su límite alto, hace falta una audiencia muy grande.
- Su coste crece con cada mensaje. Vigila los costes de terceros en el Ledger.
- Las notificaciones push aumentan el crecimiento y también aumentan un poco el abandono, porque los usuarios se cansan de ellas. Ese coste viene de la Funcionalidad, no del Componente. Consulta [Usuarios y crecimiento](/explanation/users-and-growth).

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Proveedor de notificaciones push se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Pulsa **Reemplazar** en su Inspector y paga el precio. Vuelve en frío.
- **Prevenir:** Coloca un segundo Proveedor de notificaciones push, para que ya no esté solo.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez.
- **Qué hacer ahora:** Nada devuelve la zona antes. **Hacer failover** promueve un **Standby**, y este Componente no tiene ninguno, así que termina por sí solo tras 120 s como máximo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y luego pon copias en zonas distintas con el ajuste Zona.

## Consejos

- Envía las notificaciones a través de una Cola y Workers, para que un envío lento nunca retenga un slot de Servidor de aplicaciones.

:::Note{tone="real"}
Las colas reales entregan al menos una vez, así que una notificación puede llegar dos veces. Los equipos reales hacen idempotente el envío. Consulta [entrega al menos una vez](/glossary/at-least-once-delivery).
:::
