---
title: El Inspector
summary: El panel que se abre cuando seleccionas un Nodo. Sus advertencias, los indicadores de Recursos, los tamaños de Instancia, las Llamadas (ajustes y políticas de los Enlaces) y Ampliar todos.
section: play
order: 7
aliases: inspector, why it is busy, load change, cost receipt, resources, instance, calls, link policy, link settings, timeout, retries, breaker, bulkhead, hedge, upgrade all, restart, drain, por qué está ocupado, cambio de carga, recibo de coste, recursos, instancia, llamadas, política de enlace, ajustes de enlace, tiempo de espera, reintentos, ampliar todos, reiniciar, drenar
gdd: /design/15-ui-ux
---

Haz clic en un Nodo y el Inspector se abre a la derecha. Es donde lees por qué un Nodo va lento y donde cambias su tamaño, sus opciones y la política de cada Enlace que envía.

![El Inspector abierto sobre un Servidor de aplicaciones: cabecera, recuadro de advertencia, Recursos e Instancia.](/play/inspector.png)

Mira el recuadro rojo bajo el título y los indicadores de **Recursos** que hay debajo. Responden a por qué está llena la tarjeta.

Ciérralo con el botón **Cerrar** (la X) o con `Esc`. Selecciona otro Nodo y muestra ese. Las flechas seleccionan el Nodo más cercano, y `Enter` sobre un Nodo seleccionado mueve el foco dentro del panel.

## De arriba abajo

1. **Cabecera.** El icono del Componente, su nombre y su ordinal, el producto que representa y una insignia de tamaño.
2. **Resumen.** Una línea sobre lo que hace el Componente.
3. **Advertencias.** Un recuadro rojo o ámbar para un problema de ahora mismo. Ejemplos: **Sin RAM y en swap: cada petición va más lenta.** (rojo), **Sin créditos de CPU: limitado al 20% de CPU.** (ámbar), **Rechazando 12 consultas/s: demasiadas conexiones.** (rojo). Un recuadro puede llevar un botón, como **Reiniciar** bajo una fuga de memoria.
4. **En vivo ahora.** Las cifras actuales del Nodo, como peticiones por segundo y latencia. Con Analítica enlazada, sigue un desglose del tráfico. Con la Investigación `metrics`, **Carga del último día** dibuja una línea de tendencia.
5. **Recursos.**
6. **Instancia.**
7. Secciones con las opciones propias del Componente. Cuáles aparecen depende del Componente, como el **Stack** de un Servidor de aplicaciones o la política de un Balanceador de carga.
8. **Zona**, y **Standby** en un Nodo de datos.
9. **Región**, cuando hay una segunda región abierta.
10. **Llamadas.**
11. **Ampliar todos**, y luego los botones del pie.

## Recursos

La primera barra es la barra de objetivo, llamada **Límite · CPU** o el recurso que limita ahora al Nodo. Debajo, un indicador por cada recurso que tiene el Nodo:

- **CPU**: núcleos usados de los núcleos que posee.
- **RAM**: GB usados de los GB que posee.
- **Workers ocupados**: huecos en uso de los huecos totales.
- **Conexiones**: conexiones abiertas del máximo.
- **Créditos de CPU**: el saldo de una máquina Burstable. Esta barra lee el margen que queda, así que una barra casi vacía es el problema. Con cero, la máquina sigue limitada hasta que cambies la familia en **Instancia**.
- **Red**: tráfico de la tarjeta de red.

Cuando un límite no tiene indicador, la barra de objetivo lo dice, por ejemplo **IOPS de disco · sin indicador**. **Nada al límite** en verde significa que ningún límite está cerca.

Léelo así: el recuadro de advertencia nombra el síntoma, la barra de objetivo nombra el límite y el indicador muestra lo avanzado que está. Comprar **Más grande** cuando la barra de objetivo nombra **Conexiones** o **Workers ocupados** gasta Caja en CPU que no arregla ninguno de los dos topes.

## Por qué está ocupado

**Tráfico y carga** explica la carga además de mostrarla. **Cambio de carga** dice si la carga subió porque llegan más peticiones, porque cada petición cuesta más o porque el Nodo tiene menos capacidad. La Investigación añade detalle: [Métricas](/research/metrics) da el cambio en puntos, [Trazado distribuido](/research/tracing) añade **Amplificación** y **Llamada más lenta**, y [Profiling continuo](/research/profiling) añade la proporción de trabajo de cada operación, los recibos de **Coste por petición** y las filas de **¿Y si…?**. Cada bloque tiene un enlace **¿Por qué?** a [Encontrar el cuello de botella](/guides/find-the-bottleneck#find-out-why-it-is-busy), que explica qué significa cada causa y qué la arregla.

## Instancia

**Instancia** aparece en los Componentes con tamaños, como los Servidores de aplicaciones y las Bases de datos. Muestra el nombre del tamaño con sus vCPU y su RAM.

- **Más pequeño (gratis)** baja un tamaño y no cuesta nada, pero el Nodo se reinicia y la Caja que pagaste por el tamaño no vuelve.
- **Más grande · $** compra un tamaño. Un clic compra uno. Mantenlo pulsado para comprar más, uno cada cuarto de segundo. La tecla `U` hace lo mismo para el Nodo seleccionado.
- **Comprar diez tamaños** y **Comprar hasta el tamaño máximo** compran varios seguidos, hasta donde llegue tu Caja. Un aviso dice lo que pasó y termina con **Deshacer (Z) devuelve $x durante 30 s.**
- La fila de familia elige **Burstable**, **General**, **Cómputo**, **Memoria** o **ARM**. Una familia puede mostrar antes una tarjeta de Tradeoff. Léela y pulsa **Confirmar**.

Los rechazos son sencillos: **Servidor de aplicaciones está en su tamaño máximo.** y **Servidor de aplicaciones está en su tamaño mínimo.**

## Zona y standby

La sección **Zona** elige el dominio de fallo en el que funciona el Nodo. Las zonas fallan por su cuenta, así que las copias en zonas distintas sobreviven a la caída de una zona. Una llamada entre zonas añade latencia y Egress, y las zonas necesitan [Múltiples zonas](/research/multi-az).

Una Base de datos, un Pooler de conexiones, una Caché, un Motor de búsqueda y una Cola también pueden mantener un **Standby** en otra zona. El standby toma el relevo solo al cabo de unos segundos, o de inmediato con **Hacer failover**, y factura una segunda máquina mientras existe. Un Nodo sin standby se queda caído hasta que termina el incidente. Consulta [Disponibilidad y nueves](/patterns/availability-and-nines).

## Región

Cuando hay una segunda región abierta, una sección **Región** mueve el Nodo del Tablero de una región al de otra. Cada región tiene sus propios Usuarios y su propio viaje de ida y vuelta, y una llamada entre regiones lo paga. Los Nodos globales, como Usuarios y DNS, no tienen sección Región. Consulta [Dar el salto global](/guides/go-global).

## Precios

Desde la Serie A, un Nodo de cómputo también tiene un modelo de **Precios**:

- **Bajo demanda** factura la tarifa completa y te deja quitar el Nodo en cualquier momento.
- **Reservado** factura menos a cambio de un compromiso de una semana de calendario. Vender antes de que termine el plazo hace que debas el Gasto.
- **Spot** factura lo mínimo. El proveedor puede recuperar el Nodo con un aviso corto, y el Nodo vuelve en frío.

Mantén los Nodos del camino de las peticiones en Bajo demanda o Reservado, y usa Spot solo en una flota que pueda perder un Nodo. Consulta [Rightsizing, spot y reservadas](/patterns/rightsizing-spot-and-reserved).

## Llamadas

**Llamadas** enumera cada Enlace que sale de este Nodo, un bloque por destino. Aparece tras la Investigación **Tiempos de espera y reintentos**. El Enlace en sí no tiene un panel de ajustes, así que editas su política desde el Nodo que envía la llamada.

Cada bloque empieza con el nombre del destino. Las filas de debajo son selectores. Elige una opción en cada fila.

| Fila       | Opciones                                           | Cómo leerla                                                                                                                                                                                                                                                                           |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Timeout    | **1 s**, **5 s**, **30 s**                         | Cuánto espera el que llama. Un timeout corto libera antes el hueco del que llama, pero hace fallar llamadas que habrían funcionado. 30 s es el valor por defecto.                                                                                                                     |
| Reintentos | **Sin reintentos**, **Reintentar 3×**, **Backoff** | **Reintentar 3×** reintenta de inmediato, hasta tres veces, lo que multiplica la carga sobre un destinatario que ya está fallando. **Backoff** espera entre reintentos y añade como mucho una décima parte más de llamadas. **Backoff** necesita la Investigación Backoff con jitter. |
| Breaker    | **Sin circuit breaker**, **Circuit breaker**       | Un **Circuit breaker** detiene las llamadas durante 5 s cuando fallan la mitad. La etiqueta dice **Circuit breaker abierto** mientras está abierto. Necesita Circuit breakers.                                                                                                        |
| Bulkhead   | **Sin bulkhead**, **Bulkhead**                     | Un **Bulkhead** renuncia a una llamada tras 1 s y libera el hueco. Necesita Bulkheads.                                                                                                                                                                                                |
| Hedge      | **Una copia**, **Hedge**                           | **Hedge** envía una segunda copia de una llamada lenta y se queda con la respuesta más rápida. La cola baja, y el destinatario ve más llamadas. Necesita Peticiones especulativas.                                                                                                    |

Una fila que su Investigación no ha desbloqueado falta, o su opción está apagada. Si fuerzas una acción que está bloqueada, aparece una cinta sobre el dock. Dice **Bloqueado · Backoff**, luego la Investigación que lo desbloquea y su precio en Conocimiento, con un botón **Investigación** que abre ese elemento. La cinta espera hasta que la aceptes o la descartes.

Un API Gateway añade una sección propia, con los tipos de petición que lleva cada Enlace.

Elige **Backoff** más **Circuit breaker** en el Enlace hacia una Base de datos para detener una tormenta de reintentos, y evita **Reintentar 3×** ahí, porque multiplica la carga sobre el destinatario que ya está fallando. [Detener una tormenta de reintentos](/guides/stop-a-retry-storm) recorre el caso.

## Ampliar todos

**Ampliar los N** se muestra cuando el Tablero tiene dos o más Nodos del mismo Componente en esta región. Una pulsación hace crecer cada uno de ellos un tamaño. N cuenta los Nodos que todavía pueden crecer. Un aviso dice, por ejemplo, **Servidor de aplicaciones ×3 creció un tamaño.** y añade **Se acabó la caja.** cuando la Caja puso fin a la tanda. El botón está apagado cuando nada puede crecer o no puedes pagar.

## El pie

- **Cobrar** en Pagos, con la cantidad que hay en el cajón.
- El botón de tamaño, que dice **Cajón más grande** en Pagos, **Más muestras** en Analítica y un nombre de tamaño en los demás. A diferencia del pie de la tarjeta, aquí un clic compra.
- **Reiniciar** en los Servidores de aplicaciones y los Workers. Libera la memoria con fugas, y el Nodo vuelve en frío.
- **Drenar** tras la Investigación Comprobaciones de estado. Detiene el tráfico nuevo y deja que el Nodo termine lo que tiene.
- **Vender**, cuyo tooltip dice **Vender por $x (Eliminar)**. Abre la barra de confirmación. Los Nodos fijos no tienen **Vender**.
