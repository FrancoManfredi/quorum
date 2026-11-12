---
title: Migraciones en línea
summary: Cambia una base de datos en vivo sin bloquearla, para que las escrituras sigan fluyendo mientras el esquema o los datos se mueven.
section: patterns
group: Deploys and change
order: 606
aliases: online schema change, ghost, pt-osc, backfill, alter table, lock, zero downtime, cambio de esquema en línea, bloqueo, sin tiempo de inactividad
---

Una migración en línea cambia una tabla grande mientras la aplicación sigue leyéndola y escribiéndola.

## Cuándo usarlo

- Un ALTER TABLE sobre una tabla grande mantendría un bloqueo durante minutos.
- La tabla recibe escrituras todo el día y no se permite tiempo de inactividad.
- Necesitas mover datos a una tabla, columna o motor nuevos.

## Cómo funciona

Un ALTER simple puede bloquear la tabla mientras reescribe cada fila, y las escrituras se encolan detrás hasta que vencen. Herramientas en línea como gh-ost o pt-online-schema-change construyen una copia sombra con la forma nueva, copian filas en lotes pequeños, reproducen en ella las escrituras nuevas y luego intercambian los nombres en un paso rápido. Los lotes se frenan cuando la base de datos está ocupada, así que la migración cede ante el tráfico real. Una tabla de 500 GB puede tardar días así, y ningún usuario lo nota.

## Qué cuesta

La copia necesita disco adicional y carga de escritura adicional, y el intercambio sigue requiriendo un bloqueo muy breve. Puede que una herramienta no maneje claves foráneas ni triggers. Los cambios de esquema que el código antiguo y el nuevo deben aceptar a la vez siguen necesitando [expand and contract](/patterns/expand-and-contract). Vigila el retraso de replicación mientras corre la copia.

## En Quorum

El juego no tiene un Diseño para esto, porque cambia cómo se comporta una migración, no un Nodo. [Migraciones de esquema en línea](/research/online-migrations) cambia una tabla grande sin mantener su bloqueo, y [Expandir y contraer](/research/expand-contract) va más allá. Sin ellas, el incidente [Bloqueo de migración de esquema](/incidents/migration-lock) encola las escrituras y las hace vencer hasta que cancelas la migración. Las funcionalidades que cambian un esquema relacional cuestan horas de desarrollo extra mientras tengas cualquiera de los dos. Un Almacén de documentos no tiene un esquema que migrar. El glosario define [expand and contract](/glossary/expand-and-contract).
