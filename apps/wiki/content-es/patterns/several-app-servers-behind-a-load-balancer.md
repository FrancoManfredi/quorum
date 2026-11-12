---
title: Varios servidores de aplicaciones tras un balanceador de carga
summary: Pon un Balanceador de carga delante de Servidores de aplicaciones idénticos para que el tráfico se reparta entre ellos y la capacidad crezca añadiendo copias.
section: patterns
group: Scaling steps
order: 105
aliases: horizontal scaling, scale out, load balancer, nginx, reverse proxy, fleet, round robin, escalado horizontal, escalar hacia fuera, balanceador de carga, proxy inverso, flota
---

Coloca un Balanceador de carga delante de dos o más Servidores de aplicaciones idénticos y deja que reparta el tráfico.

## Cuándo dar el paso

- El mayor tamaño de instancia que puedes pagar tiene la barra de CPU llena, o el siguiente tamaño cuesta más que una segunda máquina.
- Un Servidor de aplicaciones es un único punto de fallo que ya no puedes aceptar.

## El Diseño

::Design{id="one-server-saturated"}

::Design{id="two-servers-balanced"}

La primera imagen es un Servidor de aplicaciones desbordado. En la segunda, los Usuarios llegan al Balanceador de carga, que pasa cada petición a uno de dos Servidores de aplicaciones. Ambos llaman a la misma Base de datos.

## Por qué funciona

Cada servidor atiende ahora la mitad de las peticiones, así que su barra de carga baja de llena, las caídas cesan y el p99 vuelve a la normalidad. El algoritmo por defecto reparte según la capacidad. Con servidores idénticos es un reparto equitativo, y con tamaños mixtos cada servidor recibe una parte proporcional a su capacidad. Least connections sigue la carga en vivo, lo que ayuda cuando los servidores se ralentizan de forma desigual, y requiere investigación.

Esto funciona porque los pasos anteriores no dejaron estado en el servidor. Si la siguiente petición de un usuario cae en la otra copia, encuentra las mismas filas y archivos.

## Qué cuesta

El Balanceador de carga es un salto más y un Nodo más que dimensionar. Solo, es el nuevo punto único de fallo. Ambos servidores mantienen sus propias conexiones a la Base de datos, así que el número de conexiones se duplica aproximadamente con cada copia, que es el siguiente problema. Activar las sesiones persistentes fija a los usuarios a una copia y desequilibra la carga.

## En Quorum

Investiga [Balanceo de carga](/research/load-balancing) para desbloquear el [Balanceador de carga](/components/lb), y luego enlázalo a cada [Servidor de aplicaciones](/components/server). [Algoritmos de balanceo de carga](/research/lb-algorithms) añade least connections. El glosario define el [balanceador de carga](/glossary/load-balancer). El siguiente paso es [descartar nodos caídos con comprobaciones de salud](/patterns/drop-dead-nodes-with-health-checks).
