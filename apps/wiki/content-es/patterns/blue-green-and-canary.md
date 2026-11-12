---
title: Despliegues blue-green y canario
summary: Lanza una versión nueva junto a la vieja, o primero a unos pocos usuarios, para que un mal lanzamiento llegue a poca gente y se revierta rápido.
section: patterns
group: Deploys and change
order: 602
aliases: blue green, canary, rolling deploy, rollback, deployment strategy, release, despliegue canario, despliegue progresivo, reversión, estrategia de despliegue, lanzamiento
---

Los despliegues blue-green y canario limitan cuántos usuarios puede dañar un mal lanzamiento.

## Cuándo usarlo

- Un mal despliegue dañaría a muchos usuarios, y quieres acotar cuántos.
- Puedes ejecutar dos versiones a la vez y enrutar el tráfico entre ellas.
- Tienes métricas que te dicen en minutos si la versión nueva es peor.

## Cómo funciona

Blue-green ejecuta dos flotas completas. Blue atiende a los usuarios mientras green arranca con la versión nueva y se comprueba. Entonces el enrutador pasa a green, y volver atrás es la reversión. Un canario envía primero una pequeña parte del tráfico real, digamos el 2%, a la versión nueva. Si los errores y la latencia aguantan durante un tiempo fijado, la parte crece en pasos hasta llegar al 100%. Blue-green es simple y revierte al instante. Un canario tiene el alcance más pequeño y el despliegue más lento.

## Qué cuesta

Blue-green duplica el cómputo durante el despliegue, y ambas versiones deben funcionar con la misma base de datos, lo que lleva a [expand and contract](/patterns/expand-and-contract). Un canario necesita buenas métricas y suficiente tráfico en su porción para mostrar un problema. Los despliegues progresivos (rolling) que reemplazan unos pocos servidores cada vez cuestan menos y protegen menos.

## En Quorum

::Design{id="deploy-blue-green"}

La estrategia es un ajuste de un Pipeline de CI/CD: Recreate, Rolling, Blue-green o Canary. Recreate y Rolling vienen con el Pipeline, y Blue-green y Canary necesitan cada uno su investigación. Blue-green mantiene sirviendo a la flota vieja, así que un mal despliegue rompe solo una porción de las peticiones, pero despliega más despacio y factura más. El Pipeline no transporta tráfico, así que el pie de imagen es igual en todas las estrategias. La diferencia se ve durante un [Despliegue defectuoso](/incidents/bad-deploy).

::Design{id="deploy-canary"}

Un canario envía primero una pequeña parte del tráfico, así que un mal despliegue tiene su alcance mínimo. También es la estrategia más lenta de lanzar. Blue-green necesita [Despliegues blue-green](/research/blue-green), y el canario necesita [Despliegues canario](/research/canary), que a su vez necesita [Percentiles](/research/percentiles). Ambos necesitan [Entrega continua](/research/ci). El glosario define el [despliegue blue-green](/glossary/blue-green-deployment) y el [despliegue canario](/glossary/canary-deployment).
