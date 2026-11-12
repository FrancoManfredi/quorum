---
title: Infraestructura como código y GitOps
summary: Describe tu infraestructura en archivos y aplícala desde el control de versiones, para que cada entorno sea igual y cada cambio tenga un historial.
section: patterns
group: Deploys and change
order: 605
aliases: iac, terraform, pulumi, drift, gitops, mirror, declarative, reconcile, infraestructura como código, deriva, espejo, declarativo, reconciliar
---

La infraestructura como código mantiene la infraestructura en archivos revisados, y GitOps hace del repositorio el único lugar desde el que se aplican los cambios.

## Cuándo usarla

- Operas más de un entorno o región y deben coincidir.
- Los clics manuales en la consola han causado caídas que nadie sabe explicar.
- Necesitas reconstruir una región desde cero en un desastre.

## Cómo funciona

Escribes el estado deseado, como tres servidores y una base de datos, en una herramienta como Terraform o Pulumi. La herramienta lo compara con el estado real e imprime un plan: lo que crearía, cambiaría o destruiría. Tú revisas y aplicas el plan. GitOps va un paso más allá: un agente como Argo CD vigila un repositorio Git y mantiene el clúster conforme a él, así que fusionar una pull request es el despliegue. La deriva (drift) es cualquier cambio hecho fuera de los archivos, y el agente lo revierte o lo informa.

## Qué cuesta

Un mal cambio en el repositorio llega a todos los entornos que lo siguen, y rápido. Los despliegues escalonados, con una región primero, lo limitan. Los archivos de estado y las credenciales son sensibles, y un plan que nadie lee no es ninguna revisión. Los arreglos manuales durante un incidente crean deriva que debes limpiar después.

## En Quorum

El juego no tiene ajuste de Nodo ni de Enlace para esto, así que no hay Diseño. [Infraestructura como código](/research/infra-as-code) te permite elegir una herramienta de IaC y construir un Espejo de una región en otra región, y luego aplicar planes para mantenerlo sincronizado. La herramienta fija cómo un plan encuentra los cambios manuales. [GitOps](/research/gitops) sincroniza los Espejos por sí solo, todos a la vez o de forma escalonada. El incidente [Push de configuración defectuoso](/incidents/config) muestra por qué importa el escalonado. El glosario define [Espejo](/glossary/mirror), [deriva](/glossary/drift), [herramienta de IaC](/glossary/iac-tool) y [GitOps](/glossary/gitops).
