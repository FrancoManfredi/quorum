---
title: Conecta Nodos con Enlaces
summary: Arrastra desde el puerto de salida de un Nodo hasta otro Nodo para crear un Enlace, lee los rechazos y luego selecciona, edita y corta Enlaces con el ratón o con el teclado.
section: play
order: 4
aliases: link, links, wire, wiring, connect, connect nodes, out port, port, cut a link, remove a link, delete a link, keyboard link, link rules, enlace, enlaces, conectar, cablear, conectar nodos, puerto de salida, puerto, cortar un enlace, quitar un enlace, eliminar un enlace, enlace con teclado, reglas de enlace
---

Para crear un Enlace, pulsa sobre el puerto de salida del borde derecho de la tarjeta de un Nodo, arrastra hasta otro Nodo y suelta sobre su tarjeta. Las peticiones fluyen entonces del primer Nodo al segundo. El Enlace tiene dirección, y un Nodo sin ningún Enlace de salida no pasa nada más adelante, así que un Nodo que todavía recibe tráfico muestra una fila **Stranded** (varadas) roja y cuenta esas peticiones como errores. Los Nodos de datos y Analítica son la excepción.

## El puerto de salida

Cada tarjeta tiene un puerto de entrada en el borde izquierdo, donde llegan los Enlaces. Una tarjeta que envía tráfico también tiene un puerto de salida en el borde derecho, a la altura de la fila **Out**, donde salen los Enlaces. Una [Base de datos](/components/database) tiene un puerto de salida con un único fin: enlazar con un [Conector CDC](/components/cdc), que lee su registro de escrituras. No pasa ninguna petición.

Solo el puerto de salida empieza un Enlace. Nunca apuntas al puerto de entrada: basta con soltar en cualquier punto de la tarjeta de destino. Pulsar sobre cualquier otra parte de una tarjeta arrastra la tarjeta en su lugar, así que apunta al puerto.

::Component{id="server"}

_Un Servidor de aplicaciones tal como se ve en el Tablero. Su puerto de salida es el círculo del borde derecho._

## Crea un Enlace

1. Coloca los dos Nodos. Consulta [Coloca Componentes](/play/place-components).
2. Mueve el puntero sobre el puerto de salida del Nodo que envía. El cursor cambia.
3. Pulsa y arrastra. Un cable sigue al puntero.
4. Arrastra sobre el Nodo que recibe. Su tarjeta brilla.
5. Suelta. El Enlace aparece, y una cinta de peticiones empieza a moverse por él.

Si el Enlace funciona, la píldora de cambios de la parte superior lo nombra, como **Linked App Server to Database**. Pulsa `Z` para deshacerlo.

Si sueltas sobre un espacio vacío, o sobre el Nodo del que partiste, el cable vuelve de golpe y no pasa nada. El juego no muestra ningún mensaje para eso.

El primer Enlace desde un Servidor de aplicaciones que todavía ejecuta PostgreSQL en su propia máquina hasta una Base de datos saca PostgreSQL de allí. El juego dice **Postgres se movió del servidor de aplicaciones a su propia base de datos.** Lo mismo ocurre con un Enlace a un Pooler o a una Caché.

## Qué necesita un Enlace

Un Enlace está permitido cuando se cumple todo esto:

- El Nodo que envía envía algo. Usuarios, Servidores de aplicaciones y Balanceadores de carga lo hacen. Una Base de datos, Analítica y Pagos no.
- El Nodo que recibe acepta al menos un tipo de petición que envía el emisor. Una Base de datos acepta consultas, no vistas de página.
- Los dos Nodos son distintos, el Enlace no existe y no crearía un bucle.
- El emisor tiene un Enlace libre. Usuarios tiene uno, y unos pocos Componentes tienen un número fijo.

La dirección se deduce de la primera regla, así que el Enlace va de Servidor de aplicaciones a Base de datos y nunca de Base de datos a Servidor de aplicaciones, porque el Nodo de datos no envía nada más adelante.

Analítica es la excepción a la primera y a la última regla. Enlaza con ella cualquier Nodo salvo Pagos y muestrea el tráfico de ese Nodo, sea lo que sea lo que envíe. Este Enlace no gasta un Enlace libre. Solo muestrea el tráfico que llega, así que un emisor sin tráfico no le da nada que muestrear. Pagos no necesita ningún Enlace: los ingresos llegan solos a su cajón.

## Qué rechaza el juego

Un rechazo aparece como un aviso. El Enlace no se crea y no se cobra nada.

| Mensaje                                                                                            | Causa                                                                                   |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `Ya está enlazado.`                                                                                | El Enlace existe. Selecciónalo para verlo.                                              |
| `<Receptor> acepta <tipos>. <Emisor> envía <tipos>.`                                               | El receptor no acepta nada de lo que envía el emisor. Las dos listas están en el aviso. |
| `<Emisor> no envía nada más adelante. Enlázalo con Analítica para muestrearlo.`                    | El emisor no tiene salida, como una Base de datos o Pagos.                              |
| `<Receptor> no tiene entrada.`                                                                     | No se le puede enviar nada. Usuarios es un ejemplo.                                     |
| `<Emisor> acepta <n> enlaces.`                                                                     | El emisor tiene todos los Enlaces que puede tener.                                      |
| `Un dominio resuelve a un solo host. Pon DNS o un Balanceador de carga delante para llegar a más.` | Un segundo Enlace que sale de Usuarios.                                                 |
| `Ese enlace crearía un bucle.`                                                                     | El receptor ya lleva de vuelta al emisor, a través de otros Enlaces.                    |
| `<Emisor> no tiene tráfico que muestrear.`                                                         | Enlazaste Pagos o Analítica con Analítica.                                              |

Los Componentes de control tienen sus propios mensajes:

- `Enlaza Servidores de aplicaciones o Workers con el <Componente>.` aparece cuando enlazas otra cosa con un Autoescalador o con un Clúster de Kubernetes.
- `<Emisor> ya tiene un <Componente>.` aparece cuando un Servidor de aplicaciones o un Worker ya tiene un Autoescalador o un Clúster.
- `Enlaza una Base de datos con el <Componente>: lee su registro de escrituras.` aparece para un Conector CDC.

Otro texto de rechazo, `Enlaza dos nodos distintos.`, cubre un Enlace al propio Nodo. El puntero nunca lo produce, porque soltar sobre la tarjeta de partida cancela.

## Selecciona, edita y corta un Enlace

Un clic en un Enlace lo selecciona. Nunca lo corta.

1. Pasa el cursor por un Enlace. El cursor se convierte en un puntero.
2. Haz clic en él. Cualquier Nodo seleccionado se deselecciona, y una insignia **×** aparece en el centro del Enlace.
3. Para cortarlo, haz clic en la insignia **×**, o pulsa `Delete` o `Backspace`.
4. Para conservarlo, pulsa `Esc` o haz clic en un espacio vacío.

Verás que la cinta se detiene y el Enlace desaparece. La píldora de cambios dice **Cut** con los nombres de los dos Nodos, y `Z` devuelve el Enlace. Un clic derecho también selecciona un Enlace, y en una pantalla táctil lo hace un toque.

Comprueba qué está seleccionado antes de pulsar `Delete`. Con un Nodo seleccionado, `Delete` pide vender el Nodo, así que haz clic primero en el Enlace.

Un Enlace no tiene panel propio. Sus ajustes viven en el Nodo que envía. Selecciona el emisor y abre la sección **Llamadas** del Inspector. Para cada Enlace que sale de él, puedes fijar:

- Un timeout de **1 s**, **5 s** o **30 s**.
- Reintentos: **Sin reintentos**, **Reintentar 3×** o **Backoff**.
- **Sin circuit breaker** o **Circuit breaker**.
- **Sin bulkhead** o **Bulkhead**.
- **Una copia** o **Hedge**.

La sección **Llamadas** necesita la Investigación Tiempos de espera y reintentos. Cada opción adicional necesita la suya. [El Inspector](/play/the-inspector) explica la sección.

## Enlaza con el teclado

El teclado también puede crear un Enlace. Necesita el foco en el Tablero, no en un campo de texto.

1. Selecciona el Nodo emisor. Haz clic en él, o muévete con las flechas.
2. Pulsa `L`. El juego recuerda al emisor.
3. Pulsa las flechas hasta que el Nodo receptor esté seleccionado. Cada flecha selecciona el Nodo más cercano en esa dirección.
4. Pulsa `Enter` o `L` otra vez. El Enlace se crea, o un aviso dice por qué no.

Tras un rechazo, el emisor sigue recordado, así que prueba con otro Nodo. Pulsa `Esc` para olvidarlo.

## Pruébalo

Crea tres Enlaces en el tablero de práctica de abajo: Usuarios al Servidor de aplicaciones, el Servidor de aplicaciones a la Base de datos y el Servidor de aplicaciones a Analítica. Arrastra desde cada puerto de salida hasta la tarjeta siguiente. Luego selecciona un Enlace, córtalo con la insignia **×** y créalo de nuevo.

Dos Balanceadores de carga esperan en la parte inferior. Enlaza el primero con el segundo y luego arrastra desde el segundo de vuelta al primero. El juego lo rechaza con **Ese enlace crearía un bucle.**, y el último objetivo se marca cuando lo hayas leído. Nada de lo que hagas aquí toca una Empresa.

::Practice{id="wire"}
