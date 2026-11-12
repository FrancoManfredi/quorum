---
title: Disponibilidad y los nueves
summary: Cada nueve extra de disponibilidad reduce a una décima parte el tiempo de caída permitido, y cada dependencia dura de una cadena baja el total.
section: patterns
group: Foundations
order: 11
aliases: availability, nines, uptime, 99.9, 99.99, downtime, sla, slo, redundancy, disponibilidad, nueves, tiempo de actividad, tiempo de caída, redundancia
---

La disponibilidad es la parte del tiempo, o de las peticiones, en que un servicio responde correctamente, y se expresa en nueves. El libro de SRE de Google tabula lo que permite cada nivel:

| Disponibilidad | Caída al año | Caída al mes  |
| -------------- | ------------ | ------------- |
| 99%            | 3.65 días    | 7.2 horas     |
| 99.9%          | 8.76 horas   | 43.2 minutos  |
| 99.99%         | 52.6 minutos | 4.32 minutos  |
| 99.999%        | 5.26 minutos | 25.9 segundos |

Un objetivo de 99.99% te da unos cuatro minutos al mes. Un despliegue lento que tumbe el sitio durante diez minutos gasta más de dos meses de esa cuota.

## Las cadenas multiplican

Cuando una petición necesita el servicio A, el servicio B y una base de datos, los tres deben estar activos, así que multiplicas sus disponibilidades. Tres componentes al 99.9% cada uno dan 0.999 × 0.999 × 0.999, que es 99.7%, o unas 26 horas de caída al año. La cadena siempre es peor que su eslabón más débil.

La redundancia funciona al revés. Dos copias independientes al 99% solo fallan a la vez cuando ambas están caídas, lo que ocurre 0.01 × 0.01 = 0.0001 del tiempo, así que el par tiene una disponibilidad del 99.99%. La palabra "independientes" carga con toda la afirmación. Dos copias en un mismo rack, o dos que comparten un push de configuración, fallan juntas y no te dan nada.

## Qué cambia en un diseño

Elige el objetivo según lo que necesitan los usuarios y lo que puedes pagar, y trabaja hacia atrás. Cada nueve cuesta más o menos un orden de magnitud más de esfuerzo, así que un sitio de aficionados no necesita cuatro. Una tienda que pierde dinero por minuto quizá sí.

Saca las dependencias duras del camino de la petición. Si una llamada de recomendaciones al 99.5% va delante de cada página, la página no puede superar el 99.5% a menos que pueda saltarse la llamada ([Degradación elegante](/patterns/graceful-degradation)). Reparte las copias entre dominios de fallo, y detecta una copia caída lo bastante rápido para que el par se comporte de verdad como dice la fórmula ([Comprobaciones de estado y failover](/patterns/health-checks-and-failover)).

La diferencia entre tu objetivo y el 100% es un presupuesto de error, los fallos que puedes gastar en lanzamientos y experimentos ([SLO y presupuestos de error](/patterns/slos-and-error-budgets)).

## En Quorum

Cada Era fija un [SLO](/glossary/slo-sla-sli), y los fallos que permite son tu [presupuesto de error](/glossary/error-budget). Colocar copias en distintas [Zonas](/glossary/availability-zone) requiere la Investigación [Múltiples zonas](/research/multi-az), e [Incidentes](/explanation/incidents) explica cómo elige el juego los fallos que ponen a prueba el eslabón débil de tu Diseño.
