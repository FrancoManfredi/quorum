---
title: Lee la tarjeta de un Nodo
summary: Cada fila, indicador y marca de la tarjeta de un Nodo, qué significan las cuatro formas de estado, el contorno del cuello de botella y el botón del pie que mantienes pulsado para comprar.
section: play
order: 6
aliases: node card, card, status shape, load bar, bottleneck outline, footer, hold to buy, collect, stranded, limit row, tarjeta de nodo, tarjeta, forma de estado, barra de carga, contorno del cuello de botella, pie, mantener para comprar, cobrar, varadas, fila de límite
gdd: /design/15-ui-ux
---

La tarjeta de un Nodo muestra lo que recibe el Nodo, lo lleno que está y lo que envía después. Lee primero la fila **Load** (carga): te dice cuánto se acerca el Nodo a su límite.

::Component{id="server"}

![Una tarjeta de Nodo en el Tablero: la cabecera, las filas y el botón del pie.](/play/node-card.png)

Mira la cabecera, luego la barra **Load** y después el pie, en el borde inferior.

## La cabecera

La cabecera contiene un medallón con el icono del Componente, el nombre y el ordinal del Nodo, puntos de tamaño y una pequeña línea de contexto. Esa línea puede contener un número de copias como **×3**, una letra de zona y, para un Nodo de otra región, la región y el viaje de ida y vuelta, como **EU 90 ms**.

La esquina del medallón lleva la marca de estado.

| Forma     | Significado                                                                   |
| --------- | ----------------------------------------------------------------------------- |
| Punto     | El Nodo está sano.                                                            |
| Triángulo | Funciona al 70% de su capacidad o más, o hay peticiones varadas o rechazadas. |
| Cuadrado  | Funciona al 90% de su capacidad o más.                                        |
| Cruz      | El Nodo está caído.                                                           |

Un Nodo sin tráfico no muestra ninguna marca. Cada forma tiene su propio color, pero la forma por sí sola basta. Un jugador que no distingue los colores lee el mismo Tablero.

## Las filas

Las filas varían según el Componente. Estas aparecen en la mayoría de los Nodos, en este orden.

| Fila                   | Qué muestra                                                                                                                                                                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inbound** (entrada)  | Peticiones por segundo que llegan al Nodo. Se pone roja cuando el Nodo descarta algunas.                                                                                                                                                                                                       |
| **Load** (carga)       | Una barra y un texto como **72% of 40/s**: la utilización y la Capacidad con la que se mide. **idle** (inactivo) significa que no hay tráfico. La barra se vuelve ámbar desde el 70% y roja desde el 90%. Tras la Investigación `metrics`, una pequeña línea de tendencia se sitúa en la fila. |
| **Limit** (límite)     | Aparece tras la Investigación `profiling`. Nombra el recurso que limita el Nodo: **CPU 22%**, **RAM 80%**, **Workers 20/20**, **Network 40%**, **CPU credits**, **Connections 90/100**, **Disk IOPS**, **Throughput** o **Nothing tight** (nada al límite).                                    |
| Fila de stack          | Los Servidores de aplicaciones y los Workers muestran su runtime y su framework.                                                                                                                                                                                                               |
| **Latency** (latencia) | El tiempo que añade el Nodo. Con la Investigación `percentiles` dice **12 ms · p99 40 ms**.                                                                                                                                                                                                    |
| **Out** (salida)       | Peticiones por segundo enviadas a lo largo de sus Enlaces. Cuando algunas peticiones no tienen ningún Enlace que las acepte, la fila pasa a ser un **Stranded** rojo con la tasa que se pierde.                                                                                                |

**Stranded** (varadas) es la fila que hay que perseguir. Las peticiones que llegan a un Nodo sin ningún Enlace de salida que las tome cuentan como errores, así que enlaza el Nodo con algo que las acepte.

Una barra **Load** baja no lo dice todo: lee **Limit** a su lado, porque un Nodo con una **Load** del 40% todavía puede estar limitado por **Connections**.

Algunos Componentes cambian filas por las suyas:

- **Usuarios** muestran **Users**, **Apdex** y **Requests**.
- **Pagos** muestran **Revenue** (ingresos) y **Drawer** (cajón), la Caja que espera a ser cobrada. Tras la Investigación de Stripe, la fila dice **Stripe**.
- **Analítica** muestra **Sampling**, **Kept**, **Unclassified** cuando parte del tráfico no llega a ninguna sonda, y las filas principales de Conocimiento.
- Una **Base de datos** muestra **Engine**, **Volume** y **Connections**.
- Una **Caché** muestra **Hit ratio** (tasa de aciertos).

## El contorno del cuello de botella

La Simulación elige el único Nodo cuya Capacidad extra ganaría más Ingresos ahora mismo. Ese Nodo recibe un contorno ámbar que pulsa. Ninguna etiqueta lo nombra, así que lee la tarjeta para encontrar la causa.

Mira el contorno. La barra **Load** de esa tarjeta suele estar ámbar o roja, y la fila **Limit** nombra qué arreglar.

El contorno se mueve cuando arreglas el Nodo: si salta a un Nodo nuevo, el primero ya no es el límite, y si ningún Nodo lo tiene, nada limita los Ingresos. El contorno marca dónde ayuda más la Caja, así que compruébalo antes de comprar tamaño en otro sitio.

## El pie

La franja de la parte inferior de la tarjeta es un botón. Lo que hace depende del Nodo.

| Texto del pie                   | Qué hace                                                          |
| ------------------------------- | ----------------------------------------------------------------- |
| Un nombre de tamaño y un precio | Compra el siguiente tamaño. Tienes que mantenerlo pulsado.        |
| **Samples** y un precio         | En Analítica: compra más muestreo. Tienes que mantenerlo pulsado. |
| **Collect** y una cantidad      | En Pagos: cobra el cajón. Lo hace un solo clic.                   |
| **Drawer empty**                | No hay nada que cobrar. El botón está apagado.                    |
| **Collected automatically**     | Pagos tras la Investigación de Stripe.                            |
| **Largest size**                | El Nodo no puede crecer más.                                      |
| **Replace** y un precio         | El Nodo se detuvo. Paga para recuperarlo.                         |

### Mantén pulsado para comprar

Un tamaño cuesta Caja, así que la tarjeta pide intención: pulsa el pie y mantén el botón abajo mientras un relleno lo cruza. A los 0.6 segundos más o menos la compra se realiza, y la tarjeta reproduce una breve ráfaga.

Un clic rápido no compra nada, así que mantén el puntero abajo mientras se mueve el relleno, y arrastra fuera del botón para cancelar. Si sigues manteniendo tras la primera compra, la tarjeta compra otro tamaño cada cuarto de segundo hasta que sueltes, te quedes sin Caja o llegues al tamaño máximo. Un rechazo como **Sin caja: no puedes colocar, mejorar ni contratar hasta que la caja supere cero.** termina la pulsación con un solo aviso.

El botón **Más grande** del Inspector es distinto. Allí un solo clic compra un tamaño, y mantenerlo repite. Mira [El Inspector](/play/the-inspector).

::Component{id="payments"}

La tarjeta de Pagos de arriba muestra un pie que cobra con un solo clic. Compárala con el pie del Servidor de aplicaciones, que pide mantener pulsado.
