---
title: Reloj, deshacer y partidas guardadas
summary: Pausa y acelera el reloj, deshaz y rehaz con la ventana de reembolso de 30 segundos, y cómo guarda, exporta e importa el juego una Empresa.
section: play
order: 8
aliases: pause, speed, clock, time, space, undo, redo, refund, autosave, save, companies, export, import, blur, pausa, velocidad, reloj, tiempo, deshacer, rehacer, reembolso, autoguardado, guardar, partida guardada, empresas, exportar, importar
gdd: /design/15-ui-ux
---

`Space` pausa y reanuda el reloj, `S` cambia su velocidad, `Z` deshace tu última acción y el juego guarda tu Empresa solo cada pocos segundos. Mientras el reloj está en pausa, todavía puedes colocar, mover, vender y cambiar de tamaño, así que usa una pausa para planificar.

## Pausa y velocidad

La barra de herramientas de arriba a la derecha contiene los controles del reloj.

![Los controles del reloj en la barra de herramientas: Pausar, el botón de velocidad y Deshacer y Rehacer.](/play/speed-controls.png)

Mira el botón de velocidad. Muestra la velocidad actual, como **1×**, y se ilumina por encima de 1×.

1. Pulsa `Space`, o pulsa **Pausar (Espacio)** en la barra de herramientas. El botón se convierte en **Reanudar (Espacio)** y el Tablero deja de moverse.
2. Pulsa `Space` otra vez para reanudar.
3. Pulsa `S`, o pulsa **Velocidad (S)**, para pasar a la siguiente velocidad: **0.5×**, **1×**, **3×**, **10×** y de vuelta a **0.5×**. Las ventajas pueden añadir **20×** y **40×** al ciclo.

`S` no hace nada mientras un campo de texto tiene el foco, porque las teclas se ignoran dentro de los campos. Haz clic fuera del campo primero.

A 1× un segundo de juego es un segundo del reloj, pero el calendario del HUD corre más deprisa, a un minuto de calendario por segundo. Una velocidad mayor ejecuta más Pasos en el mismo tiempo real, y la Simulación da las mismas respuestas a cualquier velocidad, así que usa una velocidad alta para esperar y una baja para observar un fallo. Una velocidad alta también es mala idea para dejarla corriendo durante un incidente, así que pulsa `S` o `Space` para ir más despacio antes de leer el pager.

### Pausa al perder el foco

Cuando cambias a otra pestaña o ventana, el juego se pausa solo y se reanuda cuando vuelves. Es el interruptor **Pausar cuando la ventana pierde el foco** de **Ajustes**, y está activado por defecto. Pausa a mano antes de salir de la ventana y el juego sigue en pausa cuando vuelvas.

Un segundo interruptor, **Pausar en SEV1 y SEV2**, pausa el reloj cuando empieza un incidente grave. Está desactivado por defecto.

## Deshacer y rehacer

Pulsa `Z` para deshacer tu última acción, y `Shift+Z` o `Y` para rehacerla. Los botones de la barra de herramientas **Deshacer (Z)** y **Rehacer (Mayús+Z)** aparecen tras tu primera acción y se atenúan cuando no hay nada que deshacer o rehacer. La píldora de cambios bajo la barra de herramientas también lleva un icono de Deshacer después de un cambio.

Lo que puedes deshacer: colocar, vender, cambiar de tamaño, Enlaces y cortes, Ordenar por rol, cambios de opciones y acciones en bloque. Un aviso dice lo que pasó, por ejemplo **Deshecho: Placed App Server.** o **Rehecho: Placed App Server.**

El historial guarda las últimas 50 acciones, y una acción nueva borra la lista de rehacer.

### La ventana de reembolso de 30 segundos

Un deshacer dentro de los 30 segundos de la acción revierte su Caja exactamente, así que deshacer una compra de $240 a los 10 segundos devuelve los $240 completos. Cuando pasa la ventana, la Caja se ajusta a los precios normales:

- Deshacer una colocación devuelve la mitad del precio, como una venta.
- Deshacer una venta cuesta de nuevo el precio completo de colocación.
- Deshacer un cambio de tamaño no mueve Caja.

Un deshacer tardío paga el precio ajustado en lugar de lo que pagaste. Los temporizadores van por el reloj, así que una partida en pausa no agota los 30 segundos.

Deshacer restaura el Diseño, no el mundo. Los créditos, las fugas de memoria y los fallos conservan lo que el tiempo les hizo. Deshacer nunca te da más Caja de la que pagaste.

Espera uno de tres mensajes cuando la acción no puede ocurrir: **No hay nada que deshacer.**, **No hay nada que rehacer.** y **No hay suficiente caja para deshacer eso.** cuando el precio ajustado es mayor que lo que tienes.

## Autoguardado

El juego guarda la Empresa abierta cada 5 segundos de tiempo de reloj, y una vez en el momento en que la fundas. Guarda el archivo en el navegador, en este dispositivo. Una Empresa con el reloj en pausa no avanza, así que no vuelve a guardarse. Los Sandboxes y los Desafíos no se guardan en una Empresa.

Como la partida vive en el navegador, borrar los datos del sitio la elimina, así que exporta una partida de la Empresa que te importe.

## Empresas

El navegador guarda cualquier número de Empresas. Abre la pantalla de título con **Menú (Esc)**, luego **Pantalla de título**, y elige **Empresas**. La lista muestra cada Empresa con su Emprendimiento, su Era, sus usuarios y su tiempo de juego, la más reciente primero, y marca la actual como **Actual**.

1. Selecciona una Empresa.
2. Pulsa **Continuar** para la actual, o **Abrir empresa** para otra.
3. Para eliminarla, pulsa **Eliminar empresa** y luego **Eliminar para siempre**. **Conservar empresa** cancela. Eliminar también borra su Diseño, y no se puede deshacer.

## Exportar e importar

1. En el Tablero, pulsa `Esc` y elige **Ajustes**.
2. Pulsa **Descargar partida como archivo**. El navegador guarda un archivo de texto con el nombre de la Empresa, y el juego sigue abierto.
3. Para cargarlo, abre **Ajustes**, pulsa **Importar partida desde un archivo** y elige el archivo.

En un navegador sin ninguna Empresa, elige en su lugar **Importar una empresa** en la pantalla de título. El juego añade el archivo como una Empresa nueva y abre su Tablero.

**Copiar partida como texto** pone la misma línea en el portapapeles, y **Pegar una partida** recoge una línea del portapapeles. El par de texto sirve para un mensaje de chat. El par de archivo sirve para pasar de un navegador o dispositivo a otro, porque el archivo sobrevive al navegador que lo escribió.

Una importación correcta termina con **Partida guardada importada.** y reemplaza la Empresa abierta por el archivo. El estado anterior desaparece, así que exporta una Empresa antes de importar encima de ella. Los fallos explican por qué:

- **Eso no es una partida guardada.** El archivo o el texto no es una partida de Quorum.
- **Esa partida guardada es de otra versión (x; esta versión lee y).** El formato de la partida es distinto.
- **No se pudo leer esa partida guardada.** El archivo está dañado.

Un Sandbox o un Desafío responde **Un Sandbox o un desafío no tiene partida guardada.** a ambos botones. **Copiar estado como JSON**, en la misma lista, copia el estado en bruto del juego, para informes de errores.
