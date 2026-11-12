---
title: Ingeniería del caos
summary: Rompe tu propio sistema en un horario y bajo vigilancia, para encontrar el eslabón débil antes de que lo haga una caída.
section: patterns
group: Resilience
order: 510
aliases: chaos, chaos monkey, fault injection, game day, failure experiment, caos, ingeniería del caos, inyección de fallos, día de simulacro, experimento de fallos
---

La ingeniería del caos (chaos engineering) provoca fallos pequeños y planificados en un sistema vivo para comprobar que los supera.

## Cuándo usarlo

- Crees que un failover, un reintento o un plan alternativo funciona, pero nunca lo has visto en marcha.
- El sistema es lo bastante estable como para que un fallo pequeño te enseñe algo, y no solo cause una caída.
- Los paneles y las alertas son lo bastante buenos para mostrar lo que hizo el experimento.

## Cómo funciona

Define cómo es lo normal, por ejemplo una tasa de errores por debajo del 1%. Elige un fallo, como una instancia terminada o 300 ms de latencia añadidos. Ejecútalo contra una pequeña parte del tráfico, vigila la misma medida y detente si pasa un límite. Si lo normal se mantuvo, confirmaste una defensa. Si no, encontraste una brecha y la arreglaste una tarde tranquila. Chaos Monkey, de Netflix, empezó así, terminando instancias al azar en producción.

## Qué cuesta

Los usuarios reales pueden notar un experimento, así que empieza pequeño, en staging o en una porción, y ten un botón de parada. Un equipo sin runbooks ni guardias no le saca partido, porque solo produce fallos que nadie sabe atender. El error es hacer caos sin una hipótesis, que es simplemente romper cosas.

## En Quorum

El juego no tiene ajuste de Nodo ni de Enlace para esto, así que no hay Diseño. [Ingeniería del caos](/research/chaos-engineering) necesita [Runbooks](/research/runbooks) y desbloquea un interruptor para toda la Empresa. Mientras está activado, el juego hace fallar periódicamente una parte de las llamadas del Nodo más débil durante unos segundos y lo nombra, y el experimento gana Conocimiento de fallos. No se ejecuta en un Sandbox. El incidente [Split brain](/incidents/split-brain) enumera los experimentos de caos como su prevención. El glosario define [ingeniería del caos](/glossary/chaos-engineering) y [radio de impacto](/glossary/blast-radius).
