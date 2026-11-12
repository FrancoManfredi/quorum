---
title: Niveles de recuperación ante desastres
summary: Elige cuánta capacidad en standby mantener para una región perdida, desde solo copias de seguridad hasta un segundo sitio que sirve tráfico todo el tiempo, y paga por la velocidad que necesitas.
section: patterns
group: Operate and observe
order: 706
aliases: disaster recovery, dr, backup and restore, pilot light, warm standby, active-active, multi-site, failover region, standby, recuperación ante desastres, copia y restauración, luz piloto, standby templado, activo-activo, multisitio, región de failover
---

Los niveles de recuperación ante desastres cambian dinero por velocidad de recuperación: cuanto más rápido debas volver, más capacidad ociosa o duplicada pagas.

## Cuándo usarlo

- La pérdida de una región o zona entera acabaría con el negocio, no solo estropearía un día.
- El negocio dice cuánto tiempo puede estar caído y cuántos datos puede perder, así que el nivel es una elección y no una conjetura.
- Tienes copias de seguridad pero nunca has restaurado una.

## Cómo funciona

El whitepaper de AWS nombra cuatro niveles, del más barato al más caro:

1. **Copia y restauración (backup and restore).** Copia los datos a otro sitio y reconstruye todo después del desastre. La recuperación lleva horas.
2. **Luz piloto (pilot light).** Mantén los datos replicados y el núcleo funcionando, y arranca el resto bajo demanda. La recuperación lleva decenas de minutos.
3. **Standby templado (warm standby).** Mantén en marcha una copia reducida de todo el stack, y escálala en el failover. La recuperación lleva minutos.
4. **Activo-activo (active-active).** Sirve tráfico desde dos sitios a la vez, de modo que una pérdida solo quita la mitad de la capacidad. La recuperación es casi nula.

Un equipo que pierde una región a las `02:00` con solo copias de seguridad nocturnas restaura una copia de hace un día y reconstruye los servidores a mano. Un equipo con activo-activo ya está sirviendo desde el otro sitio.

## Qué cuesta

Cada nivel que subes multiplica la factura y la complejidad, y el activo-activo añade los problemas de consistencia entre sitios de las [estrategias de replicación](/patterns/replication-strategies). El error habitual es una restauración sin probar. Una copia de seguridad que no has restaurado es una esperanza, así que ensáyala.

## En Quorum

El juego cubre los niveles que importan. Una Base de datos solo con instantáneas es copia y restauración. Un standby de zona cubre una zona perdida. Una réplica en otra región detrás de GeoDNS es un standby templado, y un almacén Spread es activo-activo. No tiene luz piloto. El Diseño de abajo muestra un standby de zona.

::Design{id="dr-zone-standby"}

[Recuperación a un punto en el tiempo](/research/pitr) desbloquea las copias de seguridad, [Múltiples zonas](/research/multi-az) desbloquea el standby, y [Simulacros de recuperación ante desastres](/research/dr-drills) ejecuta la caída regional guionizada que pide la lista de verificación de la IPO. El incidente [Caída de zona](/incidents/zone) muestra a un standby tomando el relevo. Consulta [RPO y RTO](/patterns/rpo-and-rto) para los dos números que compra un nivel, y la entrada del glosario sobre [zonas de disponibilidad](/glossary/availability-zone).
