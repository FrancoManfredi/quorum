---
title: Conocimiento y observabilidad
summary: Cómo el Nodo de Analítica convierte el tráfico muestreado en Conocimiento, qué cuesta el muestreo y cómo la Investigación de observabilidad cambia lo que puedes ver.
section: explanation
order: 12
aliases: insight, observability, monitor, monitoring, analytics, sample rate, sampling, retention, visibility, logs, metrics, percentiles, alerting, alert fatigue, dashboard, tracing, failure insight, conocimiento, observabilidad, monitorización, analítica, tasa de muestreo, muestreo, retención, visibilidad, alertas, fatiga de alertas, cuadro de mando, trazado, conocimiento de fallos
gdd: /design/12-observability
---

Empiezas Quorum casi a ciegas, como una startup incipiente. Ves barras de carga, tasas de peticiones, una
latencia media y un solo número de errores. La observabilidad hace aquí dos trabajos. Produce Conocimiento,
la moneda que compra Investigación, y la Investigación de observabilidad decide cuánto de tu sistema puedes
ver.

## La Analítica muestrea tu tráfico

El Nodo de [Analítica](/components/analytics) es una toma. Enlaza cualquier Nodo a ella, y muestrea el
tráfico de ese Nodo. Cada muestra tiene un tipo de petición y suma Conocimiento al pool de ese tipo, y las
peticiones fallidas o frustradas suman además al pool de Fallos.
[Eras e Investigación](/explanation/progression) explica por qué el Conocimiento viene en tipos.

El rendimiento sigue una raíz cuadrada:

```latex
\begin{aligned}
\text{Insight} \left(\text{kind}\right) &= \sum_{\text{over Component types}} \sqrt{\text{sampled requests of that kind per second}} \\
\text{Failure} &= 3 \times \sum_{\text{over Component types}} \sqrt{\text{sampled failed requests per second}}
\end{aligned}
```

De la raíz cuadrada se desprenden dos reglas:

- **La amplitud supera al tamaño.** Cuatro veces el tráfico da solo el doble de Conocimiento, pero cada tipo
  de Componente añade su propio término. Una lectura muestreada en el Balanceador de carga, el Servidor de
  aplicaciones, la Caché y la Base de datos enseña cuatro veces más que una lectura muestreada en un solo
  Nodo.
- **Las copias no cuentan dos veces.** Diez Servidores de aplicaciones forman un solo término, así que
  dividir un Nodo en muchos no enseña nada nuevo.

El pool de Fallos gana tres veces más por muestra, porque un Diseño sano falla rara vez. Una petición que
falla o frustra a su usuario cuenta por completo, y una tolerada cuenta en parte. Fallar a propósito sigue
siendo un mal trato, porque los fallos cuestan usuarios, ingresos y presupuesto de error.

## Ver cuesta algo

La Analítica tiene una capacidad en muestras por segundo, y cada escalón de tamaño la duplica. Las muestras
que la superan se descartan de forma uniforme. Tú eliges la tasa de muestreo: 1%, 5%, 10% (la
predeterminada), 50% o 100%.

Una tasa más alta da más Conocimiento, pero no en proporción. El 100% da cerca del triple de Conocimiento que
el 10%, y cuesta:

- **CPU** en cada Nodo conectado.
- **Latencia** en cada salto conectado, lo que puede bajar el Apdex.
- **Gasto de almacenamiento** en la factura de la Analítica.

La Analítica también guarda trazas durante una ventana de retención: 15 minutos, 1 hora o 6 horas de tiempo
de simulación. Una ventana más larga cuesta más almacenamiento y permite que cada pool de Conocimiento
guarde más. Un pool guarda cerca de una ventana de Conocimiento a tu ritmo actual, así que no puedes ahorrar
un saldo enorme y comprar una Era entera cuando se abre.

:::Note{tone="real"}
Las facturas de observabilidad también sorprenden a los equipos reales. Los sistemas de trazado reales
mantienen ese coste bajo con el muestreo: conservan una parte de las peticiones y aceptan que puedan
perderse los eventos raros.
:::

## La escalera de visibilidad

La Simulación siempre calcula todos los números del Libro mayor, y la Investigación solo cambia lo que
muestra la interfaz. Un jugador sin [Percentiles](/research/percentiles) sigue perdiendo ingresos por las
peticiones lentas, pero no puede ver el p99.

Cada peldaño de la [pista de Observabilidad](/research) te muestra más:

| Investigación                                       | Qué puedes ver                                                                      |
| --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [Logs estructurados](/research/logs)                | Errores divididos por causa, como `stranded`, `dropped`, `refused`, `down` y `oom`. |
| [Métricas](/research/metrics)                       | Gráficas de historial en cada Nodo, y el Cuadro de mando.                           |
| [Percentiles](/research/percentiles)                | p50, p95 y p99 junto a la media.                                                    |
| [Alertas](/research/alerting)                       | Un aviso de guardia cuando los errores, el p99 o la saturación cruzan un umbral.    |
| [Cuadros de mando de SLO](/research/slo-dashboards) | El presupuesto de error en el HUD, y su tasa de consumo en el Cuadro de mando.      |

El [Trazado distribuido](/research/tracing) está en la pista, y otros elementos lo requieren. Añade al Cuadro
de mando las filas de Servicios y Recursos: la tasa, los errores y la duración de cada tipo de petición, y la
utilización, la saturación y el límite de cada Nodo.

::Track{track="observability"}

## Dos herramientas siempre activas

El **marcador de cuello de botella** nombra el Nodo cuya capacidad extra ganaría más. Mantiene el juego
jugable antes de que puedas ver nada más.

El **Desglose de bajas** se abre desde la cifra de Usuarios y enumera las filas que le cuestan su Apdex a
cada región, por tipo de petición y causa. La Investigación añade detalle: con Logs estructurados, un fallo
nombra su causa, y con Percentiles, una fila lenta muestra su p99.
[Usuarios y crecimiento](/explanation/users-and-growth) explica cómo leerlo.

## Alertas y fatiga de alertas

Con Alertas, cinco reglas predeterminadas vigilan tu sistema:

- La tasa de errores se mantiene por encima del 1% durante 30 segundos.
- El p99 de un tipo se mantiene por encima de 4 veces su objetivo de Apdex durante 30 segundos.
- Un Nodo se mantiene por encima del 90% de utilización durante 60 segundos.
- La tarea más antigua de una Cola se mantiene con más de 30 segundos durante 60 segundos.
- El presupuesto de error se consume a más de 10 veces su ritmo uniforme durante 30 segundos, desde la
  Serie A.

Puedes hacer cada regla más o menos sensible. Una alerta que salta sin ningún incidente detrás es una falsa
alarma, y tras 5 falsas alarmas en un día de calendario la regla se marca como ignorada y deja de avisarte.
Esto es la fatiga de alertas, y los equipos reales también la sufren: la gente a la que avisan por nada deja
de mirar. Ajusta una regla ruidosa en lugar de convivir con ella.

## El Cuadro de mando

El Tablero muestra tu sistema ahora, y el Cuadro de mando lo muestra a lo largo del tiempo. Se abre con `D`
después de Métricas. Sus primeras filas grafican las [cuatro señales doradas](/glossary/four-golden-signals):
tráfico, latencia, errores y saturación. Las líneas de las gráficas marcan tus cambios recientes de Diseño y
el inicio de un incidente, para que puedas comprobar que una línea se movió después de tu arreglo y no antes.
Mira la [anotación](/glossary/annotation).

Los rangos largos muestran bloques de tiempo promediados, pero la línea del p99 dibuja el peor minuto de cada
bloque, porque un promedio escondería el pico. Mira el [submuestreo](/glossary/downsampling) y
[Lee el p99](/guides/read-p99).

## Para seguir leyendo

- [Observabilidad](/glossary/observability) en el glosario.
- [Gana Conocimiento e investiga](/tutorials/research-and-insight), un tutorial.
- [Encontrar el cuello de botella](/guides/find-the-bottleneck), una guía.
