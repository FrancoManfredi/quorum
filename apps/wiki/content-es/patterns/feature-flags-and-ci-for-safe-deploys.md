---
title: Feature flags y CI para despliegues seguros
summary: Lanza a través de un pipeline que envía primero un canario, y pon las Funcionalidades nuevas detrás de flags, para que un mal despliegue rompa una parte de los usuarios en lugar de todos.
section: patterns
group: Scaling steps
order: 124
aliases: ci cd, continuous delivery, canary release, rollout, feature toggle, bad deploy, blast radius, deploy strategy, launchdarkly, entrega continua, lanzamiento canario, despliegue progresivo, despliegue defectuoso, radio de impacto, estrategia de despliegue
---

Lanza a través de un Pipeline de CI/CD que despliega de forma gradual, y esconde las Funcionalidades nuevas detrás de flags que puedes apagar con un clic.

## Cuándo dar el paso

- Aparece una barra de **Despliegue defectuoso** y la tasa de errores se dispara para todos los usuarios a la vez.
- Dudas en desplegar porque cualquier cambio puede romper todo el sitio.
- Una Funcionalidad que nadie ha medido ya está activa para todos.

## El Diseño

::Design{id="safe-deploys"}

Los Usuarios, el Servidor de aplicaciones y la Base de datos sirven tráfico como antes. El Pipeline y el Nodo de Feature flags no transportan ninguno. El Pipeline fija cómo llega el código al Servidor de aplicaciones. Los flags fijan a cuántos usuarios llega cada Funcionalidad.

## Por qué funciona

Un mal despliegue hace fallar una parte de las peticiones del Servidor de aplicaciones por cada Funcionalidad que lanzó. La estrategia de despliegue limita esa parte. Recreate cambia todo a la vez y no tiene tope, rolling se detiene tras su primer lote, blue-green mantiene sirviendo a la flota vieja, y un canario envía primero una pequeña porción del tráfico.

Un flag es un segundo techo. Una Funcionalidad con un despliegue pequeño solo puede romper esa parte de los usuarios, sea cual sea la estrategia. Se aplica el menor de los dos techos, así que ni siquiera un despliegue Recreate puede superar a un flag.

## Qué cuesta

Una estrategia más segura tarda más por despliegue y factura más que una rolling simple, porque una segunda flota o las métricas del canario corren a su lado. Un flag no reduce la carga de una Funcionalidad ni su mantenimiento, solo su radio de impacto. Un despliegue también lanza el código que rodea a las Funcionalidades, así que un lote sin ninguna Funcionalidad sigue rompiendo lo equivalente a una. El paso de despliegue se fija por Funcionalidad en la tarjeta del flag, no en un campo del Nodo, así que la tabla solo muestra la estrategia.

## En Quorum

Coloca un [Pipeline de CI/CD](/components/ci) y [Feature flags](/components/ff). Investiga [Entrega continua](/research/ci), [Despliegues canario](/research/canary) y [Feature flags](/research/feature-flags). Canary necesita Percentiles. El incidente [Despliegue defectuoso](/incidents/bad-deploy) es el que esto limita. Lee sobre el [despliegue canario](/glossary/canary-deployment) y los [feature flags](/glossary/feature-flag). El siguiente paso, un [Hub en tiempo real](/patterns/websockets-tier-for-realtime), retiene las conexiones que necesitan las funcionalidades en tiempo real.
