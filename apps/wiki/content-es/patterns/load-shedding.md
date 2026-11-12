---
title: Descarte de carga
summary: Cuando la demanda supera la capacidad, rechaza pronto el trabajo más barato para que el trabajo que conservas siga terminando a tiempo.
section: patterns
group: Resilience
order: 505
aliases: shed load, overload, backpressure, priority, 503, load shedding, descartar carga, sobrecarga, contrapresión, prioridad
---

El descarte de carga (load shedding) descarta algunas peticiones a propósito, para que el resto reciba una respuesta rápida y correcta.

## Cuándo usarlo

- El tráfico puede superar la capacidad durante un tiempo: un lanzamiento, unas rebajas, una oleada de bots.
- Añadir capacidad lleva minutos y el pico dura segundos.
- Algunas peticiones importan más que otras, como un pago frente a una sugerencia de búsqueda.

## Cómo funciona

Un servidor que lo acepta todo se queda sin espacio y responde despacio a todos, y luego a nadie. Un servidor que descarta comprueba su propia cola o su CPU al llegar la petición. Pasado un umbral, devuelve un error de inmediato para los tipos de menor valor y sigue sirviendo el resto. El rechazo cuesta unos microsegundos, mientras que una petición condenada retendría un hilo durante segundos.

Al 130% de la capacidad sin descarte, cada petición espera detrás de una cola creciente y la mayoría agota su tiempo. Con descarte, el 23% de las llegadas que superan la capacidad recibe un 503 rápido, y el otro 77% ve una latencia normal.

## Qué cuesta

Las peticiones descartadas son ingresos perdidos y errores visibles, así que el umbral y la clasificación deciden quién paga. Los clientes que reintentan un 503 de inmediato deshacen el beneficio, por eso el descarte se combina con [backoff](/patterns/retry-with-backoff). También oculta un sistema infradimensionado, así que alerta sobre la tasa de descarte en lugar de celebrar un panel en verde.

## En Quorum

::Design{id="shed-low-value"}

El Servidor de aplicaciones de aquí es demasiado pequeño para sus Usuarios. **Shed low value** está bajo **Overload** en el Servidor de aplicaciones y necesita [Descarte de carga por prioridad](/research/load-shedding). Pasada su línea de carga, el Servidor de aplicaciones rechaza tipos de petición enteros, empezando por los de menor valor, hasta volver por debajo de la línea, y los tipos que conserva siguen rápidos. Las peticiones descartadas cuentan como errores, así que el pie de imagen aún muestra algunos. La [Degradación elegante](/patterns/graceful-degradation) descarta en su lugar los tipos más caros.

[Sobrevivir a un pico de tráfico](/guides/survive-a-traffic-spike) lo muestra en uso. El glosario define el [descarte de carga](/glossary/load-shedding) y la [contrapresión](/glossary/backpressure).
