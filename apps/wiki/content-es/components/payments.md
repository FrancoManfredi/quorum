Pagos representa las facturas y los cobros que convierten la actividad de tus usuarios en dinero en el banco.

## Cuándo colocarlo

- Pagos está siempre en el tablero, así que solo le cambias el tamaño.
- Auméntalo de tamaño cuando aparezca un banner de "Tu cajón de cobros está lleno". Mientras el cajón esté lleno, los ingresos nuevos se derraman y se pierden.
- Auméntalo de tamaño cuando no puedas cobrar con la frecuencia suficiente, por ejemplo durante una sesión larga de construcción.
- Investiga [Stripe Billing](/research/stripe) cuando quieras dejar de cobrar a mano.

## Cómo funciona

Cada petición exitosa genera ingresos, y esos ingresos esperan en el cajón de Pagos. Haz clic en Pagos para cobrarlos en Caja. El cajón guarda aproximadamente un minuto de ingresos a tu ritmo actual, y cada escalón de tamaño duplica lo que guarda.

Pagos no admite enlaces y no envía nada. No ralentiza las peticiones y no puede fallar. La Investigación Stripe Billing cobra los ingresos por ti, así que el cajón deja de importar. Consulta [Caja, Gasto y financiación](/explanation/money) para ver cómo se encuentran los ingresos y el Gasto en el Ledger.

No es el [Proveedor de pagos](/components/psp). El Proveedor de pagos cobra tarjetas en los checkouts. Pagos solo guarda el dinero que ya has ganado.

## Cómo falla

Un cajón lleno es el único fallo. Los ingresos que superan su tamaño se pierden, y tu Caja deja de crecer mientras el Gasto sigue cayendo sobre ella. Tus usuarios no notan nada, así que la pérdida es fácil de pasar por alto. Si la Caja baja mientras el Apdex es bueno, revisa primero el cajón.

Ningún incidente tiene a Pagos como objetivo.

## Consejos

- Cobra antes de dejar una Empresa funcionando un rato.
- Investiga Stripe Billing pronto: es barato y te quita una tarea para el resto de la partida.
