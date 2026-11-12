---
title: Federación
summary: Divide los datos por funcionalidad en bases de datos separadas, para que cada servicio sea dueño de sus tablas y una funcionalidad muy ocupada no pueda ralentizar al resto.
section: patterns
group: Scaling data
order: 304
aliases: functional partitioning, database per service, split by feature, vertical partitioning, polyglot persistence, partición funcional, base de datos por servicio, dividir por funcionalidad, partición vertical, persistencia políglota, federación
---

La federación da a cada funcionalidad su propia base de datos, para que los pedidos, los usuarios y el catálogo dejen de compartir una misma máquina.

## Cuándo usarlo

- Una base de datos atiende funcionalidades sin relación entre sí, y un informe lento o un feed muy ocupado ralentiza los pagos.
- Los equipos quieren desplegar y dimensionar sus propios datos sin pedírselo unos a otros.
- Las funcionalidades rara vez hacen join con las tablas de las demás.

## Cómo funciona

Elige las costuras donde las tablas no hacen join: los pedidos en una base de datos, el catálogo en otra, las sesiones en una tercera. Cada servicio habla con su propia base de datos, y todo lo que necesita de otra funcionalidad llega a través de la API de ese servicio, no de un join. Si los pedidos reciben 1,000 escrituras por segundo y el catálogo 20, dejan de competir por el mismo disco.

A diferencia del [sharding](/patterns/sharding), cada base de datos guarda tablas distintas, así que la federación reparte la carga por funcionalidad, no por fila. Las dos se combinan: haz sharding de la base de datos federada más grande más adelante.

## Qué cuesta

Una consulta o transacción que cruzaba funcionalidades ahora cruza servicios. Los joins pasan a ser código de aplicación, y un cambio que toca dos bases de datos necesita una [saga](/patterns/saga) o una brecha aceptada. También operas más bases de datos, con más copias de seguridad y más cosas que parchear. La federación ayuda solo hasta el número de funcionalidades, y la más ocupada sigue siendo una sola base de datos.

## En Quorum

::Design{id="federated-by-kind"}

El juego no tiene división por tabla, así que el Diseño divide por tipo de petición. Cada Enlace del [API Gateway](/components/gw) lleva una lista de tipos de petición, así que las escrituras, los pagos y los inicios de sesión llegan al servicio de pedidos y todo lo demás llega al servicio de catálogo. Cada [Servidor de aplicaciones](/components/server) tiene su propia [Base de datos](/components/database), dimensionada aparte de la otra.

[Divide la base de datos por funcionalidad](/patterns/split-the-database-by-feature) es el paso, y [El nivel de datos](/explanation/the-data-tier) cubre las opciones.
