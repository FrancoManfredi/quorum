---
title: Comprobaciones de estado y failover
summary: Sondea cada servidor y deja de enviarle tráfico cuando deja de responder, y pasa a un standby cuando cae una zona entera.
section: patterns
group: Resilience
order: 509
aliases: health check, failover, standby, liveness, readiness, multi-az, zone, deep check, comprobación de estado, zona, comprobación profunda
---

Una comprobación de estado encuentra un servidor caído antes que los usuarios, y el failover traslada su trabajo a otro sitio.

## Cuándo usarlo

- Varias copias de un servicio están detrás de un balanceador de carga, y una puede morir sin que nadie lo note.
- Un almacén de datos único tiene un reemplazo esperando en otra zona.
- La detección lenta está costando errores, y puedes verlos en el hueco entre un fallo y la primera respuesta sana.

## Cómo funciona

El balanceador de carga llama a un endpoint de cada servidor a un intervalo fijo. Un servidor que falla se queda fuera de la rotación hasta que vuelve a pasar la comprobación. Una comprobación superficial solo pregunta si el proceso está activo. Una comprobación profunda también pregunta si su base de datos responde, lo que detecta un servidor que está vivo pero es inútil. El intervalo fija el coste de un fallo: un intervalo de 30 segundos deja a un servidor caído en rotación hasta 30 segundos. El failover de datos funciona igual, con un standby que toma el relevo cuando el primario deja de responder.

## Qué cuesta

Un intervalo corto añade carga de sondeo, y una comprobación profunda puede sacar a todos los servidores a la vez cuando la base de datos compartida da un tropiezo. Un standby es una segunda máquina que pagas y rara vez usas, y un failover que nunca se ha probado a menudo no funciona. Mantén las comprobaciones baratas y haz que el fallo de la propia comprobación sea seguro.

## En Quorum

::Design{id="lb-health-checks"}

Dos ajustes del Balanceador de carga acortan la brecha. **Health check interval** fija lo pronto que nota un servidor caído, y **Deep health check** también retira los Servidores de aplicaciones cuya Base de datos está caída o sobrecargada. Ambos necesitan [Comprobaciones de estado](/research/health-checks), y la comprobación profunda necesita además la tarea del endpoint de comprobación de estado hecha por el equipo. Los dos Servidores de aplicaciones están en distintas **Zonas**, y la Base de datos tiene un **Standby**, que toma el relevo en segundos cuando falla su zona y duplica el Gasto de ese Nodo. Las zonas y los standbys necesitan [Múltiples zonas](/research/multi-az). El incidente [Caída de zona](/incidents/zone) pone a prueba este Diseño. El glosario define la [comprobación de estado](/glossary/health-check) y la [zona de disponibilidad](/glossary/availability-zone).
