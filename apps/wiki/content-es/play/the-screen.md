---
title: La pantalla de un vistazo
summary: Nombra cada región de la pantalla del Tablero: el HUD, la barra de herramientas, el dock de construcción, el Tablero, el Inspector y el botón de la Bandeja de entrada, y qué significa cada cifra del HUD.
section: play
order: 2
aliases: screen, board screen, hud, toolbar, dock, ui, interface, layout, cash, users, apdex, latency, errors, inbox button, pantalla, pantalla del tablero, barra de herramientas, interfaz, caja, usuarios, latencia, errores, botón de la bandeja de entrada
gdd: /design/15-ui-ux
---

La pantalla del Tablero tiene cinco regiones: el HUD arriba a la izquierda, la barra de herramientas arriba a la derecha, el dock de construcción abajo, el Inspector a la derecha y el propio Tablero detrás de todas ellas. Un botón redondo de la Bandeja de entrada está abajo a la derecha. Todo lo demás es un panel que se abre encima.

![La pantalla del Tablero con cada región señalada: HUD, barra de herramientas, Tablero, dock de construcción, Inspector y botón de la Bandeja de entrada.](/play/screen.png)

_Localiza primero el HUD, arriba a la izquierda. Luego sigue los números: el HUD te dice cómo va la Empresa y el Tablero te muestra por qué._

Al principio el juego muestra pocos controles y añade el resto a medida que los necesitas. Un control que falta en tu pantalla todavía no se ha ganado. No lo oculta ningún ajuste.

## El HUD

El HUD es la tarjeta de arriba a la izquierda. Muestra las cifras que importan ahora mismo, una por fila.

![El HUD al inicio de una Empresa: Caja, Usuarios, Apdex y Latencia.](/play/hud.png)

_Mira las cuatro filas bajo el nombre de la Era. Cada una tiene un nombre, un valor y una pequeña nota al lado._

**La fila de cabecera** contiene tres cosas:

- El botón **Menú**, etiquetado **Menú (Esc)**. Abre el menú del juego.
- El nombre de la Era, como Garaje.
- El calendario, como `D1 14:01`. Un segundo de tiempo real es un minuto en el calendario.

Una barra bajo la cabecera se llena a medida que tus usuarios se acercan a la siguiente [ronda de financiación](/explanation/progression). Cuando está llena, en su lugar aparece un botón que dice **Oferta** seguido del nombre de la siguiente Era. En el último paso antes de salir a bolsa dice **IPO**.

**Las filas** se leen así:

| Fila         | Valor                                          | Al lado                                               | Clic                                            |
| ------------ | ---------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| **Caja**     | El dinero que puedes gastar                    | Variación neta por segundo y luego autonomía en meses | Abre el Cuadro de mando, solo cuando falta Caja |
| **Usuarios** | Las personas que usan la Empresa               | ▲ o ▼ con el cambio reciente                          | Abre **Por qué se van los usuarios**            |
| **Apdex**    | Satisfacción, de 0 a 1, durante la última hora | `/` y el objetivo de la Era                           | Nada                                            |
| **Errores**  | La proporción de peticiones que fallan         | Nada                                                  | Nada                                            |
| **Latencia** | El tiempo medio en responder a una petición    | Nada                                                  | Nada                                            |

Léelas como una cadena. Un **Apdex** igual o superior a su objetivo hace que los **Usuarios** crezcan. Más **Usuarios** envían más peticiones, lo que sube la carga de tus Nodos. Cuando un Nodo se queda sin **Capacidad**, el **Apdex** cae y los **Usuarios** se van. Una ▼ junto a **Usuarios** con un **Apdex** en rojo significa que un cuello de botella te está haciendo daño ahora.

Algunos detalles de cada fila:

- **Caja** se pone roja por debajo de cero. La nota tras la cifra de autonomía es `mo` para un mes de 30 días. Con la Caja a cero todavía puedes vender e investigar, pero no puedes colocar ni mejorar nada, así que un valor rojo en **Caja** significa que se rechazará la colocación.
- **Usuarios** muestra el cambio sobre la tendencia reciente, no el total ganado.
- **Apdex** se pone rojo por debajo de su objetivo. Pasa el cursor por la fila para leer cómo funciona el objetivo.
- **Errores** aparece la primera vez que falla una petición, así que abre el Nodo que lo causó cuando se muestre la fila. Pasa el cursor para ver las causas, pero solo después de investigar Logs estructurados. Antes de eso, el texto dice **Investiga Registros estructurados para ver las causas**.
- **Latencia** pasa a ser **p99** cuando investigas los percentiles. La media se muestra entonces a su lado con una `μ`. Consulta [Lee el p99](/guides/read-p99).

Más adelante aparecen filas cuando corresponden: una fila de **SLO**, una fila de **SLA**, una tarjeta de Conocimiento con tu Estudio en curso y una tarjeta de Equipo. Se explican en [Paneles de Investigación y Equipo](/play/research-and-team).

## La barra de herramientas

La barra de herramientas es la franja de arriba a la derecha. Pasa el cursor por un botón para leer su nombre y su tecla.

| Botón                      | Tecla          | Qué hace                                                                                 |
| -------------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| **Investigación**          | `R`            | Abre el árbol de Investigación. Una insignia cuenta los Estudios que puedes iniciar.     |
| **Equipo**                 | `T`            | Abre el panel de Equipo. Un punto ámbar significa que el backlog está vacío.             |
| **Playbooks**              | `P`            | Abre las partes del Diseño guardadas. Aparece tras tu primer Exit.                       |
| **Exit**                   | Ninguna        | Abre el panel de Exit, desde la Serie A. Muestra el Legado que ganarías.                 |
| **Cuadro de mando**        | `D`            | Abre los Gráficos. Necesita la Investigación `metrics`.                                  |
| **Cómo jugar**             | `H`            | Abre las seis acciones básicas y la tabla de teclas.                                     |
| **Glosario**               | Ninguna        | Abre los términos de ingeniería en la wiki. Aparece tras tu primera tarjeta de Tradeoff. |
| **Deshacer** y **Rehacer** | `Z`, `Shift+Z` | Aparecen tras tu primera acción en el Tablero.                                           |
| **Pausar** o **Reanudar**  | `Space`        | Detiene y reanuda el reloj.                                                              |
| **Velocidad**              | `S`            | Muestra la velocidad, como `1×`. Cada pulsación pasa a la siguiente.                     |
| **Ordenar por rol**        | `Shift+T`      | Coloca los Nodos en columnas por rol.                                                    |
| **Ajustar el tablero**     | `Shift+F`      | Hace zoom y desplaza la vista para que todos los Nodos queden a la vista.                |
| **Pantalla completa**      | `F`            | Activa y desactiva la pantalla completa.                                                 |

Al principio ves **Cómo jugar**, **Pausar**, **Velocidad** y los tres botones del tablero. El resto aparecen a medida que se vuelven útiles, así que un botón **Investigación**, **Equipo** o **Deshacer** que falta todavía no se ha ganado. En un teléfono, un botón **Más** contiene las mismas acciones. [Reloj, deshacer y partidas guardadas](/play/clock-undo-saves) explica las velocidades. [Ajustes y referencia de teclas](/play/settings-and-keys) enumera todas las teclas.

## El dock de construcción

El dock de construcción es la fila de iconos de grupo de la parte inferior. Es la forma de colocar un Componente.

![El dock de construcción al inicio de una Empresa: cuatro iconos de grupo, con la lista de Edge abierta.](/play/dock.png)

_Mira los iconos de la fila inferior. Cada uno es un grupo de Componentes. La lista que hay encima es lo que contiene el grupo abierto._

Hay siete grupos posibles: **Edge**, **Cómputo**, **Datos**, **Mensajería**, **Plataforma**, **Observabilidad** y **Gestionado**. Un grupo se muestra solo cuando contiene algo que puedes colocar o que se desbloqueará a continuación. Una Empresa nueva muestra cuatro. Pasa el cursor por un icono para leer su nombre y su número, como **Edge (1)**.

[Coloca Componentes](/play/place-components) recorre el dock paso a paso. Mientras sostienes una pieza, el dock muestra su nombre, **Haz clic en el tablero** y un botón con una X. El mismo hueco de la barra muestra la barra de selección cuando seleccionas Nodos y una barra de venta cuando pides vender. Eso se explica en [Mover, seleccionar, copiar y vender](/play/move-and-select).

## El Tablero

El Tablero es la superficie que hay detrás de todo. Tus Nodos son tarjetas sobre él, y los Enlaces los unen.

- Arrastra un espacio vacío para desplazar la vista.
- Usa la rueda del ratón para hacer zoom, desde un cuarto del tamaño hasta una vez y media. Pellizca en una pantalla táctil.
- Haz clic en un espacio vacío para deseleccionar.

Muy lejos, una tarjeta pierde sus filas y luego se reduce a una pequeña ficha. Usa **Ajustar el tablero** para ver todo el Diseño y acércate cuando necesites leer una tarjeta. [Lee la tarjeta de un Nodo](/play/read-a-node-card) explica cada fila de una.

## El Inspector

El Inspector es el panel de la derecha. Se abre cuando seleccionas un Nodo y se cierra con el botón X o con `Esc`. Muestra cifras en vivo, advertencias en un recuadro rojo o ámbar y las opciones de ese Nodo. [El Inspector](/play/the-inspector) explica sus secciones.

## El botón de la Bandeja de entrada

El botón redondo de abajo a la derecha es la **Bandeja de entrada** (`I`). Una insignia con un número cuenta el Correo sin leer. La insignia se pone roja, y el botón pulsa, cuando un mensaje espera una acción tuya. [Correo, Cuadro de mando, Glosario](/play/mail-dashboard-glossary) explica las carpetas.

## La franja superior y los avisos

A lo largo de la parte superior del Tablero, el juego pone lo que necesita una mirada rápida: las pestañas de región cuando trabajas en más de una región, el pager y el banner de incidente cuando algo se rompe, y la píldora de cambios. La píldora de cambios nombra tu último cambio, como **Resized App Server**, y muestra su efecto en el coste, la latencia y los errores, con un botón de Deshacer.

Un mensaje corto, llamado aviso (toast), aparece cuando el juego rechaza una acción o confirma una. Los rechazos usan texto sencillo, y cada página de esta sección cita los que puede causar.
