---
title: Recuperación ante desastres y una región de failover
summary: Haz copia de seguridad del primario, mantén un standby para la pérdida de una zona y un almacén repartido entre regiones para la pérdida de una región, y demuéstralo con un simulacro.
section: patterns
group: Scaling steps
order: 132
aliases: dr, failover, standby, rpo, rto, backups, pitr, region outage, dr drill, restore drill, multi az, recuperación ante desastres, región de failover, copias de seguridad, caída de región, simulacro de DR, simulacro de restauración, multi-AZ
---

Planifica la pérdida de una zona y la pérdida de una región, porque necesitan respuestas distintas.

## Cuándo dar el paso

- Una Caída de región tumba los Nodos de tu región de origen y los Usuarios no tienen adónde ir.
- No puedes decir cuántos datos costaría perder un primario.
- Una copia de seguridad nunca se ha restaurado, así que nadie sabe si funciona.

## El Diseño

::Design{id="failover-region"}

Un Almacén de columnas anchas con **Spread** replica entre las regiones abiertas, así que sigue sirviendo lecturas y aceptando escrituras cuando cae la región de origen. Ambos Servidores de aplicaciones se enlazan con él, y los Usuarios de origen también se enlazan con el Servidor de aplicaciones europeo, de modo que sus peticiones tienen un camino vivo cuando el Servidor de aplicaciones de origen está caído. GeoDNS envía a los Usuarios a la región activa más cercana.

## Por qué funciona

El simulacro hace fallar la región de origen y se supera cuando los errores bajan del 1%. Un almacén que se reparte entre regiones sobrevive, y con un quórum de lectura y escritura de dos, una lectura tras el failover sigue viendo la última escritura. Un primario único no sobrevive: sus escrituras siguen caídas hasta que vuelve su región. Con dos Servidores de aplicaciones, una caída cuesta a los Usuarios de origen algo de latencia y nada más.

Un standby en otra zona cubre la pérdida de una zona en segundos y factura una segunda máquina. No hace nada por una región. Para una Base de datos sin copia remota, la recuperación a un punto en el tiempo archiva el registro de escrituras, así que la pérdida es de minutos en lugar de una noche. Un simulacro de restauración demuestra que la copia funciona, porque una que no se ha probado puede fallar.

## Qué cuesta

Pagas los Nodos de una segunda región mientras está casi ociosa, y el Gasto de standby y de copias de seguridad además. Un almacén repartido cuesta varias veces lo que una sola Base de datos, porque cada región guarda una copia. Hacer failover de una región reinicia solo Nodos sin estado, en frío, y nunca mueve datos, así que solo un almacén repartido supera el simulacro. El juego no tiene niveles de standby frío o templado, solo estos ajustes.

## En Quorum

Fija **Spread** en un [Almacén de columnas anchas](/components/wide) después de investigar [Replicación sin líder](/research/leaderless). En una [Base de datos](/components/database), fija **Backup** y **Standby**. Investiga [Copias de seguridad](/research/pitr), [Simulacros de restauración](/research/restore-drills), [Múltiples zonas](/research/multi-az) y [Simulacros de recuperación ante desastres](/research/dr-drills). Los incidentes [Caída de región](/incidents/region) y [Simulacro de DR](/incidents/dr-drill) lo ponen a prueba. Lee [RPO y RTO](/glossary/rpo-and-rto) y [Prepararse para un Exit](/guides/prepare-for-an-exit). El siguiente paso, [un LLM detrás de un gateway en GPU](/patterns/llm-behind-a-gateway-on-gpus), añade prompts de IA.
