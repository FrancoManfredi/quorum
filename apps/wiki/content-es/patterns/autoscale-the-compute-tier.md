---
title: Autoescalar el nivel de cómputo
summary: Enlaza los Servidores de aplicaciones con un Autoescalador para que el número de copias siga a la carga, dentro de un mínimo y un tope que tú eliges.
section: patterns
group: Scaling steps
order: 119
aliases: auto scaling group, hpa, scale out, scale in, cooldown, target tracking, elastic, autoescalado, escalar hacia fuera, escalar hacia dentro, enfriamiento, elástico
---

Deja que un Autoescalador añada y quite copias del Servidor de aplicaciones según cambia la carga, en lugar de dimensionar para la peor hora.

## Cuándo dar el paso

- La demanda oscila a lo largo del día, y o pagas copias ociosas por la noche o vas al límite en la hora punta.
- Añades copias a mano después de cada pico.
- Un pico hace daño antes de que una persona pueda reaccionar.

## El Diseño

::Design{id="autoscaled-servers"}

Los Usuarios pasan por un Balanceador de carga hasta el Servidor de aplicaciones, que llama a la Base de datos. El Servidor de aplicaciones también se enlaza con el Autoescalador. Ningún tráfico pasa por el Autoescalador. Este vigila su **Señal**, la compara con el objetivo y cambia el número de copias.

## Por qué funciona

Cuando el Nodo funciona por encima del objetivo, el Autoescalador pide más copias, y cuando está muy por debajo, devuelve una. La **Señal** debe encajar con el runtime. La CPU interpreta mal un runtime que espera por E/S, porque sus slots de worker se llenan mientras la CPU sigue baja. La tasa de peticiones sigue al tráfico sea cual sea el runtime, y la profundidad de la cola va bien para un Worker. **Copias mínimas** mantiene el servicio en pie mientras arranca una copia nueva, y **Copias máximas** es la protección de coste.

## Qué cuesta

Las copias nuevas no son instantáneas. Una VM tarda minutos en arrancar, así que un pico repentino hace daño antes de que lleguen las copias, y las copias nuevas empiezan en frío. Más copias envían más conexiones y consultas a la Base de datos, así que esta necesita margen, y quizá siga un [pooler](/patterns/pooler-between-servers-and-database). Un escalador sin tope puede convertir un bug en una factura enorme.

## En Quorum

Coloca un [Autoescalador](/components/autoscaler) después de [Autoescalado](/research/autoscaling), y pon las copias detrás de un [Balanceador de carga](/components/lb). El [Escalado programado](/research/scheduled-scaling) aprovisiona antes de un pico conocido. El patrón está en [Autoescalado](/patterns/autoscaling-reactive-and-scheduled), y [Sobrevivir a un pico de tráfico](/guides/survive-a-traffic-spike) lo usa. El siguiente paso mantiene sincronizadas las copias de los datos: [Transmite los cambios con CDC](/patterns/stream-changes-with-cdc).
