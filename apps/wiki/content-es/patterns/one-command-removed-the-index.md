---
title: Un comando quitó el índice: AWS S3
summary: Una entrada mal escrita eliminó los servidores detrás de los subsistemas de índice y de ubicación de S3, y us-east-1 perdió S3 durante unas cuatro horas.
section: patterns
group: When it broke
order: 971
aliases: aws, s3, outage, index subsystem, cells, postmortem, us-east-1, caída, subsistema de índice, celdas, postmortem
---

El 28 de febrero de 2017, un miembro del equipo de S3 ejecutó un comando para retirar unos pocos servidores de facturación, y una entrada mal escrita eliminó un conjunto mayor. Los servidores retirados ejecutaban los subsistemas de índice y de ubicación de us-east-1, y S3 no pudo atender peticiones GET, LIST, PUT ni DELETE durante unas cuatro horas.

## El sistema

El subsistema de índice guarda los metadatos y la ubicación de cada objeto de la región. El subsistema de ubicación asigna almacenamiento nuevo y necesita el índice para funcionar. El equipo depuraba un proceso de facturación lento y usó un playbook para retirar unos pocos servidores de facturación. La entrada equivocada retiró capacidad que necesitaban los subsistemas de índice y de ubicación, y ambos requerían un reinicio completo. Hacía años que el índice no se reiniciaba por completo en la región. Fallaron otros servicios de AWS, entre ellos los lanzamientos de EC2 y Lambda. El panel de estado también dependía de S3.

## El tablero

::Design{id="s3-index-region"}

El Almacenamiento de objetos guarda los bytes, y la Base de datos es el índice que los localiza. El Balanceador de carga y el Servidor de aplicaciones son el front end. El tablero ejecuta el incidente [Disco lleno](/incidents/disk-full) del juego sobre la Base de datos del índice, que representa al índice perdiendo la capacidad que necesita.

## Qué se rompió

Un solo comando destructivo retiró capacidad que necesitaban dos subsistemas críticos. El índice no tenía una vía de reinicio rápido a ese tamaño, y la ubicación no podía recuperarse hasta que lo hiciera el índice. El radio de impacto cruzó los límites del servicio, y la página de estado estaba dentro, así que los clientes no podían ver el estado. El evento duró de las `09:37` a las `13:54`, hora del Pacífico.

## Qué cambió

AWS reorganizó sus prioridades para dividir el subsistema de índice en celdas más pequeñas, de modo que un fallo se quede dentro de una celda y la recuperación empiece con menos. Las investigaciones [Múltiples zonas](/research/multi-az) y [Múltiples regiones](/research/multi-region) del juego son las protecciones más cercanas, y [Bulkhead](/patterns/bulkhead) es la misma idea aplicada a un servicio.

## Hasta dónde llega el juego

El incidente Disco lleno del juego toma las escrituras del índice. S3 perdió los servidores que guardaban el índice, y el radio de impacto se extendió a otros servicios. El tablero no tiene celdas, ni playbook, ni dependencia del panel de estado. El pie de figura es el incidente del juego, no la caída de 2017.

## Fuentes

- [Summary of the Amazon S3 Service Disruption in the Northern Virginia (US-EAST-1) Region, AWS](https://aws.amazon.com/message/41926): el comando, los subsistemas de índice y de ubicación, la cronología y las celdas.
- [Reliability Pillar, AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html): el radio de impacto, la recuperación y por qué un servicio se divide en celdas.
- [Static stability using Availability Zones, AWS Builders' Library](https://aws.amazon.com/builders-library/static-stability-using-availability-zones/): por qué la vía del estado no debe depender del sistema sobre el que informa.
