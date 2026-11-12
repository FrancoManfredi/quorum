---
title: RPO y RTO
summary: Fija dos objetivos para cada desastre, cuántos datos puedes perder y cuánto tiempo puedes estar caído, y deja que ellos elijan el diseño de copias de seguridad y standby.
section: patterns
group: Operate and observe
order: 707
aliases: rpo, rto, recovery point objective, recovery time objective, backup, pitr, point in time recovery, restore, restore drill, wal archiving, objetivo de punto de recuperación, objetivo de tiempo de recuperación, copia de seguridad, recuperación a un punto en el tiempo, restauración, simulacro de restauración
---

El RPO es la mayor cantidad de datos que aceptas perder, medida en tiempo. El RTO es el máximo tiempo que aceptas estar caído.

## Cuándo usarlo

- Alguien pregunta "¿tenemos copias de seguridad?" y la respuesta honesta es "¿hasta cuándo, y qué tan rápido podemos recuperarlas?"
- Hay que deshacer una migración errónea o una tabla borrada, y la última copia tiene un día.
- Eliges entre instantáneas nocturnas, archivado de logs y un standby.

## Cómo funciona

El RPO lo fija la frecuencia con que los datos salen de la primaria. Una instantánea nocturna implica un RPO de hasta 24 horas. La recuperación a un punto en el tiempo archiva el write-ahead log (WAL) de forma continua, así que el RPO es de minutos y puedes restaurar justo antes de la sentencia errónea. La replicación síncrona lo lleva a cero, al precio de escrituras más lentas.

El RTO lo fija lo que tarda la recuperación. Restaurar una instantánea y reproducir un log crece con el tamaño de los datos, así que una base de datos de 1 TB se restaura mucho más lento que una de 10 GB. Un standby en caliente se salta la copia y toma el relevo en segundos.

Un standby no deshace un borrado, porque copia también el borrado. Solo lo hace una copia de seguridad con historial.

## Qué cuesta

El archivado de logs y un standby añaden cada uno almacenamiento y una segunda máquina. El error habitual es confiar en copias de seguridad que nadie ha restaurado. Un simulacro encuentra la mala antes de que lo haga el desastre.

## En Quorum

Elige el modo de copia de seguridad de una Base de datos, como abajo. Nocturno es el suelo barato, y PITR mantiene minutos de RPO.

::Design{id="rpo-pitr"}

Una copia de seguridad que nadie ha restaurado puede no restaurarse, y los [Simulacros de restauración](/research/restore-drills) prueban cada copia cuando se hace, de modo que esa tirada nunca falle. Pulsar Restaurar tras un [borrado accidental](/incidents/accidental-delete) lee la copia de seguridad, y el tiempo crece con las filas. Una Réplica de lectura en otra región fija el RPO por su retraso, y un almacén Distribuido no pierde nada. El [Simulacro de DR](/incidents/dr-drill) mide ambos números para la lista de verificación de la IPO. Mira [Niveles de recuperación ante desastres](/patterns/disaster-recovery-tiers), y las entradas del glosario [RPO y RTO](/glossary/rpo-and-rto) y [recuperación a un punto en el tiempo](/glossary/point-in-time-recovery).
