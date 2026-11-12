---
title: Señales doradas, RED y USE
summary: Vigila cuatro cosas en cada servicio, latencia, tráfico, errores y saturación, y comprueba tres más en cada recurso, para que un panel responda "qué está roto" antes de que nadie abra un log.
section: patterns
group: Operate and observe
order: 701
aliases: golden signals, four golden signals, red method, use method, monitoring, metrics, dashboard, saturation, señales doradas, cuatro señales doradas, método RED, método USE, monitorización, métricas, panel, saturación
---

Elige un conjunto pequeño y fijo de señales para cada servicio y cada recurso, para que una caída empiece con una gráfica y no con una conjetura.

## Cuándo usarlo

- Una alerta dice "algo va lento" y nadie sabe dónde mirar primero.
- Cada equipo grafica un conjunto distinto de números, así que no hay dos paneles comparables.
- Añades un servicio y necesitas un panel por defecto desde el primer día.

## Cómo funciona

El libro de SRE de Google nombra cuatro señales doradas: **latencia**, **tráfico**, **errores** y **saturación**. El **método RED** de Tom Wilkie conserva las tres primeras para cada servicio basado en peticiones: tasa, errores y duración (rate, errors, duration). El **método USE** de Brendan Gregg cubre cada recurso, como una CPU, un disco o un pool de conexiones: utilización, saturación y errores.

Usa RED para lo que llaman los usuarios y USE para aquello sobre lo que corre esa llamada. Un servicio de pagos con un 2% de errores y un p99 en aumento (RED) con su pool de base de datos a plena utilización y una lista de espera creciente (USE) apunta directamente al pool.

Divide la latencia por resultado. Un error rápido se esconde en un promedio, así que una petición fallida y una exitosa pertenecen a líneas distintas.

## Qué cuesta

Cada señal es una serie que alguien almacena y por la que alguien recibe avisos. Alerta sobre los síntomas que sienten los usuarios, como errores y latencia, y deja las señales de causa como la CPU en el panel. Avisar cuando la CPU llega al 80% despierta a la gente por máquinas que están bien.

## En Quorum

El Panel se abre con [Métricas](/research/metrics), y sus primeras filas grafican las cuatro señales doradas: tráfico, latencia, errores y saturación. [Trazado distribuido](/research/tracing) añade una fila de Servicios, que es RED para cada tipo de petición, y [Profiling continuo](/research/profiling) llena una fila de Recursos, que es USE para cada Nodo. [Percentiles](/research/percentiles) pone el p99 junto a la media, y [Alertas](/research/alerting) avisa por errores, latencia, saturación, antigüedad de la cola o consumo del presupuesto. [Conocimiento y observabilidad](/explanation/observability) explica cada una, y [Leer el p99](/guides/read-p99) muestra cómo perseguir una cola. El glosario define las [cuatro señales doradas](/glossary/four-golden-signals), el [método RED](/glossary/red-method) y el [método USE](/glossary/use-method).
