---
title: El trabajo lento, a una cola y a workers
summary: Pasa a una Cola el trabajo que el usuario no espera, y deja que los Workers la drenen a su propio ritmo.
section: patterns
group: Scaling steps
order: 116
aliases: message queue, background jobs, workers, rabbitmq, sqs, sidekiq, async, task queue, dead letter, cola de mensajes, trabajos en segundo plano, cola de tareas, mensajes muertos
---

Haz que el Servidor de aplicaciones encole el trabajo lento y responda al instante, y deja que los Workers lo hagan más tarde.

## Cuándo dar el paso

- Las exportaciones, las subidas o los webhooks ocupan huecos del Servidor de aplicaciones, y la latencia de las páginas sube cuando se ejecutan.
- Un pico de trabajo lento hace que las peticiones rápidas venzan.
- El trabajo puede hacerse unos segundos después sin que el usuario lo note.

## El Diseño

::Design{id="queue-and-workers"}

El Servidor de aplicaciones responde él mismo las páginas y las lecturas, y para una exportación pasa una tarea a la Cola y vuelve. La Cola guarda las tareas, y los Workers las toman y leen la Base de datos. Tanto el Servidor de aplicaciones como los Workers llaman a la misma Base de datos, así que esta tiene que soportar su carga combinada.

## Por qué funciona

El usuario espera solo el encolado, que es rápido, así que el trabajo lento ya no ocupa un hueco de petición. La profundidad de la Cola pasa a ser el primer indicador que vigilar. Cuando crece, los Workers son demasiado lentos, y añadir copias lo arregla sin tocar el Servidor de aplicaciones.

Los ajustes mantienen la honestidad del sistema. Una **cola de mensajes muertos** aparta una tarea que sigue fallando, para que no entre en bucle para siempre. **Máximo de intentos** indica cuántos intentos recibe una tarea. **Longitud máxima** rechaza tareas nuevas cuando está llena, en lugar de dejar crecer un atraso sin que se vea. La **Precarga** de un Worker permite que cada proceso tome tareas por adelantado, lo que ahorra viajes al broker y pierde esas tareas si se cae.

## Qué cuesta

Añades dos Nodos y un retraso que el usuario puede ver, ya que el resultado no está listo cuando vuelve la petición. La entrega es al menos una vez, así que una tarea puede ejecutarse dos veces y el trabajo debe ser idempotente. Un atraso esconde problemas hasta que llega al límite. Los Workers también leen la Base de datos, que puede convertirse en el cuello de botella.

## En Quorum

Coloca una [Cola](/components/queue) y un [Worker](/components/worker) tras [Trabajos en segundo plano](/research/background-jobs) y [Colas de mensajes](/research/queues). El patrón es la [Nivelación de carga con colas](/patterns/queue-load-leveling), con [consumidores competidores](/patterns/competing-consumers) y una [cola de mensajes muertos](/patterns/dead-letter-queue). El glosario tiene la [entrega al menos una vez](/glossary/at-least-once-delivery). El siguiente paso envía una tarea a muchos receptores: [Plataforma de mensajes para fan-out](/patterns/message-platform-for-fan-out).
