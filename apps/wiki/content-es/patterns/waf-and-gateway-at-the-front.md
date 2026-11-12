---
title: WAF y gateway al frente
summary: Pon un WAF y un API Gateway delante de los Servidores de aplicaciones, para que los bots y las ráfagas se detengan antes de que te cuesten capacidad.
section: patterns
group: Scaling steps
order: 122
aliases: web application firewall, modsecurity, api gateway, kong, rate limit, throttle, bots, ddos, paranoia level, firewall de aplicaciones web, límite de tasa, nivel de paranoia
---

Filtra el tráfico en el edge: un WAF descarta los bots, y un Gateway limita lo que queda.

## Cuándo dar el paso

- Los bots se llevan una gran parte de las peticiones y cargan los Servidores de aplicaciones.
- Los inicios de sesión se disparan por bots, o una ráfaga de un cliente desplaza al resto.
- Quieres un único lugar donde ver y limitar el tráfico de la API.

## El Diseño

::Design{id="front-door"}

Los Usuarios llegan primero al WAF, luego al API Gateway, y después al Servidor de aplicaciones y a la Base de datos. El **Nivel de paranoia** del WAF fija lo agresivo que es. El **Límite de tasa** del Gateway limita las peticiones por segundo.

## Por qué funciona

El WAF bloquea una parte de los bots, así que el Servidor de aplicaciones nunca gasta CPU en ellos. Un nivel de paranoia más alto bloquea más bots, cuesta más CPU por petición y también bloquea a más usuarios reales, que es de donde salen los errores del pie de figura. El límite del Gateway se sitúa algo por encima del pico que quieres atender. Las peticiones que lo superan fallan como `throttled` en el edge y nunca llegan a los servidores. Cada capa protege a la que tiene detrás.

## Qué cuesta

Ambas capas añaden un salto a cada petición. Un nivel de paranoia demasiado alto bloquea a compradores, lo que cuesta más que los bots. Un límite de tasa limita el volumen y no distingue a un bot de un comprador, así que no reemplaza al WAF. El Gateway factura por petición, así que es barato con poco volumen y una partida real de la factura con mucho. El modo bajo ataque bloquea casi toda la basura y a algunos usuarios reales, así que úsalo solo mientras dure un ataque.

## En Quorum

Coloca un [WAF](/components/waf) tras [Firewall de aplicaciones web](/research/waf), y un [API Gateway](/components/gw) tras [API Gateway](/research/api-gateway). [Limitación de tasa](/research/rate-limiting) añade un token bucket para las ráfagas, y [Gestión de bots](/research/bot-management) desafía a un cliente en lugar de bloquearlo. Mira [WAF y gestión de bots](/patterns/waf-and-bot-management) y [patrones de API gateway](/patterns/api-gateway-patterns). El siguiente paso es [Autenticación y TLS en el gateway](/patterns/auth-and-tls-at-the-gateway).
