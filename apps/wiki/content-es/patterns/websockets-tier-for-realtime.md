---
title: Una capa de WebSockets para tiempo real
summary: Mantén abiertas las conexiones en tiempo real en un Hub en tiempo real que ejecuta un runtime hecho para ello, y enruta a él solo el tráfico en tiempo real, para que el chat y las actualizaciones en vivo dejen de devorar workers del Servidor de aplicaciones.
section: patterns
group: Scaling steps
order: 125
aliases: websocket, realtime, chat, live updates, socket.io, presence, reconnect, long lived connections, connection count, tiempo real, actualizaciones en vivo, presencia, reconexión, conexiones de larga duración, número de conexiones
---

Da al tráfico en tiempo real su propio Hub, porque una conexión que permanece abierta minutos no puede compartir un conjunto de workers con peticiones que duran milisegundos.

## Cuándo dar el paso

- Los mensajes en tiempo real fallan como rechazados, o los workers del Servidor de aplicaciones se quedan esperando en conexiones abiertas.
- El chat o las actualizaciones en vivo llegan tarde mientras las páginas y las lecturas van bien.
- Tras un reinicio, los clientes se reconectan todos a la vez y el Hub rechaza a la mitad.

## El Diseño

::Design{id="realtime-hub"}

El API Gateway divide el tráfico por tipo de petición. El tiempo real va al Hub y todos los demás tipos van al Servidor de aplicaciones. El Hub recibe el tiempo real y no envía nada más allá.

## Por qué funciona

Un runtime que retiene un worker por cada conexión no retiene ninguno, así que el Hub lo rechaza todo. Un bucle de eventos o un hilo verde mantiene cada conexión con unos pocos KB, así que un Stack de Node.js permite que el Hub mantenga muchas abiertas. El clustering permite que los tamaños mayores de Hub añadan espacio, y sin él una máquina asume todas las conexiones y un tamaño mayor solo añade Gasto.

La presencia rinde más por mensaje porque las funciones sociales pagan por saber quién está conectado, y gasta CPU en cada entrada. El backoff de reconexión reparte una oleada de regresos en el tiempo en lugar de rechazarla.

## Qué cuesta

Un Hub es un Nodo con estado. Un reinicio descarta todas las conexiones e invita a una oleada de reconexiones, que es la [Tormenta de reconexiones](/incidents/reconnect). El clustering necesita una columna vertebral de pub/sub, y un clúster dividido pierde los mensajes que cruzan el corte. El juego no tiene una opción de long polling ni de server-sent events, así que no puede mostrar una alternativa más barata para un uso ligero.

## En Quorum

Coloca un [Hub en tiempo real](/components/ws) y enlázalo desde un [API Gateway](/components/gw). Fija los tipos del Enlace para que solo llegue a él el tiempo real. Investiga [WebSockets](/research/websockets), y un runtime como [Node.js](/research/lang-node). El siguiente paso, [haz sharding de la base de datos](/patterns/shard-the-database), divide la capa de datos cuando una primaria ya no puede asumir las escrituras.
