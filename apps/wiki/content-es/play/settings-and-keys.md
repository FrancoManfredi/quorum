---
title: Ajustes y referencia de teclas
summary: Cada Ajuste y lo que cambia, y cada tecla del tablero.
section: play
order: 11
aliases: settings, keys, keyboard, shortcuts, hotkeys, key reference, command palette, commands, reduce motion, mute, pause on focus loss, agent access, import save, ajustes, configuración, teclas, teclado, atajos, reducir movimiento, silenciar, acceso para agentes, importar partida, paleta de comandos, comandos
gdd: /design/15-ui-ux
---

Pulsa `Esc` sin nada abierto para ver el Menú y luego elige **Ajustes**. En la pantalla de título, **Ajustes** está en la barra de tareas. Los Ajustes se dividen en cinco secciones: **Sonido**, **Jugar**, **Pantalla**, **Privacidad** y **Guardar**. El panel muestra las cinco a la vez; la pantalla de título muestra una sección cada vez, y `←` y `→` se mueven entre ellas. Cada cambio se aplica al instante.

![El panel de Ajustes](/play/settings.png)

## Ajustes

| Ajuste                                      | Efecto                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Volumen**                                 | Fija el nivel de la mezcla de efectos. En la pantalla de título, `←` y `→` lo fijan.                   |
| **Silenciar sonido** (`M`)                  | Apaga todo el sonido. El control deslizante descansa hasta que vuelves a activar el sonido.            |
| **Modo fácil**                              | Añade Pausar y el control de velocidad, y revela **Pausar en SEV1 y SEV2**.                            |
| **Pausar en SEV1 y SEV2**                   | Pausa el reloj cuando empieza un incidente grave. Desactivado por defecto.                             |
| **Pausar cuando la ventana pierde el foco** | Pausa cuando cambias de pestaña o de ventana. Activado por defecto.                                    |
| **Reducir movimiento**                      | Recorta la animación. Si está desactivado, el juego sigue el ajuste de tu sistema.                     |
| **Texto al 150%**                           | Agranda el texto de la interfaz. Las tarjetas del tablero escalan con el zoom en su lugar.             |
| **Modo oscuro**                             | Usa la interfaz oscura.                                                                                |
| **Idioma**                                  | Elige el idioma de la interfaz.                                                                        |
| **Acceso para agentes**                     | Permite que un agente local lea el juego a través del relay. Solo puede leer. Desactivado por defecto. |
| **Compartir datos de uso anónimos**         | Envía datos de uso anónimos. Desactivado detiene la captura. Activado por defecto.                     |
| **Política de privacidad**                  | Abre la política en una página nueva.                                                                  |
| **Copiar partida como texto**               | Copia esta Empresa como texto que empieza por `QSV1:`.                                                 |
| **Descargar partida como archivo**          | Guarda esta Empresa como un archivo con su nombre, como `quorum-acme-cloud.txt`.                       |
| **Importar partida desde un archivo**       | Carga una Empresa desde un archivo de partida.                                                         |
| **Pegar una partida**                       | Te pide pegar ese texto `QSV1:` y lo carga.                                                            |
| **Copiar estado como JSON**                 | Copia todo el estado del juego, para informes de errores.                                              |

Los Ajustes pertenecen al navegador, no a una Empresa. Lee [Mover una Empresa a otro navegador](/guides/move-a-company) antes de usar **Importar partida desde un archivo**, y la [página de privacidad](/about/privacy) para saber qué contienen los datos de uso.

El Menú también contiene **Reanudar**, **Comandos**, **Ajustes**, **Sala**, **Salir de la empresa** cuando puedes hacer Exit, y **Pantalla de título**. **Reanudar** y `Esc` vuelven al tablero. Lee [Juega en una Sala](/play/rooms) antes de llevar una Empresa a la red.

**Comandos** es la paleta sobre el tablero. Pulsa `Cmd+K` en macOS o `Ctrl+K` en los demás sistemas para abrirla, escribe para filtrar y pulsa `Enter` para ejecutar la fila resaltada. Lista cada acción con la tecla que la ejecuta: piezas para colocar, cambios en los Nodos, Investigación, paneles, la vista del tablero, la selección, las regiones y los Ajustes. Detiene el reloj mientras está abierta, y `Esc` la cierra.

## Teclas

Las teclas funcionan cuando estás en el tablero y no escribes en un campo. No funcionan mientras mantienes pulsada `Alt`. `Esc` cierra la capa superior de una en una en lugar de cerrar todo, así que una segunda pulsación sin nada abierto abre el Menú.

![Los botones de velocidad de la barra de herramientas](/play/speed-controls.png)

### Paneles

| Tecla              | Acción                                                          |
| ------------------ | --------------------------------------------------------------- |
| `R`                | Investigación, cuando se muestra                                |
| `T`                | Equipo, cuando se muestra                                       |
| `D`                | Cuadro de mando, tras `metrics`                                 |
| `P`                | Playbooks, tras tu primer Exit                                  |
| `I`                | Bandeja de entrada                                              |
| `$`                | La factura de la nube: Gasto, Ingresos, margen. No tiene botón. |
| `H` o `?`          | Cómo jugar                                                      |
| `Esc`              | Cierra la capa superior; sin nada abierto, abre el Menú         |
| `Cmd+K` / `Ctrl+K` | Comandos: cada acción, agrupada por área                        |

### Reloj y vista

| Tecla          | Acción                                          |
| -------------- | ----------------------------------------------- |
| `Space`        | Pausar o reanudar                               |
| `S`            | Velocidad siguiente: 0.5×, 1×, 3×, 10× y vuelta |
| `Z`            | Deshacer                                        |
| `Shift+Z`, `Y` | Rehacer                                         |
| `Shift+T`      | Ordenar por rol                                 |
| `Shift+F`      | Ajustar el tablero                              |
| `F`            | Pantalla completa                               |
| `M`            | Silenciar                                       |
| `C`            | Cobrar el cajón de Pagos                        |

### Construcción

| Tecla                        | Acción                                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `1` a `7`                    | Abre ese grupo de construcción: Edge, Cómputo, Datos, Mensajería, Plataforma, Observabilidad, Gestionado. Solo cuentan los grupos que puedes usar, en el orden mostrado. |
| `1` a `9` dentro de un grupo | Elige esa pieza de la lista abierta                                                                                                                                      |
| `Enter`                      | Con una pieza en la mano, la coloca en el siguiente hueco libre                                                                                                          |
| `Esc`                        | Suelta la pieza                                                                                                                                                          |

### Seleccionar y mover

| Tecla                          | Acción                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Teclas de flecha               | Seleccionan el Nodo más cercano en esa dirección                                              |
| `Enter`                        | Abre el Inspector del Nodo seleccionado                                                       |
| `L`                            | Empieza un Enlace desde el Nodo seleccionado                                                  |
| `L` o `Enter` sobre un destino | Termina el Enlace. `Esc` cancela.                                                             |
| `U`                            | Compra el siguiente tamaño para el Nodo seleccionado                                          |
| `Shift+Flechas`                | Desplazan la selección un poco                                                                |
| `Ctrl/Cmd+A`                   | Selecciona todo                                                                               |
| `Ctrl/Cmd+C`, `X`, `V`         | Copiar, cortar, pegar                                                                         |
| `Ctrl/Cmd+D`                   | Duplicar                                                                                      |
| `Delete`, `Backspace`          | Vende la selección o corta el Enlace seleccionado. Vender pregunta antes, y `Enter` confirma. |

Las teclas de flecha y `Enter` funcionan solo cuando el foco está en el tablero, no cuando está en un panel.
