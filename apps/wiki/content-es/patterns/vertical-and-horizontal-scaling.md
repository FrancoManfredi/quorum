---
title: Escalado vertical y horizontal
summary: Haz más grande una máquina, o ejecuta más máquinas, y sabe cuál elegir primero.
section: patterns
group: Scaling reads and compute
order: 207
aliases: scale up, scale out, scaling, bigger box, more servers, single point of failure, escalar hacia arriba, escalar hacia fuera, escalado, máquina más grande, más servidores, punto único de fallo
---

Escalar verticalmente significa una máquina más grande, y escalar horizontalmente significa más máquinas que se reparten el trabajo.

## Cuándo usarlo

- Vertical: una máquina es el límite, el código guarda estado en memoria y se acepta un reinicio.
- Horizontal: necesitas sobrevivir a la pérdida de una máquina, o una máquina del mayor tamaño no basta.
- Cualquiera: una barra de carga está en rojo en una sola capa, lo que te dice qué hacer crecer.

## Cómo funciona

Ir en vertical cambia un número, y nada más en el sistema lo nota. Un servidor de 4 vCPU pasa a ser uno de 8 vCPU. El techo es la máquina más grande que puedas alquilar, y el precio por núcleo sube cerca de lo más alto.

Ir en horizontal pone un balanceador de carga delante de varias copias. Dos servidores de 2 vCPU tienen tanta CPU como uno de 4 vCPU, pero necesitan un lugar donde compartir el estado, normalmente la base de datos, porque la siguiente petición de un usuario puede caer en la otra copia.

## Qué cuesta

El escalado vertical tiene un techo duro y un único punto de fallo, y cambiar el tamaño de una máquina suele significar un reinicio. El escalado horizontal añade un balanceador, comprobaciones de salud y la regla de que los servidores no guardan estado local. También multiplica las conexiones a la base de datos, por lo que la gente añade un [pool de conexiones](/patterns/connection-pooling) poco después.

Empieza en vertical porque es barato en tiempo de ingeniería, y pasa a horizontal cuando necesites tolerancia a fallos o se te acabe la máquina.

## En Quorum

Los dos Diseños atienden a los mismos Usuarios con la misma CPU total. El primero tiene un [Servidor de aplicaciones](/components/server) más grande, y el segundo tiene dos más pequeños tras un [Balanceador de carga](/components/lb). Compara el Gasto y el pie de figura de cada uno.

::Design{id="scale-up"}

::Design{id="scale-out"}

Los pasos [Escala primero hacia arriba](/patterns/scale-up-first) y [Varios servidores de aplicaciones tras un balanceador de carga](/patterns/several-app-servers-behind-a-load-balancer) cubren cada uno un enfoque. El glosario define el [escalado vertical y horizontal](/glossary/vertical-and-horizontal-scaling), y [Sobrevivir a un pico de tráfico](/guides/survive-a-traffic-spike) usa ambos.
