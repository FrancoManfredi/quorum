---
title: Descartar nodos caídos con comprobaciones de estado
summary: Haz que el Balanceador de carga sondee cada servidor y deje de enviar tráfico a uno que ha fallado, para que un host caído cueste segundos en lugar de una parte de las peticiones.
section: patterns
group: Scaling steps
order: 106
aliases: health check, failover, dead host, probe, liveness, readiness, deep check, drain, comprobación de estado, host caído, sonda, comprobación profunda, drenar
---

Ajusta la comprobación de estado del Balanceador de carga para que un Servidor de aplicaciones caído salga de la rotación en segundos.

## Cuándo dar el paso

- Un Servidor de aplicaciones muere y una parte fija de las peticiones falla hasta que alguien se da cuenta.
- El Balanceador de carga sigue listando un host que ya no responde.

## El Diseño

::Design{id="slow-health-checks"}

::Design{id="fast-health-checks"}

Ambas imágenes muestran el mismo momento, diez segundos después de que muriera uno de tres servidores. Con una comprobación lenta, el Balanceador de carga sigue enviando a ese host un tercio del tráfico. Con una comprobación rápida, ya lo ha descartado y los otros dos se reparten la carga.

## Por qué funciona

El intervalo es cuánto tiempo conserva su parte un host caído. Los errores de la primera imagen son exactamente la parte que habría tomado el servidor caído. En la segunda han desaparecido, y los dos servidores sanos absorben la carga con holgura.

Una comprobación profunda va más allá. También saca a cualquier servidor cuya Base de datos esté caída o sobrecargada. Eso necesita la tarea del endpoint de comprobación de estado de tu Equipo, y es afilada: si la Base de datos falla, todos los servidores fallan la comprobación.

## Qué cuesta

Un intervalo corto significa más tráfico de sondeo y más probabilidad de quitar un host por un tropiezo pasajero. Los equipos reales mantienen estrechas las comprobaciones profundas por esta razón. Una comprobación también solo ayuda si mantienes capacidad de reserva, porque los supervivientes deben cargar con la parte del host caído.

## En Quorum

Investiga [Comprobaciones de estado](/research/health-checks) para cambiar el intervalo o activar las comprobaciones profundas. La misma investigación desbloquea el drenado de un Nodo. Un [Fallo de instancia](/incidents/instance) muestra la brecha. El glosario define una [comprobación de estado](/glossary/health-check). El siguiente paso es un [un pooler entre los servidores y la base de datos](/patterns/pooler-between-servers-and-database).
