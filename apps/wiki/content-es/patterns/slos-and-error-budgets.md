---
title: SLO y presupuestos de error
summary: Elige un objetivo de fiabilidad que los usuarios notarían, trata los fallos que permite como un presupuesto, y deja que el presupuesto restante decida si publicar o reforzar.
section: patterns
group: Operate and observe
order: 702
aliases: slo, sla, sli, error budget, burn rate, reliability target, availability target, presupuesto de error, tasa de consumo, objetivo de fiabilidad, objetivo de disponibilidad
---

Un SLO indica lo fiable que debe ser un servicio, y el presupuesto de error es la falta de fiabilidad que ese objetivo todavía permite.

## Cuándo usarlo

- Producto quiere funcionalidades, operaciones quiere estabilidad, y ninguno tiene un número con el que discutir.
- Las caídas son tan raras que nadie puede decir si el servicio es "suficientemente bueno".
- Necesitas decidir si un despliegue arriesgado puede salir esta semana.

## Cómo funciona

Un **SLI** es una proporción medida, como la parte de peticiones respondidas en menos de 300 ms sin error. El **SLO** es el objetivo para él en una ventana, digamos 99.9% en 28 días. El **SLA** es el contrato con penalizaciones, y debería ser más laxo que el SLO.

Un objetivo del 99.9% en 30 días permite 43 minutos de caída total, o la misma proporción de peticiones fallidas repartidas. Esa holgura es el presupuesto. Mientras quede mucho, publica más rápido. Cuando se agota, congela los cambios arriesgados hasta que el servicio se recupere.

Alerta sobre la **tasa de consumo**, la proporción de peticiones que fallan frente a la que permite el SLO. Una tasa de 1 gasta el presupuesto justo al final de la ventana. El workbook de Google SRE avisa con 14.4 durante una hora, lo que quema el 2% de un presupuesto de 30 días.

## Qué cuesta

Cada nueve extra cuesta mucho más que el anterior, porque significa eliminar causas que eran lo bastante raras como para ignorarlas. Un objetivo más estricto de lo que los usuarios pueden notar desperdicia dinero, y uno laxo deja que la calidad se deteriore sin que nadie lo note. Contar todas las peticiones por igual es el error habitual, ya que un pago fallido importa más que un avatar fallido.

## En Quorum

El juego mantiene un SLO para cada Era y lo mide por semana de calendario. [Cuadros de mando de SLO](/research/slo-dashboards) pone el presupuesto en el HUD, y [Presupuestos de error](/research/error-budgets) lo vincula al Equipo: el presupuesto que queda acelera las Funcionalidades, y un presupuesto agotado las frena. Un usuario real al que bloquea el WAF no gasta el presupuesto. Fija una regla de [Alertas](/research/alerting) sobre el consumo del presupuesto. El glosario tiene [SLO, SLA, SLI](/glossary/slo-sla-sli), [presupuesto de error](/glossary/error-budget) y [tasa de consumo](/glossary/burn-rate), y [Conocimiento y observabilidad](/explanation/observability) cubre el Cuadro de mando.
