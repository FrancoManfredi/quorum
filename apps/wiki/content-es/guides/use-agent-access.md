---
title: Usar el acceso para agentes
summary: Deja que un agente de código lea tu Empresa a través del servidor MCP de Quorum, y pídele consejo. El agente lee; tú juegas.
section: guides
order: 11
aliases: mcp, agent, claude code, codex, agent room, room id, ai, assistant, copy state as json, agente, sala de agentes, acceso para agentes, asistente, copiar estado como json
---

Usa esta guía cuando quieras que un agente de código, como Claude Code o Codex, lea tu Empresa y te
diga qué arreglar.

Quorum ofrece un endpoint [MCP](https://modelcontextprotocol.io) de solo lectura en
`https://playquorum.dev/mcp`. Tu navegador sube una instantánea de la Empresa abierta cada pocos
segundos mientras **Acceso para agentes** está activado, y el endpoint responde con la última subida.
El agente puede leer el Tablero, los incidentes y la Bandeja de entrada, pero no puede colocar un Nodo,
hacer clic en un botón ni cambiar un ajuste.

## Antes de empezar

- Un agente que admita servidores MCP remotos por Streamable HTTP.
- Una Empresa abierta en [playquorum.dev](https://playquorum.dev).

## Añade el endpoint a tu agente

1. Añade el servidor. En Claude Code, ejecuta:

   ```sh
   claude mcp add --transport http quorum https://playquorum.dev/mcp
   ```

   En Codex, añade esto a `~/.codex/config.toml`:

   ```toml
   [mcp_servers.quorum]
   url = "https://playquorum.dev/mcp"
   ```

2. Inicia el agente. No hay paso de instalación, ni puerto local, ni clave.

## Activa el Acceso para agentes

1. Abre el menú del juego con **Esc** y selecciona **Ajustes**.
2. Activa **Acceso para agentes**. Está desactivado por defecto, y el juego recuerda tu elección.
3. Copia el id de la **Sala de agentes** que hay bajo el interruptor.

El id es un nombre para la instantánea, no una contraseña. La clave de escritura se queda en tu
navegador, así que otra persona con el id puede leer la Empresa pero no puede reemplazar lo que ve el
agente. Desactivar el Acceso para agentes borra la instantánea.

## Pregunta al agente

1. Incluye el id en tu pregunta, por ejemplo: "Lee la sala de agentes `abcDEFghiJKLmnoPQRstuv` y dime
   qué arreglar primero."
2. Comprueba que el agente llama a `get_status` y luego a `get_company`. El estado dice qué antigüedad
   tiene la instantánea. Si la respuesta nombra tu Caja, tus usuarios y tu Era, la conexión funciona.

:::Note{tone="tip"}
Pide al agente que explique, no solo que prescriba. "¿Por qué la Base de datos es el cuello de
botella?" te enseña más que "¿Dónde hago clic?"
:::

El agente tiene ocho herramientas, y todas solo leen:

| Herramienta     | Qué devuelve                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `get_status`    | Cuándo se sincronizó por última vez la instantánea, el modo y cuánto contiene. Llámala primero.                                 |
| `get_company`   | Caja, usuarios, Apdex, la Era, percentiles de latencia, ingresos, Gasto, el cuello de botella y tu Investigación. Empieza aquí. |
| `get_design`    | Cada Nodo con sus Enlaces de entrada y de salida y sus tasas, la carga en vivo, los descartes y la salud de cada tipo.          |
| `get_incidents` | El incidente en curso, las reglas de alerta y las alarmas, y los postmortems recientes.                                         |
| `get_inbox`     | Tu correo, con las opciones que ofrece cada mensaje. El agente puede leer las opciones, no tomarlas.                            |
| `get_history`   | Muestras recientes de usuarios, ingresos, Gasto, latencia, p99, Apdex y errores, para ver tendencias.                           |
| `explain_node`  | Por qué un Nodo está ocupado: su Cambio de carga, el tráfico que tiene detrás y la investigación que lo revela.                 |
| `get_game`      | Toda la partida guardada como JSON. Es grande, así que el agente debería preferir las demás.                                    |

El servidor también ofrece la wiki como recursos. `quorum://wiki/index` los lista: cómo fluyen las
peticiones, latencia, errores y reintentos, incidentes, dinero y una página por cada Componente. Un
agente que lee una página puede explicar tu Diseño con las reglas del propio juego en lugar de
adivinar. El documento de diseño, los patrones y las páginas de referencia se quedan en el sitio web.

Cada herramienta recibe el id de la sala como argumento `room`. El agente lee la última subida, así que
pausa el juego (**Espacio**) si quieres que su respuesta coincida con lo que ves. Cuando cierras la
pestaña, la última instantánea se conserva 24 horas.

## Aplica el consejo tú mismo

1. Lee lo que sugiere el agente.
2. Comprueba la afirmación en el tablero antes de actuar. Por ejemplo, selecciona el Nodo que nombra y
   lee su fila **Carga**, que [Encontrar el cuello de botella](/guides/find-the-bottleneck) cubre por
   completo.
3. Haz el cambio tú mismo, y luego pide al agente que vuelva a leer la Empresa.

## Cuando no responde

| Mensaje del agente                                 | Arreglo                                                                                                         |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| "Pass the agent room id shown in Quorum Settings…" | Copia el id bajo **Acceso para agentes** e inclúyelo en la pregunta.                                            |
| "This Room has no snapshot yet…"                   | Abre la Empresa y activa **Acceso para agentes**.                                                               |
| "A Challenge is open."                             | Los Desafíos puntúan, así que ningún agente puede leerlos. Sal primero del Desafío.                             |
| Las cifras son más viejas que el juego             | La pestaña está cerrada o dormida. Tráela al frente; la última instantánea se queda hasta que llegue una nueva. |
| "No Room is open…"                                 | Abre una Empresa.                                                                                               |

## Cuando el agente no puede conectarse

Abre **Ajustes** y selecciona **Copiar estado como JSON**. Pega el resultado en tu agente. El JSON
contiene las mismas vistas que devuelven las herramientas, y tampoco responde nada mientras hay un
Desafío abierto. Cópialo de nuevo cada vez que cambie el juego.
