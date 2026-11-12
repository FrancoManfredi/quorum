El Proveedor de pagos representa a Stripe: el tercero que cobra las tarjetas de tus clientes.

## Cuándo colocarlo

- Colócalo cuando lances la Funcionalidad de Checkout. Sin él, los checkouts no tienen dónde cobrar.
- Auméntalo de tamaño antes de un pico, porque por encima de la tasa de su nivel descarta cobros.

Se desbloquea con la Investigación [Checkout](/research/checkout).

## Cómo funciona

Enlaza un Servidor de aplicaciones con él, y cada checkout envía un cobro. Es un Componente gestionado, así que colocarlo no cuesta nada, sirve a todas las regiones y cobra una comisión por cada checkout exitoso. Cada cobro espera un tiempo largo y fijo, que se ve en el p99 de Checkout. Cada escalón de tamaño es un nivel de uso que duplica cuántos cobros por segundo admite.

No lo confundas con [Pagos](/components/payments), el cajón donde esperan tus ingresos. Los checkouts son el tipo de petición de mayor valor, así que el Proveedor de pagos está en tu ruta más importante.

## Opciones

::Options{id="psp"}

- **Proveedor**: el primer proveedor atiende todos los checkouts. El segundo sirve mientras el primero está caído, y cobra más por checkout. Fíjalo antes de una caída, o pulsa **Cambiar de proveedor** cuando empiece una.

## Cómo falla

- Por encima de la tasa de su nivel, descarta cobros. Auméntalo de tamaño antes de un pico.

### [Caída del Proveedor de pagos](/incidents/psp-outage)

- **Señales:** Su Inspector dice "Su caída, no la tuya. Todos los checkouts fallan." y `buy` falla como `upstream`.
- **Qué hacer ahora:** Pulsa **Cambiar de proveedor**. Cuesta Caja, y el segundo proveedor sigue sirviendo al instante. Nada más lo termina antes de su duración de 60 s como máximo.
- **Prevenir:** Pon el **Proveedor** en **Segundo** antes de una caída. El segundo proveedor cobra más por checkout. Ninguna Investigación evita la caída en sí.

### [Cobro duplicado](/incidents/double-charge)

- **Señales:** Los cobros se ralentizan, aparecen errores `duplicate` y llegan los reembolsos.
- **Qué hacer ahora:** Pon los reintentos del Enlace de cobro en **Sin reintentos** en la sección Llamadas del Servidor de aplicaciones. Sin ningún Enlace con reintentos hacia el proveedor, el incidente termina.
- **Prevenir:** Investiga [Claves de idempotencia](/research/idempotency-keys) y haz la tarea Claves de idempotencia. No actives los reintentos en el Enlace de cobro antes de eso. Consulta [idempotencia](/glossary/idempotency).

### [Oferta flash](/incidents/flash-sale)

- **Señales:** Solo en e-commerce. La demanda de `buy` va a ×20 durante minutos, y la Base de datos y el Proveedor de pagos se saturan.
- **Qué hacer ahora:** Aumenta el tamaño del Proveedor de pagos, porque su nivel fija cuántos cobros admite. Nada más añade capacidad aquí.
- **Prevenir:** Pon una [Cola](/components/queue) delante del trabajo de checkout, e investiga [Autoescalado](/research/autoscaling) y [Descarte de carga por prioridad](/research/load-shedding).

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Proveedor de pagos se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Pulsa **Reemplazar** en su Inspector y paga el precio. Vuelve en frío.
- **Prevenir:** Coloca un segundo Proveedor de pagos, para que ya no esté solo.

## Consejos

- No actives los reintentos en el enlace de cobro hasta que tengas Claves de idempotencia.
- Da al enlace de cobro un timeout más largo que un cobro normal.

:::Note{tone="real"}
Stripe permite que un cliente envíe una clave de idempotencia con cada cobro, de modo que un reintento devuelve el primer resultado en lugar de cobrar otra vez.
:::
