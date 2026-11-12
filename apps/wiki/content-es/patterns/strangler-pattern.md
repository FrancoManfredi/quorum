---
title: Patrón strangler
summary: Reemplaza un sistema antiguo pieza a pieza tras una única puerta de entrada, para que el nuevo tome el relevo sin una reescritura de golpe.
section: patterns
group: Deploys and change
order: 604
aliases: strangler fig, strangler, incremental migration, rewrite, legacy, migration, higuera estranguladora, migración incremental, reescritura, legado, migración
---

El patrón strangler traslada el tráfico de un sistema antiguo a uno nuevo por porciones, hasta que el antiguo ya no tiene nada que servir.

## Cuándo usarlo

- Una reescritura llevaría un año, y el negocio no puede esperar a que termine.
- Puedes poner un router o un proxy delante del sistema antiguo.
- Se pueden reemplazar partes del sistema antiguo de una en una, como una ruta de URL.

## Cómo funciona

Un router se sitúa delante de ambos sistemas. Al principio, todo va al antiguo. Construyes una porción en el sistema nuevo, envías allí una pequeña parte de su tráfico, comparas resultados y haces crecer esa parte. Cuando una porción llega al 100%, borras su código antiguo. El nombre viene de la imagen de Martin Fowler de una higuera estranguladora creciendo alrededor de un árbol.

## Qué cuesta

Ambos sistemas funcionan durante mucho tiempo, así que pagas por los dos y mantienes sus datos sincronizados. El router se convierte en una pieza crítica. Los equipos suelen atascarse a mitad de camino con dos sistemas a medio usar, así que fija una fecha final y borra el código antiguo a medida que terminan las porciones.

## En Quorum

El juego enseña esto como una migración de Stack, no como un ajuste de Nodo, así que no tiene Diseño. Cambiar el Stack de un Servicio cuesta horas de desarrollo, y luego traslada sus Servidores de aplicaciones por etapas mientras corren ambas versiones. Cada servidor trasladado revela bugs hasta que el equipo publica un arreglo, y las Funcionalidades del Servicio se construyen más despacio durante la migración. Mira [Elegir un stack](/guides/choose-a-stack) y [Equipos y velocidad](/explanation/team-and-velocity). El glosario define el [patrón strangler](/glossary/strangler-pattern).
