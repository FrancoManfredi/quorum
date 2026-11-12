---
title: Cómo funcionan los incidentes
summary: Cómo el director de incidentes elige qué se rompe, por qué apunta a tu punto más débil y cómo los postmortems, los presupuestos de error y los parches de seguridad conectan los incidentes con tu Diseño.
section: explanation
order: 11
era: 1
aliases: incidents, incident director, severity, sev1, sev2, sev3, escalation, postmortem, action item, mttr, error budget, slo, cve, patch, breach, outage, incidentes, director de incidentes, severidad, escalada, elemento de acción, presupuesto de error, parche, brecha, caída
gdd: /design/11-incidents
---

Un incidente es una prueba de tu Diseño, y se califica por lo que construiste antes de que empezara. Cada uno
es una clase real de caída. Un Diseño bien construido sobrevive a la mayoría sin que hagas nada, y uno frágil
te muestra exactamente dónde es frágil.

## Cuándo empiezan los incidentes

El Garaje no tiene incidentes. Empiezan en Pre-semilla, poco después de que aceptes o rechaces la ronda.
Después, el director espera un tiempo aleatorio alrededor del intervalo de la Era antes de iniciar el
siguiente, y solo hay un incidente en curso a la vez.

El reloj se detiene cuando la Empresa está cerrada, así que no empieza ningún incidente mientras estás fuera.
Cuando la abres de nuevo, el director continúa desde el mismo Paso.

## El director apunta a tus debilidades

El director prefiere el incidente que más dañaría tu Diseño. Cada tipo de incidente recibe un peso según lo
fuerte que golpearía a tu Diseño actual:

```latex
\begin{aligned}
\text{weight} &= \text{weakness} \times \left(1 + \text{tech debt}\right) \times \text{repeat} \times \text{open action item} \\ &\quad \times \text{Mutators}
\end{aligned}
```

- **La debilidad** es 0 cuando el Diseño no tiene nada que el incidente pueda golpear. Si no, va de 0.2 a 3.
  Un Fallo de instancia pesa 3 en un Nodo sin segunda copia, y mucho menos en Nodos que la tienen. Una
  Tormenta de reintentos pesa más cuando los Enlaces reintentan contra una Base de datos sin backoff.
- **La deuda técnica** hace más probable cualquier incidente.
- **La repetición.** El tipo que se ejecutó por última vez es menos probable que se repita.
- **Los elementos de acción abiertos** duplican el peso de un incidente (mira más abajo).

Así que el director funciona como un profesor. Encuentra el punto débil de tu Diseño y deja de golpearlo
cuando lo arreglas. Cuatro incidentes se saltan esta ponderación: un [Despliegue defectuoso](/incidents/bad-deploy)
solo viene de un despliegue, una Brecha de datos solo viene de un parche de seguridad que dejaste pasar, un
Simulacro de DR solo llega cuando tú lo ejecutas, y una Fuga de credenciales solo llega cuando actúas sobre
un Correo de phishing.

## Severidad y escalada

Cada incidente tiene una severidad:

- **SEV3** golpea un Nodo o un tipo de petición.
- **SEV2** golpea un servicio o una zona.
- **SEV1** golpea a toda la Empresa o a una región.

Cada Era limita la peor severidad con la que puede empezar un incidente, así que ninguno empieza en SEV1
antes de la Serie B.

Un incidente puede crecer. A mitad de su duración, si ha dañado a los usuarios durante más de la mitad del
tiempo transcurrido, sube una severidad. Su tiempo restante crece en un 50%, y un Pico de tráfico también
crece en un 50%. Actuar pronto mantiene pequeño un incidente.

## Cuánto dura un incidente

Un incidente sin mitigar termina solo tras un tiempo fijo. Desde la Serie A, los tiempos de los incidentes
siguen el calendario, porque el SLO también lo hace: como máximo 5 minutos de calendario en SEV3, 20 en SEV2
y 60 en SEV1. Un segundo de simulación es un minuto de calendario.

Muchos incidentes terminan antes cuando arreglas la causa. Reemplaza un Nodo caído, añade el índice que
falta, reinicia un servidor con fugas o revierte un despliegue defectuoso. Una Tormenta de reintentos es la
excepción. No tiene reloj, y termina solo cuando se drena el retraso acumulado de la Base de datos lenta.
La página de cada [incidente](/incidents) enumera su solución y su prevención.

:::Note{tone="real"}
Las caídas reales funcionan igual. Un Diseño con capacidad de sobra y copias redundantes pierde poco o nada
con el evento que tumba a un Diseño de una sola caja. El incidente es el disparador, y tu Diseño decide el
daño.
:::

## Postmortems y elementos de acción

Cuando termina un incidente, la Simulación archiva un postmortem sin culpables. Muestra la cronología, los
usuarios y los ingresos perdidos, las peticiones fallidas y el MTTR: los minutos en los que más del 1% de las
peticiones falló. Mira [MTTR](/glossary/mttr).

Un postmortem no paga Conocimiento. Si lo pagara, un Diseño débil que fallara a menudo investigaría más
rápido que uno sólido. En su lugar abre un **elemento de acción**: la primera Investigación de la lista de
prevención del incidente que no tienes y que puedes estudiar ahora. Hasta que la tengas, el director elige
ese incidente el doble de veces, porque una causa raíz sin arreglar vuelve. La ventaja
[Historias de guerra](/prestige#perks) lo suaviza.

Aun así, los fallos te enseñan algo. Las peticiones fallidas y frustradas llenan el pool de Conocimiento de
fallos, que paga la Investigación de Fiabilidad.

## SLOs y el presupuesto de error

Desde la Serie A, cada Era tiene un SLO de disponibilidad, como el 99.9%. La Simulación cuenta las
peticiones y los fallos de tus usuarios durante la última semana de calendario. Los fallos que permite el SLO
son tu [presupuesto de error](/glossary/error-budget):

```latex
\text{error budget} = \left(1 - \text{SLO}\right) \times \text{requests in the last calendar week}
```

Los bots no cuentan, ni tampoco los usuarios reales que bloqueó el WAF, porque un bloqueo es un error del
cliente y no un fallo al responder. El presupuesto cuenta peticiones fallidas, no tiempo de reloj, así que
una caída parcial gasta un presupuesto parcial.

Tras la investigación [Presupuestos de error](/research/error-budgets), el presupuesto cambia la velocidad de
tu equipo. Con más de la mitad disponible, los equipos trabajan un 10% más rápido. Cuando se agota,
trabajan a media velocidad hasta que se recupera. Los [Cuadros de mando de SLO](/research/slo-dashboards)
ponen el presupuesto en el HUD. Mira [SLO, SLA y SLI](/glossary/slo-sla-sli).

:::Note{tone="real"}
Esta es la política de presupuesto de error del libro de SRE de Google. Un equipo con presupuesto de sobra
puede asumir riesgos y publicar rápido, y un equipo que lo gastó va más despacio y arregla primero la
fiabilidad.
:::

## Parches de seguridad

Desde Pre-semilla, se divulga cada pocos minutos una vulnerabilidad en software que ejecuta tu Diseño. Cada
una pone un ticket de parche al final de tu backlog, con un plazo. Una puntuación más alta significa un plazo
más corto y un parche más grande. Sube el ticket en la lista o acelera su entrega con Horas de desarrollo del pool,
porque si sigue vencido pasada una breve gracia, la vulnerabilidad se explota. Empieza una Brecha de datos y
el 15% de tus usuarios se va de golpe.

## Páginas relacionadas

- [Tu primer incidente](/tutorials/first-incident) te guía por uno.
- [Detener una tormenta de reintentos](/guides/stop-a-retry-storm) y
  [Sobrevivir a un pico de tráfico](/guides/survive-a-traffic-spike) tratan los más difíciles.
- [Errores y reintentos](/explanation/errors-and-retries) explica por qué los reintentos empeoran la
  sobrecarga.
