---
title: Coloca Componentes
summary: Elige un Componente del dock de construcción, ponlo en el Tablero con un clic o con la tecla Enter y lee lo que dice el juego cuando lo rechaza.
section: play
order: 3
aliases: place, build, build dock, add a node, buy a component, dock, placing, place a node, colocar, construir, dock de construcción, añadir un nodo, comprar un componente, colocar un nodo
---

Para colocar un Componente, abre un grupo en el dock de construcción, elige el Componente y haz clic en el Tablero. El Nodo aparece bajo tu puntero y la Empresa paga su precio.

![El dock de construcción con el grupo Edge abierto.](/play/dock.png)

_Mira la lista abierta sobre los iconos de grupo. Cada fila muestra un nombre, una línea sobre él, un precio y una tecla numérica._

## Coloca un Nodo

1. Busca los iconos de grupo en el dock de construcción, en la parte inferior de la pantalla. Pasa el cursor por uno para leer su nombre y su número, como **Datos (3)**.
2. Haz clic en un grupo, o pulsa su tecla numérica. Encima del dock se abre una lista de Componentes.
3. Lee las filas. Cada una muestra el nombre del Componente, una línea corta sobre él y su precio. Un precio en rojo significa que ahora no puedes pagarlo. Una fila con un candado nombra la Investigación que la abre.
4. Haz clic en una fila, o pulsa su tecla numérica. La lista se cierra. El dock muestra ahora el nombre del Componente, **Haz clic en el tablero** y un botón con una X.
5. Haz clic en un lugar vacío del Tablero. La tarjeta aparece centrada en tu puntero, y la fila de Caja del HUD baja en el precio.
6. Mira el lado derecho de la pantalla. El Inspector se abre sobre el Nodo nuevo, porque colocar también selecciona.

Pulsa `Enter` en lugar de hacer clic en el paso 5 para dejar la pieza en el siguiente hueco libre. Esa es la forma de colocar con el teclado.

Una colocación equivocada es más barata de arreglar en el momento: pulsa `Z` dentro de los 30 segundos y el reembolso es exacto, como explica [Reloj, deshacer y partidas guardadas](/play/clock-undo-saves).

Un Nodo colocado todavía no está conectado a nada, así que cuesta Caja y no transporta tráfico hasta que añades un Enlace. [Conecta Nodos con Enlaces](/play/wire-nodes) explica el arrastre.

::Component{id="database"}

_Una Base de datos tal como se ve en el Tablero justo después de colocarla. Todavía no hay nada conectado a ella._

## Una pieza por elección

La pieza que tienes en la mano se gasta con una colocación, así que para colocar una segunda Base de datos la eliges otra vez en el dock. Es a propósito: un clic perdido en el Tablero nunca compra algo, y un segundo clic no coloca un segundo Nodo.

Para devolver una pieza sin colocarla, pulsa `Esc` o haz clic en el botón X del dock.

## Si el lugar está ocupado

Puedes hacer clic en cualquier sitio libre. Si el lugar se solapa con una tarjeta, el Nodo se desliza al hueco libre más cercano. Puedes arrastrarlo después: [Mover, seleccionar, copiar y vender](/play/move-and-select).

## Qué rechaza el juego

Un rechazo aparece como un aviso, y la pieza se queda en tu mano. Haz clic en un sitio libre o pulsa `Esc`.

| Mensaje                                                                            | Causa                                                                                  |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `<Componente> cuesta $<precio>.`                                                   | Tu Caja está por debajo del precio. Espera, cobra o elige una pieza más barata.        |
| `Sin caja: no puedes colocar, mejorar ni contratar hasta que la caja supere cero.` | La Caja es cero o menos. Vende un Nodo o cobra ingresos primero.                       |
| `<Componente> necesita la Investigación de <Investigación>.`                       | El Componente está bloqueado. Abre **Investigación** y estudia el elemento que nombra. |
| `Abre esa región primero.`                                                         | Intentaste colocar en una región que no has abierto.                                   |
| `<Mutador>: no <Componente>.`                                                      | Un Mutador de tu Empresa prohíbe ese Componente.                                       |

Las filas bloqueadas del dock no son callejones sin salida. Haz clic en una y una cinta sobre el dock nombra la Investigación y su precio en Conocimiento, con un botón **Investigación** que la abre. La cinta espera hasta que la aceptes o la descartes. Una fila en rojo es la misma advertencia un paso antes: el aviso repetirá el precio, así que léelo antes de hacer clic en el Tablero.

## Pruébalo

Coloca un Servidor de aplicaciones y una Base de datos en el tablero de práctica de abajo. Elige cada uno en el dock del tablero y luego haz clic en el tablero para soltarlo. Nada de lo que hagas aquí toca una Empresa.

::Practice{id="place"}
