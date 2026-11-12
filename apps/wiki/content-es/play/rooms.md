---
title: Juega en una Sala
summary: Lleva una Empresa a la red, invita a otras personas con un código y decide qué puede hacer una Plaza.
section: play
order: 12
aliases: room, online, multiplayer, co-op, coop, teammate, seat, invite, share a company, sala, en línea, multijugador, cooperativo, compañero, plaza, invitar, compartir una empresa
gdd: /design/17-scope-and-roadmap
---

Una Sala permite que más de una persona construya la misma Empresa. Un jugador es el propietario de la Empresa y los demás entran con un código de seis caracteres y ocupan una Plaza. La Sala conserva la Empresa durante 24 horas después de que salga la última Plaza.

## Lleva una Empresa a la red

1. Abre una Empresa.
2. Pulsa `Esc` para abrir el Menú y selecciona **Sala**.
3. Selecciona **Jugar en línea**. Quorum sube la Empresa y muestra un **Código de la sala**.
4. Selecciona **Copiar enlace** y envíaselo a las personas con las que quieras jugar.
5. Abren el enlace, eligen un nombre y entran.

Cualquiera con el enlace puede entrar. No necesita una cuenta.

## Qué puede hacer una Plaza

Una Plaza construye en el Tablero, abre paneles y responde a los incidentes. El propietario fija la velocidad y puede quitar una Plaza con **Expulsar**. Cada Plaza ve los cursores de las demás en el Tablero, así que puedes ver cómo alguien conecta un Enlace.

El propietario puede seleccionar **Poner sin conexión** en cualquier momento. La Empresa vuelve al navegador del propietario y la Sala se cierra.

## Votaciones

Una ronda de financiación y el final de una sesión son votaciones. Una votación sale adelante cuando los síes son más de la mitad de las Plazas conectadas. Un empate no la aprueba, y una Plaza que se va retira su voto. El propietario abre una votación para una ronda o para terminar la sesión. Cualquiera puede responder a un incidente.

## Lo que una Sala no hace

- Una Empresa no puede hacer Exit en línea. La sesión termina, el propietario pone la Empresa sin conexión y el Exit sigue siendo un acto de un solo jugador.
- Los invitados no consiguen logros ni conservan ninguna Empresa. Solo el navegador del propietario guarda el archivo.
- Deshacer sigue siendo de un solo jugador, porque todas las Plazas comparten un único orden de movimientos.
- Un despliegue termina una Sala que usa una compilación anterior. El propietario conserva la Empresa tal como estaba cuando se puso en línea, pero el progreso hecho en la Sala desde entonces puede perderse.
- La Sala conserva la Empresa durante 24 horas después de que salga la última Plaza y luego informa de que ha caducado.

El [registro de diseño](/design/17-scope-and-roadmap#rooms) explica cómo la Sala es propietaria de la Simulación.
