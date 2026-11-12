---
title: Arreglar consultas lentas
summary: Termina un incidente de Consulta lenta con Añadir índice, resuelve los índices que faltan en las Funcionalidades nuevas y detén las consultas N+1 de los frameworks con ORM.
section: guides
order: 7
era: 1
aliases: slow query, index, add index, explain, query analysis, n+1, eager loading, unindexed, table scan, consulta lenta, índice, añadir índice, carga anticipada, escaneo de tabla
gdd: /design/07-data-tier
---

Usa esta guía cuando corre un incidente de [Consulta lenta](/incidents/slow-query), o cuando la CPU de
la Base de datos sube mientras el tráfico sigue igual.

Una consulta sin índice escanea toda la tabla. Su coste crece con el número de filas, y las filas
crecen con tus usuarios. Por eso un índice que falta es invisible al principio y se convierte en el
cuello de botella más tarde.

## Antes de empezar

Necesitas [Análisis de consultas](/research/query-analysis), que se abre en la Era Garaje. Sin él, el
juego te dice que una consulta no tiene índice, pero no puedes añadir uno.

## Termina un incidente de Consulta lenta

1. Busca el mensaje "Una consulta nueva no tiene índice. Cada lectura escanea la tabla." Aparece
   cuando empieza el incidente.
2. Selecciona la Base de datos. El mismo mensaje sale como un aviso rojo en la parte superior del
   Inspector.
3. Haz clic en **Añadir índice** en el aviso. La tarea **Añadir índice** pasa al principio del
   [backlog del Equipo](/explanation/team-and-velocity), y el Equipo gasta en ella las horas de
   desarrollo que tiene al instante.
4. Vigila la línea con el icono del martillo en la parte inferior del HUD, que nombra el trabajo que
   está construyendo el Equipo.
5. Cuando la tarea se entrega, el incidente termina y la fila **Carga** de la Base de datos debería
   volver a bajar.

:::Note{tone="tip"}
**Añadir índice** cuesta 4 horas de desarrollo. Un Equipo sin horas de desarrollo acumuladas necesita
tiempo para construirlo. Guarda una pequeña reserva de horas de desarrollo si los incidentes de
Consulta lenta son probables en tu Diseño.
:::

Si el aviso dice "Investiga Análisis de consultas para encontrarla", empieza primero esa
Investigación. Mientras esperas, una [Caché](/components/cache) delante de la Base de datos mantiene
la mayoría de las lecturas fuera de la tabla.

El Sandbox [Mayoría de lecturas](/sandboxes/read-mostly) termina con una consulta que se entrega sin
índice. Mantén el Apdex por encima de su límite durante dos minutos después de que se entregue.

## Encuentra los índices antes del incidente

Algunas Funcionalidades entregan formas de consulta sin índice, y cada forma abierta hace más
probable una Consulta lenta.

1. Pulsa **T** para abrir el panel del Equipo.
2. Busca la ficha **Añadir índice** bajo **Ingeniería**. Si muestra **Encolar**, al menos una forma
   de consulta no tiene índice.
3. Haz clic en **Encolar**. Cada Añadir índice cubre una forma.
4. Repite hasta que la ficha deje de ofrecer **Encolar**, lo que significa que toda consulta tiene un
   índice.

Las fichas de Ingeniería aparecen solo para las tareas cuya Investigación posees.

## Detén las consultas N+1

Laravel, Rails y Django usan un ORM que envía varias consultas de lectura donde bastaría una, que es
el patrón de [consulta N+1](/glossary/n1-query): la Base de datos hace varias veces más trabajo de
lectura para el mismo tráfico.

1. Revisa la sección **Framework** de un Servidor de aplicaciones. Si nombra Laravel, Rails o Django,
   el patrón se aplica.
2. Investiga [Carga anticipada](/research/eager-loading).
3. En el panel del Equipo, encola la tarea **Carga anticipada**. Cuesta 10 horas de desarrollo.
4. Cuando se entregue, comprueba que baja el medidor de CPU de la Base de datos.

La otra opción es un framework sin consultas N+1, como Symfony, pero eso es una migración de Stack y
cuesta más horas de desarrollo. Mira [Elegir un stack](/guides/choose-a-stack).

## Mantén las lecturas fuera de la Base de datos

Un índice abarata cada consulta, pero cada lectura sigue cayendo en la única Base de datos que guarda
el estado, y por eso [el nivel de datos](/explanation/the-data-tier) es el reto a largo plazo de
cualquier Diseño. Estos Componentes le envían menos consultas:

- Una [Caché](/components/cache) responde lecturas repetidas desde memoria.
- Una [Réplica de lectura](/components/replica) responde lecturas con una copia de los datos.
- Un [Almacén de datos](/components/warehouse) se lleva los escaneos de informes, desde la Era Serie B.

Mira [Escalar la base de datos](/guides/scale-the-database) para los pasos. Hagas el arreglo que
hagas, el medidor de **CPU** en **Recursos** debe bajar, no debe quedar ningún aviso rojo en la parte
superior del Inspector, y el Apdex del HUD debe volver a su objetivo.
