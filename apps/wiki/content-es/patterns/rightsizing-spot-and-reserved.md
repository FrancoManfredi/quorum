---
title: Rightsizing, spot y reservadas
summary: Ajusta cada máquina a la carga que lleva, y luego compra la parte estable con un compromiso y la parte interrumpible con un gran descuento.
section: patterns
group: Cost
order: 901
aliases: rightsizing, right sizing, spot instances, reserved instances, savings plans, on-demand, instance family, arm, graviton, compute cost, finops, instancias spot, instancias reservadas, planes de ahorro, bajo demanda, familia de instancias, coste de cómputo
---

Reduce las máquinas a la carga que llevan, y luego paga el precio más barato que acepte cada parte de la flota.

## Cuándo usarlo

- Las gráficas de utilización se quedan por debajo de un tercio en el pico, así que pagas por capacidad ociosa.
- La carga tiene un suelo estable que nunca desaparece, que es la parte a la que comprometerse.
- Parte del trabajo se puede interrumpir y reintentar, como los trabajos por lotes o los workers sin estado.

## Cómo funciona

El rightsizing va primero, porque un descuento sobre una máquina sobredimensionada ahorra menos que quitar el exceso. Elige la familia de instancias según el cuello de botella: con mucha memoria para las cachés, con mucho cómputo para el código limitado por CPU. Las familias ARM, como AWS Graviton, ejecutan muchas cargas por cerca de un 20% menos si el software se porta.

Luego compra según la previsibilidad. **Bajo demanda** no tiene compromiso. Las instancias **reservadas** o los planes de ahorro cambian un compromiso de uno o tres años por aproximadamente un 30 a 70% de descuento. La capacidad **spot**, con hasta cerca de un 90% de descuento, puede ser reclamada con un aviso de dos minutos en AWS.

Ejemplo: ocho servidores web de los que seis están siempre ocupados y dos atienden los picos. Reserva los seis, ejecuta los dos en spot tras el mismo balanceador de carga, y perder una máquina spot solo recorta capacidad.

## Qué cuesta

Los compromisos se pagan se use o no la máquina, así que reservar antes de hacer rightsizing fija el desperdicio. Spot falla en el peor momento a menos que la aplicación se apague limpiamente y quede en pie una copia que no sea spot. Nunca pongas una base de datos primaria en spot.

## En Quorum

El precio es un ajuste de los Nodos de cómputo desde la Serie A, y el Diseño de abajo divide una flota de tres maneras.

::Design{id="fleet-pricing"}

[Instancias reservadas](/research/reserved-instances) e [Instancias spot](/research/spot-instances) necesitan ambas [Autoescalado](/research/autoscaling). Un Nodo reservado no puede volver a bajo demanda hasta que termine su plazo. El [Informe de rightsizing](/research/rightsizing) marca los Nodos que nunca se acercan a estar ocupados en el pico, y las [Instancias ARM](/research/arm-instances) añaden una familia más barata. Los [Planes de ahorro](/research/savings-plans) dan descuento a todos los Nodos de cómputo sin un plazo por Nodo. El incidente [Reclamación de Spot](/incidents/spot-reclaim) muestra lo que cuesta una interrupción a una flota sin copia bajo demanda. La entrada del glosario [instancia spot](/glossary/spot-instance) y [Recortar la factura de la nube](/guides/cut-the-cloud-bill) cubren el resto.
