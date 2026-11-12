---
title: Logs, métricas y trazas
summary: Conecta los Nodos a Analítica e investiga la línea de visibilidad, para ver la causa de los errores, el historial y el salto lento de cada petición en lugar de adivinar.
section: patterns
group: Scaling steps
order: 128
aliases: observability, logging, metrics, tracing, opentelemetry, sampling, tail sampling, p99, dashboards, retention, observabilidad, registros, métricas, trazas, muestreo, cuadros de mando, retención
---

Conecta cada Nodo a Analítica y añade las investigaciones que muestran los errores por causa, el historial, los percentiles y las trazas por salto.

## Cuándo dar el paso

- El p99 sube y no sabes decir qué salto lo causó.
- Los errores parecen un solo número, sin una causa detrás.
- No distingues un Nodo que falla de uno lento sin abrir cada tarjeta.

## El Diseño

::Design{id="logs-metrics-traces"}

El tráfico pasa por el Balanceador de carga, el Servidor de aplicaciones y la Base de datos. Analítica recibe una copia por Enlace y la muestrea. Ella misma no transporta tráfico.

## Por qué funciona

Los logs muestran los errores divididos por causa. Las métricas añaden gráficas de historial y el Cuadro de mando. Los percentiles muestran p50, p95 y p99 junto a la media. El trazado nombra el salto más lento de cada tipo de petición, y para investigarlo hace falta muestrear cada tipo en varios tipos de Componente distintos, así que enlaza Nodos de tipos diferentes.

Una tasa de muestreo más baja mantiene bajos la CPU y la latencia en los saltos conectados, y una más alta da más Conocimiento. El muestreo de cola conserva las trazas lentas y fallidas, así que obtiene más Conocimiento de fallos de los mismos fallos. La retención fija cuánto tiempo se conservan las trazas.

## Qué cuesta

El muestreo añade CPU y latencia a cada Nodo conectado y Gasto de almacenamiento a Analítica. Las muestras que superan su capacidad se descartan de forma uniforme, así que dimensiónala para la tasa que fijes. Los trazadores reales cuestan igual y usan el muestreo por la misma razón. El juego no tiene un almacén de logs aparte para el texto de la aplicación, así que Analítica es el único lugar donde el Tablero muestra lo que ve.

## En Quorum

Coloca [Analítica](/components/analytics) y enlaza Nodos a ella. Investiga [Logs estructurados](/research/logs), [Métricas](/research/metrics), [Percentiles](/research/percentiles), [Trazado distribuido](/research/tracing) y [Muestreo de cola](/research/tail-sampling). Lee [Conocimiento y observabilidad](/explanation/observability) y [trazabilidad distribuida](/glossary/distributed-tracing). El siguiente paso, [servicios con una malla](/patterns/split-into-services-with-a-mesh), necesita esta visibilidad para poder depurarse.
