---
title: Mover, seleccionar, copiar y vender
summary: Arrastra Nodos, selecciona uno o varios, copia, duplica, desplaza, ordena, ajusta la vista y vende lo que ya no necesites.
section: play
order: 5
aliases: drag, snap, select, multi-select, box select, copy, paste, duplicate, nudge, tidy, fit, sell, delete, selection bar, arrastrar, seleccionar, selección múltiple, copiar, pegar, duplicar, desplazar, ordenar, ajustar, vender, eliminar, barra de selección
gdd: /design/15-ui-ux
---

Arrastra una tarjeta para moverla, haz clic en ella para seleccionarla y mantén `Shift` para seleccionar varias. Mover y seleccionar no cuestan nada, y una venta devuelve Caja. Enmarcar es la única acción de aquí que cambia lo que hace el Diseño: crea un Grupo de datos, y dos o más Bases de datos únicas enmarcadas juntas pasan a ser Sharded.

## Arrastra un Nodo

1. Pulsa sobre el cuerpo de una tarjeta y arrastra. La tarjeta sigue al puntero tras unos pocos píxeles de movimiento.
2. Suelta. La tarjeta cae sobre una cuadrícula de 8 píxeles. Si el lugar se solapa con otra tarjeta, se desliza al hueco libre más cercano.

Los Enlaces siguen a la tarjeta. Pulsar sobre el puerto de salida azul del borde derecho de una tarjeta empieza un Enlace en lugar de un movimiento, que es la sorpresa habitual, así que agarra la tarjeta por su título o por sus filas cuando quieras moverla. [Conecta Nodos con Enlaces](/play/wire-nodes) explica el puerto.

Un arrastre normal desde un espacio vacío desplaza la vista, y `Shift` + arrastrar desde un espacio vacío dibuja un cuadro de selección en su lugar. Gira la rueda para hacer zoom.

## Selecciona Nodos

| Haz esto                                   | Obtienes                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Clic en una tarjeta                        | Un Nodo seleccionado. El Inspector se abre a la derecha.                                         |
| `Shift` + clic en una tarjeta              | La tarjeta entra en la selección o sale de ella.                                                 |
| `Shift` + arrastrar sobre un espacio vacío | Un cuadro. Cada tarjeta que toca pasa a ser la selección.                                        |
| `Shift` + `Ctrl` (o `Cmd`) + arrastrar     | El cuadro se añade a la selección.                                                               |
| `Shift` + `Alt` + arrastrar                | El cuadro se quita de la selección.                                                              |
| `Ctrl` (o `Cmd`) + `A`                     | Cada Nodo del Tablero de esta región, salvo los fijos (Usuarios, Pagos) y los Nodos compartidos. |
| Clic en un espacio vacío, o `Esc`          | La selección se borra.                                                                           |

Un marco señala el grupo seleccionado. Arrastra cualquier tarjeta seleccionada, o cualquier punto dentro del marco, y todo el grupo se mueve junto. Un clic normal en una tarjeta reemplaza el grupo por ese único Nodo, y un clic en un espacio vacío borra la selección en lugar de conservarla.

## La barra de selección

La barra sustituye al dock de construcción en la parte inferior de la pantalla mientras existe una selección con `Shift`, en una Empresa y en un Sandbox. Dice **N seleccionados** y luego seis botones con icono.

![La barra de selección en la parte inferior del tablero con tres Nodos seleccionados.](/play/selection-bar.png)

Mira la fila de iconos: cada botón muestra su nombre y su tecla cuando pasas el cursor por encima.

| Botón                     | Tecla    | Qué hace                                                                                                                                                                        |
| ------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Copiar**                | `Ctrl+C` | Pone los Nodos y los Enlaces que hay entre ellos en el portapapeles. Aviso: **Se copiaron 3 nodos.**                                                                            |
| **Duplicar**              | `Ctrl+D` | Coloca una copia de la selección 48 píxeles hacia abajo y a la derecha, en el hueco libre más cercano. Cada copia se paga como un Nodo nuevo.                                   |
| **Enmarcar los nodos**    | ninguna  | Dibuja un marco discontinuo alrededor de la selección, lo que convierte esas Bases de datos en un Grupo de datos. Púlsalo de nuevo sobre los mismos Nodos para quitar el marco. |
| **Vender**                | `Delete` | Pregunta primero y luego vende. Mira más abajo.                                                                                                                                 |
| **Guardar como Playbook** | ninguna  | Guarda la selección como un Playbook que sobrevive a los Exits. Aviso: **Guardado Playbook 1: 3 nodos.**                                                                        |
| **Quitar la selección**   | `Esc`    | Vacía la selección.                                                                                                                                                             |

`Ctrl+C`, `Ctrl+X` y `Ctrl+D` también funcionan sobre el único Nodo que abrió un clic normal, sin barra. La barra en sí necesita una selección con `Shift`, porque un clic normal abre el Inspector, así que para copiar un solo Nodo pulsa `Ctrl+C` justo después del clic.

## Copiar y pegar

1. Selecciona los Nodos. Pulsa `Ctrl+C`. El aviso dice **Se copiaron 2 nodos.**
2. Pulsa `Ctrl+V`. Una barra dice **`Haz clic para colocar <nombre> · Esc`**, y la copia sigue al puntero.
3. Haz clic en el Tablero donde deba ir la copia. Cae en el hueco libre más cercano, y el coste de cada Componente sale de la Caja.

`Ctrl+X` copia y vende en un solo paso. Pulsa `Esc` para soltar la copia sin colocarla.

Si no hay nada seleccionado, `Ctrl+C` dice **Selecciona primero los nodos que quieres copiar.** y `Ctrl+V` dice **Copia algunos nodos primero.** cuando el portapapeles está vacío.

## Desplaza con el teclado

Mantén `Shift` y pulsa una flecha. El Nodo seleccionado, o toda la selección, se mueve 16 píxeles. Si el movimiento pusiera una tarjeta encima de otra, no pasa nada.

Las flechas sin `Shift` hacen otra cosa: seleccionan el Nodo más cercano en esa dirección. Úsalas para recorrer el Diseño sin ratón.

## Ordenar y ajustar

- **Ordenar por rol** (`Shift+T`) coloca cada Nodo del Tablero de la región en columnas por rol y luego ajusta la vista. Mueve solo tarjetas, y `Z` lo deshace. Un arrastre o un desplazamiento normales no son un paso de deshacer. [Cómo ordena Tidy el tablero](/explanation/tidy) da las reglas.
- **Ajustar el tablero** (`Shift+F`) hace zoom y desplaza la vista para que todos los Nodos queden en pantalla. No mueve ninguna tarjeta.

Ambos botones están en la barra de herramientas de arriba a la derecha. En un teléfono están en el menú **Más**.

## Vender

Vender devuelve la mitad de lo que costó colocar la última copia de ese Componente.

1. Selecciona el Nodo y pulsa `Delete` (o `Backspace`), o pulsa **Vender** en la barra de selección o en el Inspector.
2. Una barra dice **¿Vender 2 nodos por $120?** con **Vender** y **Cancelar**. El Nodo todavía no se ha ido.
3. Pulsa `Enter` o **Vender** para confirmar. `Esc` o **Cancelar** lo conserva todo.

Los Enlaces de un Nodo vendido se van con él. `Z` recupera el Nodo, y dentro de los 30 segundos el deshacer devuelve la Caja exacta. La barra de confirmación pregunta primero porque una venta es fácil de lanzar sin querer, y ese deshacer es la segunda oportunidad.

Los Nodos fijos no se pueden vender. Selecciona Usuarios y pulsa `Delete`, y un aviso dice **Users stays.** Lo mismo ocurre con Pagos. En una selección mixta, los Nodos fijos se quedan y el resto se vende.

## Pruébalo

Objetivo: alinea las tarjetas en una fila, de izquierda a derecha, de modo que no se toquen dos. Luego selecciona dos de ellas con `Shift` y un clic, y selecciona el resto manteniendo `Shift` y arrastrando un cuadro desde un espacio vacío. Un arrastre sin `Shift` solo desplaza la vista.

::Practice{id="rearrange"}
