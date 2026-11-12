---
title: Expand and contract
summary: Cambia el esquema de una base de datos en pasos pequeños que el código viejo y el nuevo aceptan, para que un despliegue nunca necesite una caída ni un lanzamiento sincronizado.
section: patterns
group: Deploys and change
order: 601
aliases: online migration, schema change, zero downtime migration, parallel change, rename column, migración en línea, cambio de esquema, migración sin caída, cambio paralelo, renombrar columna, expandir y contraer
---

Expand and contract (expandir y contraer) cambia un esquema en tres fases seguras en lugar de una arriesgada.

## Cuándo usarlo

- Renombras o cambias el tipo de una columna, o divides una tabla, en una base de datos que sigue en marcha.
- Varias versiones de la app se ejecutan a la vez durante un despliegue.

## Cómo funciona

Renombrar `name` a `full_name` en un solo paso rompe todos los servidores que aún leen `name`. En su lugar:

1. Expandir: añade `full_name` y conserva `name`. Despliega código que escribe en ambas y lee la nueva, recurriendo a la vieja si hace falta.
2. Migrar: copia las filas viejas en lotes pequeños, para que ninguna sentencia retenga un lock durante mucho tiempo.
3. Contraer: cuando todos los servidores ejecutan el código nuevo y la copia está completa, elimina `name`.

Cada fase puede lanzarse y revertirse por separado. Un mal despliegue en la fase 1 se revierte sin tocar los datos.

## Qué cuesta

Un cambio de una línea se convierte en tres lanzamientos a lo largo de varios días. Los backfills añaden carga, así que ejecútalos en lotes limitados. Saltarte la fase de contraer deja columnas muertas que confunden al siguiente lector, y apresurarla es como una reversión se vuelve imposible.

## En Quorum

Investiga [Migraciones de esquema en línea](/research/online-migrations), y luego [Expandir y contraer](/research/expand-contract). El juego no tiene ajuste de Nodo para ninguna de las dos. Cambian cómo se comporta un cambio de esquema: las migraciones en línea hacen más raro el incidente [Bloqueo de migración de esquema](/incidents/migration-lock), y expand and contract elimina su causa. Ambas cuestan Horas de desarrollo extra en una Funcionalidad que cambia un esquema relacional, y un Almacén de documentos no tiene esquema que migrar. El glosario define [expand and contract](/glossary/expand-and-contract), y [Migraciones en línea](/patterns/online-migrations) cubre el lock en sí.
