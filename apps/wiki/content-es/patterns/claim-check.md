---
title: Claim check
summary: Guarda una carga grande en el almacenamiento de objetos y envía solo una referencia por la cola, para que los mensajes sigan siendo pequeños y rápidos.
section: patterns
group: Messaging and async
order: 409
aliases: large messages, payload offload, s3 pointer, reference message, message size limit, mensajes grandes, descarga de carga útil, puntero a S3, mensaje de referencia, límite de tamaño de mensaje, resguardo
---

Un claim check (resguardo) guarda la carga grande en otro sitio y pasa por el sistema de mensajería un pequeño ticket que la identifica.

## Cuándo usarlo

- Los mensajes llevan archivos, imágenes o documentos, y chocan con el límite de tamaño del broker o lo ralentizan.
- Muchos consumidores leen un mensaje, y cada uno copiaría la carga.
- La carga necesita una regla de retención o de acceso distinta a la del evento.

## Cómo funciona

El productor sube la carga al almacenamiento de objetos bajo una clave y envía un mensaje con esa clave. El consumidor lee el mensaje y luego obtiene la carga con la clave. Los brokers están ajustados para muchos mensajes pequeños, así que un vídeo de 5 MB enviado como un puntero de 200 bytes mantiene rápida la cola. SQS limita un mensaje a 1 MiB, y la solución habitual para cualquier cosa más grande es este patrón.

## Qué cuesta

Ahora tienes dos sistemas que mantener consistentes: un mensaje puede apuntar a un objeto que se borró o que nunca terminó de subirse. Alguien debe limpiar los objetos cuando el último consumidor termina. Leer cuesta un salto extra, y el control de acceso debe cubrir tanto el mensaje como el objeto.

## En Quorum

El juego no tiene un ajuste de la Cola para el tamaño de la carga ni forma de enlazar una Cola con el Almacenamiento de objetos como claim check, así que aquí no hay Diseño. Enseña las dos mitades por separado. El [Almacenamiento de objetos](/components/storage) quita las subidas de la Base de datos, y una [Cola](/components/queue) transporta tareas, así que una subida se guarda una vez y el trabajo lento posterior va a un [Worker](/components/worker). [Almacenamiento de objetos y reglas de ciclo de vida](/patterns/object-storage-and-lifecycle-rules) cubre el almacén. El glosario define [almacenamiento de objetos](/glossary/object-storage).
