---
title: Servidores de aplicaciones sin estado
summary: No guardes en el Servidor de aplicaciones nada que necesitaría una segunda copia, para que cualquier copia pueda responder cualquier petición y una caída no cueste nada.
section: patterns
group: Scaling steps
order: 103
aliases: stateless, twelve factor, shared nothing, sessions, uploads, local disk, externalize state, sin estado, doce factores, sesiones, subidas, disco local, externalizar el estado
---

Un Servidor de aplicaciones sin estado guarda las filas en la Base de datos y los archivos en el Almacenamiento de objetos, de modo que un segundo servidor podría tomar el relevo sin perder nada.

## Cuándo dar el paso

- Quieres un segundo Servidor de aplicaciones pero no sabes decir qué se rompería si una petición llegara al equivocado.
- Los archivos subidos o las sesiones viven en el disco del propio servidor, así que reemplazar el host los pierde.
- Las subidas llenan las filas de la Base de datos y ralentizan todas las consultas que tiene al lado.

## El Diseño

::Design{id="files-in-database"}

::Design{id="files-in-storage"}

En la primera imagen el Servidor de aplicaciones no guarda datos, pero los archivos subidos se almacenan como filas de la Base de datos. En la segunda el Servidor de aplicaciones envía los archivos al Almacenamiento de objetos y la Base de datos guarda solo filas.

## Por qué funciona

El juego no tiene un interruptor de sin estado, porque la ausencia de estado es una regla para tu código. Sí modela los lugares donde se esconde el estado: el ajuste de Base de datos local (el paso anterior), adónde van los archivos (este) y el interruptor de sesiones persistentes del Balanceador de carga (los pasos siguientes). Deja ese interruptor apagado y cada petición puede ir a cualquier servidor.

Sacar los archivos también aligera la Base de datos. Su barra de carga y su p99 bajan en la segunda imagen, porque un archivo ya no pasa por su caché de búfer ni por su disco.

## Qué cuesta

El Almacenamiento de objetos es un Nodo más, facturado por petición y por byte almacenado, y cada lectura espera más por su primer byte que una consulta a la Base de datos. Una sesión guardada en memoria no tiene aquí un hogar propio. Los sistemas reales la ponen en una cookie o en una [Caché](/patterns/cache-aside), y esa elección es tuya.

## En Quorum

Coloca [Almacenamiento de objetos](/components/storage) después de investigar [Almacenamiento de objetos](/research/object-storage). El Sandbox [Subidas lentas](/sandboxes/slow-uploads) muestra una subida lenta ocupando un hueco del Servidor de aplicaciones. El siguiente paso es [escala primero hacia arriba](/patterns/scale-up-first).
