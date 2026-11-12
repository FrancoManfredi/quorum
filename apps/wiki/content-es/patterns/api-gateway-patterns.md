---
title: Patrones de API gateway
summary: Pon una única puerta de entrada delante de tus servicios, para que los límites de tasa, la autenticación y la fusión de peticiones ocurran una vez en lugar de en cada servicio.
section: patterns
group: Security and edge
order: 801
aliases: api gateway, gateway, kong, rate limit, token bucket, auth offloading, gateway offloading, request coalescing, throttling, patrones de API gateway, limitación de tasa, descarga de autenticación, fusión de peticiones, estrangulamiento
---

Un API gateway es el punto de entrada único para las llamadas de los clientes, y quita las tareas transversales a cada servicio que tiene detrás.

## Cuándo usarlo

- Varios servicios implementan cada uno su propia comprobación de autenticación y su límite de tasa, y no coinciden.
- Un solo cliente ruidoso puede inundar un backend, y el backend no tiene forma de decir que no a tiempo.
- Los clientes necesitan una única dirección mientras los servicios de detrás cambian de sitio.

## Cómo funciona

El gateway enruta por host y ruta, y aplica la política antes de que la llamada llegue a un servicio. Las tareas habituales son la **limitación de tasa**, la **descarga de autenticación** (verificar un token una vez y pasar la identidad), la **terminación de TLS** y la **fusión de peticiones** (request coalescing), donde lecturas idénticas en vuelo a la vez se convierten en una sola llamada al backend. Un limitador de tipo **token bucket** se rellena al ritmo permitido y deja que una ráfaga corta gaste los tokens ahorrados.

Ejemplo: un límite de 50 peticiones por segundo con un bucket de 30 deja que un cliente lance 30 peticiones extra de golpe y luego mantiene el promedio en 50. Un tope plano habría rechazado la ráfaga.

Un gateway también puede agregar llamadas y traducir protocolos, aunque la agregación pertenece a un [backend para frontends](/patterns/backends-for-frontends) cuando crece.

## Qué cuesta

Cada petición paga un salto más, y el gateway pasa a ser un punto único de fallo, así que pon varios detrás de un balanceador de carga. La mayoría de los gateways cobran por petición. El error habitual es meter lógica de negocio en él, lo que convierte la puerta de entrada en un monolito.

## En Quorum

Coloca un Gateway entre los Usuarios y el Servidor de aplicaciones, como en el diseño de abajo.

::Design{id="gateway-front-door"}

El Gateway es el único Nodo con una tabla de rutas: cada Enlace lleva los tipos de petición que le indiques, así que las vistas de página y las llamadas de API pueden llegar a distintos grupos de Servidores de aplicaciones. Pasado su límite, responde con throttled. La fusión solo combina tipos de lectura, y la autenticación en el borde solo ayuda a los tipos que exigen inicio de sesión. Desbloquea el Gateway con [API Gateway](/research/api-gateway) y el bucket con [Limitación de tasa](/research/rate-limiting). La página del [Gateway](/components/gw) enumera los detalles, y el glosario define [limitación de tasa](/glossary/rate-limiting) y el [token bucket](/glossary/token-bucket). Para la capa que va delante, consulta [WAF y gestión de bots](/patterns/waf-and-bot-management).
