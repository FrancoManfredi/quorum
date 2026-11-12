---
title: 'Canario para las reglas del edge: Cloudflare'
summary: Una sola regla de WAF llevó al 100% la CPU de todos los edges de Cloudflare, y la solución fue un canario antes del despliegue global.
section: patterns
group: Ran in production
order: 959
aliases: cloudflare, waf, regex, outage, canary, edge, postmortem, caída, canario, análisis posterior
---

El 2 de julio de 2019, Cloudflare desplegó a las `13:42` una nueva regla gestionada de WAF. La regla contenía una expresión regular que hacía backtracking con entradas largas, y todos los núcleos de CPU que servían HTTP y HTTPS llegaron al 100%. La red devolvió errores 502 durante 27 minutos, y la solución fue desactivar la regla.

## El sistema

El edge de Cloudflare es anycast: cada punto de presencia ejecuta el mismo proxy, WAF y caché, y una regla desplegada globalmente llega a todos a la vez. Esa es su fortaleza y también su modo de fallo. El postmortem dice que la regla era un cambio menor en la detección de XSS, desplegado mediante un proceso automático, y que la primera alerta saltó tres minutos después. El equipo tenía un kill switch, y por eso la caída terminó en 27 minutos y no en horas.

## El tablero

::Design{id="cloudflare-edge-rule"}

El DNS es la entrada anycast, el WAF es la capa de reglas gestionadas, la CDN es la caché del edge y la Función edge es un Worker. El Servidor de aplicaciones y la Base de datos están detrás. El tablero ejecuta el incidente [Backtracking de regex](/incidents/regex) del juego en el WAF, así que el pie de imagen muestra lo que una regla defectuosa hace al camino de la petición.

## Por qué funciona

La forma pone una regla delante de cada petición, así que una regla que cuesta CPU la cuesta en todas partes. Un canario envía la regla primero a un punto de presencia, y un kill switch termina un mal despliegue sin otro despliegue. [Blue-green y canario](/patterns/blue-green-and-canary) y [WAF y gestión de bots](/patterns/waf-and-bot-management) son los dos controles.

## Hasta dónde llega el juego

El incidente de Regex del juego cuesta una porción del tráfico. La regla real tumbó toda la red durante 27 minutos. El tablero tiene un WAF, no una flota anycast global, y no puede mostrar un kill switch. El pie de imagen es el incidente del juego, no la caída de Cloudflare.

## Fuentes

- [Details of the Cloudflare outage on July 2, 2019, Cloudflare](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019): la cronología, la regex, los 27 minutos y el kill switch.
- [Cloudflare outage caused by bad software deploy, Cloudflare](https://blog.cloudflare.com/cloudflare-outage/): el primer postmortem y la remediación inmediata.
- [Cloudflare Global Network, Cloudflare](https://www.cloudflare.com/network/): cómo una regla llega a todos los puntos de presencia.
