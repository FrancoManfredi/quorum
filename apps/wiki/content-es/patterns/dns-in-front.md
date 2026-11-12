---
title: DNS por delante
summary: Pon DNS delante de varios Balanceadores de carga para que el punto de entrada no sea una sola máquina, y ajusta su TTL a la rapidez de failover que necesitas.
section: patterns
group: Scaling steps
order: 108
aliases: dns round robin, route 53, ttl, multiple load balancers, redundant load balancer, domain, round robin de DNS, varios balanceadores de carga, balanceador de carga redundante, dominio
---

Apunta el dominio a DNS, y deja que DNS reparta las direcciones de dos o más Balanceadores de carga.

## Cuándo dar el paso

- El Balanceador de carga es en sí mismo el punto único de fallo.
- Los Usuarios solo admiten un enlace, y necesitas más de un punto de entrada.

## El Diseño

::Design{id="dns-slow-ttl"}

::Design{id="dns-fast-ttl"}

Ambas imágenes muestran un minuto después de que muriera un Balanceador de carga. DNS reparte el tráfico a partes iguales entre dos Balanceadores de carga, y ambos llegan a los mismos dos Servidores de aplicaciones. Un TTL largo sigue enviando usuarios al caído. Uno corto ya lo ha quitado.

## Por qué funciona

Los resolvers cachean las respuestas de DNS durante el TTL. Con un TTL largo, la mitad de las peticiones siguen yendo al Balanceador de carga caído hasta que se agota el TTL. Con uno corto, DNS deja de repartir la dirección caída en una o dos consultas, y los errores vuelven a cero.

## Qué cuesta

DNS no tiene comprobaciones de estado hasta que las investigas, así que un host caído conserva su parte. También ignora el tamaño, así que un host pequeño recibe tanto como uno grande. Un TTL corto significa más consultas, y algunos resolvers retienen las respuestas más tiempo del que pides. El TTL es una promesa sobre el mejor caso, no una garantía.

## En Quorum

El Componente [DNS](/components/dns) se desbloquea con [Round robin de DNS](/research/dns-rr). Cambiar el TTL necesita [Comprobaciones de estado](/research/health-checks), y DNS quita un host caído solo cuando tu Equipo también ha construido el endpoint de comprobación de estado. El glosario define el [round robin de DNS](/glossary/dns-round-robin). El siguiente paso son [archivos estáticos en almacenamiento de objetos y una CDN](/patterns/static-files-on-object-storage-and-a-cdn).
