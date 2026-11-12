---
title: Plataforma de mensajes para fan-out
summary: Envía cada notificación a través de una Cola y Workers a un proveedor gestionado, para que un envío lento o fallido nunca retenga una petición.
section: patterns
group: Scaling steps
order: 117
aliases: push notifications, sns, ses, email, pub sub, fan out, notification service, webhooks, notificaciones push, correo, servicio de notificaciones
---

Envía una notificación desde un Worker a un proveedor gestionado, no desde el Servidor de aplicaciones que recibió la petición.

## Cuándo dar el paso

- Los usuarios esperan un push o un correo tras un evento, y cada envío retiene un hueco del Servidor de aplicaciones.
- La respuesta lenta o la caída de un proveedor se nota como páginas lentas.
- Un evento debe llegar a muchos receptores, y los envíos van en aumento.

## El Diseño

::Design{id="push-fan-out"}

El Servidor de aplicaciones encola la notificación y vuelve. Los Workers la toman y llaman al Proveedor de notificaciones push. Ese Enlace tiene una política de **Tiempo de espera** y de **Reintentos**, porque el proveedor es un tercero y el Worker tiene que protegerse de él.

## Por qué funciona

El usuario nunca espera el envío. Un proveedor atascado retiene un Worker unos segundos, no la espera por defecto, y la Cola absorbe el atraso mientras el proveedor se recupera. Los reintentos con backoff cubren un fallo breve sin machacar al proveedor.

Un proveedor gestionado no cuesta nada colocarlo y cobra por mensaje, así que pagas por volumen y no operas ninguna flota de envío.

## Qué cuesta

La entrega es al menos una vez, así que una notificación puede llegar dos veces a menos que el envío sea idempotente. El juego no tiene un tema con muchos suscriptores, así que esto muestra el fan-out más simple: una tarea, un proveedor. Una plataforma real añade temas, y puedes leer sobre ellos en [Publicación-suscripción](/patterns/publish-subscribe). El backoff retrasa un envío fallido, así que los mensajes urgentes pierden tiempo.

## En Quorum

El [Proveedor de notificaciones push](/components/msgp) necesita [Notificaciones](/research/notifications), y se coloca tras la [Cola](/components/queue) y el [Worker](/components/worker) del paso anterior. Los dos ajustes del Enlace necesitan [Tiempos de espera y reintentos](/research/timeouts), y el backoff necesita [Backoff con jitter](/research/backoff-jitter). Las páginas [Tiempos de espera](/patterns/timeouts) y [Reintentos con backoff](/patterns/retry-with-backoff) explican los dos ajustes del Enlace. El siguiente paso cubre el trabajo con picos sin una máquina: [Funciones para trabajos con picos](/patterns/functions-for-spiky-jobs).
