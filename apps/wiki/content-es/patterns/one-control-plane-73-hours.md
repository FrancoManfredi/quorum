---
title: Un plano de control, 73 horas: Roblox
summary: Un cambio de streaming en Consul bajo carga dejó caído a Roblox durante 73 horas, porque el plano de control era también la vía de los despliegues y de la monitorización.
section: patterns
group: When it broke
order: 970
aliases: roblox, consul, outage, control plane, boltdb, postmortem, 73 hours, caída, plano de control, 73 horas
---

El 28 de octubre de 2021, Roblox estuvo caído durante 73 horas. Una nueva función de streaming de Consul, la capa de descubrimiento de servicios y coordinación, provocó contención bajo carga, y un bug de BoltDB lo empeoró. El plano de control también llevaba los despliegues y la monitorización, así que el equipo no podía ver ni arreglar la caída.

## El sistema

Roblox ejecutaba cientos de servicios internos, y un clúster de Consul daba soporte a varias cargas de trabajo. El día antes de la caída, el equipo activó una nueva función de streaming de Consul 1.10 en un backend de enrutado de tráfico. Con mucha carga, el nuevo protocolo entró en contención, y la lista de páginas libres de BoltDB hizo que las escrituras fueran patológicamente lentas. Los líderes de Consul se quedaron atrás, y el plano de control no podía mantener los servicios consistentes.

## El tablero

::Design{id="roblox-control-plane"}

El Balanceador de carga y el Servidor de aplicaciones son la capa del juego, la Base de datos es el estado, y el Clúster de Kubernetes y el Service mesh son el plano de control. El tablero ejecuta el incidente [Push de configuración defectuoso](/incidents/config) del juego sobre el Servidor de aplicaciones, que representa un cambio del plano de control que llegó a toda la flota.

## Qué se rompió

Un plano de control es una dependencia compartida. Un cambio en él bajo carga puede tumbar todos los servicios que dependen de él, y las vías de monitorización y despliegue quedan dentro del mismo radio de impacto. Roblox perdió visibilidad y la capacidad de desplegar un arreglo mientras el plano de control estaba enfermo. Un solo clúster de Consul para varias cargas de trabajo amplió el impacto. La recuperación llevó 73 horas porque el equipo tuvo que reconstruir el clúster de Consul y la caché, no revertir un solo despliegue.

## Qué cambió

Roblox desactivó la función de streaming, reconstruyó el clúster de Consul, borró datos obsoletos y trabajó con HashiCorp en un sucesor de BoltDB. [GitOps por etapas](/research/gitops) es la protección más cercana: un cambio llega primero a una región. [Bulkhead](/patterns/bulkhead) es la otra: mantén el fallo dentro de una parte.

## Hasta dónde llega el juego

El juego no tiene Consul, así que el Clúster y la Malla representan el plano de control. El incidente de configuración es un push de configuración, no una función de streaming. El tablero no puede mostrar 73 horas, el bug de BoltDB ni la dependencia de la monitorización. El pie de figura es el incidente del juego, no la caída de Roblox.

## Fuentes

- [Roblox Return to Service, Roblox](https://about.roblox.com/newsroom/2022/01/roblox-return-to-service-10-28-10-31-2021): la cronología, el streaming de Consul, el bug de BoltDB y los cambios realizados.
- [An Update on Our Outage, Roblox](https://about.roblox.com/newsroom/2021/11/update-recent-service-outage): el comunicado inicial y la recuperación de 73 horas.
- [Consul architecture, HashiCorp](https://developer.hashicorp.com/consul/docs/architecture): qué hace Consul y por qué un plano de control es una dependencia compartida.
