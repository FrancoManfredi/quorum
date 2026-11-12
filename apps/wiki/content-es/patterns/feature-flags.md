---
title: Feature flags
summary: Pon una funcionalidad nueva detrás de un interruptor que puedes subir o bajar en tiempo de ejecución, para que desplegar el código y lanzarlo sean pasos distintos.
section: patterns
group: Deploys and change
order: 603
aliases: feature flag, toggle, dark launch, rollout, kill switch, percentage rollout, interruptor de funcionalidad, lanzamiento oculto, despliegue gradual, lanzamiento por porcentaje
---

Un feature flag decide en tiempo de ejecución quién ve una funcionalidad, así que puedes lanzar sin desplegar y deshacer sin una reversión.

## Cuándo usarlo

- Una funcionalidad es arriesgada, y quieres mostrarla al 2% de los usuarios antes que a todos.
- Quieres un kill switch para una dependencia o una ruta costosa.
- Despliegas a menudo y terminas las funcionalidades a lo largo de varios lanzamientos.

## Cómo funciona

El código se lanza con la funcionalidad apagada. Un servicio de flags responde "¿está activa para este usuario?" a partir de una regla, como un porcentaje o una lista. Subes la proporción en pasos mientras vigilas los errores, y quitas el flag cuando la funcionalidad está al 100%. Si algo se rompe, apagas el flag en segundos y no hace falta un build nuevo. Un mal despliegue de una funcionalidad con flag solo llega a los usuarios que la tienen.

## Qué cuesta

Cada flag es una rama que hay que probar de ambas formas, y los flags viejos se acumulan como código muerto. La caída del servicio de flags necesita un valor por defecto seguro. Los flags también dejan que los equipos lancen trabajo a medio hacer, así que fija un responsable y una fecha de retirada para cada uno.

## En Quorum

::Design{id="feature-flag-rollout"}

Los Feature flags y el Pipeline de CI/CD no transportan tráfico, así que este Diseño no tiene tabla de ajustes: lo importante son los Nodos. Una vez lanzada una Funcionalidad, el Nodo de Feature flags te permite fijar su despliegue en apagado, o en una de unas pocas proporciones de usuarios, y un mal despliegue de ella solo llega a esa proporción. Una Funcionalidad apagada sigue pagando su mantenimiento hasta que la retiras. [Feature flags](/research/feature-flags) necesita [Entrega continua](/research/ci). La [Degradación elegante](/patterns/graceful-degradation) se apoya en él. El glosario define el [feature flag](/glossary/feature-flag).
