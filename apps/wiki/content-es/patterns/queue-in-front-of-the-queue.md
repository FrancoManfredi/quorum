---
title: Una cola delante de la cola: Slack
summary: Slack puso Kafka delante de Redis, de modo que una ráfaga de trabajos esperaba en un log duradero en lugar de llenar la memoria de la cola.
section: patterns
group: Ran in production
order: 955
aliases: slack, kafka, redis, job queue, background jobs, jqrelay, cola de trabajos, trabajos en segundo plano
---

En 2017, la cola de trabajos de Slack corría sobre Redis, y toda acción que no podía terminar dentro de una petición web pasaba por ella: desplegar la vista previa de un enlace, enviar una notificación, indexar un mensaje. Un clúster de Redis se quedó sin memoria, y la cola no podía aceptar trabajo nuevo. El equipo añadió Kafka delante de Redis en lugar de reemplazarlo.

## El sistema

Un pequeño servicio llamado Kafkagate escribe cada trabajo en Kafka y lo confirma. Un relay sin estado, JQRelay, lee el tema de Kafka y escribe el trabajo en el clúster de Redis que lo ejecuta. El cambio conservó el código existente de planificación y deduplicación y añadió un búfer duradero para las ráfagas. En aquel momento, el sistema movía 1.4 mil millones de trabajos al día en 50 clústeres de Redis y 1,600 particiones de Kafka.

## El tablero

::Design{id="slack-queue-in-front"}

El Flujo de eventos es Kafka: un log duradero que guarda un trabajo después de que la capa web lo haya confirmado. La Cola es Redis, el Worker es el ejecutor de trabajos, y la Base de datos guarda el estado que el trabajo lee y escribe. La capa web solo encola, así que el usuario espera el encolado y no el trabajo.

## Por qué funciona

Los dos saltos hacen trabajos distintos. Kafka absorbe una ráfaga y conserva el trabajo hasta que un consumidor lo lee. Redis guarda el estado de planificación de corta vida que los workers consultan. [El trabajo lento, a una cola y a workers](/patterns/slow-work-to-a-queue-and-workers) y [nivelación de carga con colas](/patterns/queue-load-leveling) describen los dos efectos.

## Hasta dónde llega el juego

El tablero tiene un Flujo de eventos y una Cola, no 50 clústeres de Redis y 1,600 particiones. No muestra JQRelay ni los límites de tasa que lee de Consul. El pie de figura es el resultado de Quorum, no los 1.4 mil millones de trabajos diarios de Slack.

## Fuentes

- [Scaling Slack's Job Queue, Slack Engineering](https://slack.engineering/scaling-slacks-job-queue): el incidente de Redis, Kafkagate, JQRelay y las cifras de escala.
- [Building self-driving Kafka clusters using open source components, Slack Engineering](https://slack.engineering/building-self-driving-kafka-clusters-using-open-source-components): la flota de Kafka, el throughput y el trabajo operativo.
- [Apache Kafka documentation](https://kafka.apache.org/documentation/): particiones, grupos de consumidores y acuses de recibo.
