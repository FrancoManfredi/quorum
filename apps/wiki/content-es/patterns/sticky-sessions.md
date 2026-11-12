---
title: Sesiones persistentes
summary: Las sesiones persistentes hacen que un balanceador de carga devuelva un cliente al servidor que usó primero, para que la memoria de ese servidor pueda guardar el estado del cliente.
section: patterns
group: Outside the game
order: 1010
aliases: sticky sessions, session affinity, ip hash, cookie affinity, session persistence, load balancer, sesiones sticky, afinidad de sesión, persistencia de sesión, balanceador de carga
---

Las sesiones persistentes, también llamadas afinidad de sesión, hacen que un balanceador de carga dirija a un cliente al mismo backend en cada petición, normalmente mediante una cookie que emite o calculando un hash de la dirección del cliente.

Úsalas cuando un backend guarda en memoria un estado por cliente que es costoso de reconstruir. Un servidor de chat o de juego mantiene un socket y los mensajes recientes, y una aplicación guarda una caché caliente por usuario. Un Application Load Balancer de AWS puede fijar una cookie, y desde entonces el tráfico se queda en esa instancia durante un tiempo determinado. nginx ofrece lo mismo con sus directivas `ip_hash` y `sticky`. Las cookies son más precisas que el hash de IP, ya que muchos usuarios pueden compartir una misma dirección de oficina.

Los costes se derivan de fijar al cliente. La carga se desequilibra, porque las sesiones largas se quedan en los servidores antiguos y un servidor nuevo solo recibe clientes nuevos. Un servidor que muere o se vacía se lleva sus sesiones, así que los usuarios cierran sesión o pierden trabajo. El autoescalado ayuda menos. El arreglo habitual es guardar el estado de sesión en un almacén compartido y ejecutar servidores sin estado ([Servidores de aplicaciones sin estado](/patterns/stateless-app-servers)). Usa la afinidad solo como optimización, nunca como la única copia del estado.

## Lo más parecido en Quorum

El juego construye esto directamente. El [Balanceador de carga](/components/lb) tiene un interruptor de sesiones persistentes que fija a los usuarios al destino al que llegaron primero, lo que ayuda a las cachés en proceso y a los clientes en tiempo real y sesga la carga. Un Balanceador de carga persistente también devuelve a los clientes al Hub que tenían, de modo que un [Hub en tiempo real](/components/ws) reiniciado recibe solo su parte de las reconexiones. Lee [Algoritmos de balanceo de carga](/patterns/load-balancing-algorithms) y [Capa de WebSockets para tiempo real](/patterns/websockets-tier-for-realtime).

## Referencias

- [Sticky sessions with load balancer generated cookies, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/load-balancer-stickiness/alb-cookies-stickiness.html): cómo una cookie de ALB fija el tráfico durante un tiempo determinado, con un ejemplo práctico.
- [ngx_http_upstream_module, nginx](https://nginx.org/en/docs/http/ngx_http_upstream_module.html): las directivas `ip_hash`, `hash` y `sticky` y cómo interactúan con los pesos.
- [RFC 6265: HTTP State Management Mechanism](https://www.rfc-editor.org/rfc/rfc6265): el estándar de cookies en el que se apoya la afinidad basada en cookies.
