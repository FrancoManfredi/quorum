---
title: Runbooks y guardia
summary: Pon a una persona de guardia cada vez, escribe la solución de cada fallo que el equipo ya ha resuelto y automatiza los que se repiten.
section: patterns
group: Operate and observe
order: 705
aliases: runbook, playbook, on-call, pager, pagerduty, rotation, mttd, mttr, mtta, incident response, sre, guardia, rotación, respuesta a incidentes, buscapersonas
---

Una rotación de guardia asegura que alguien responde al aviso, y un runbook hace que la respuesta sea la misma cada vez.

## Cuándo usarlo

- Salta una alerta de noche y nadie sabe de quién es.
- El mismo incidente vuelve, y cada vez un ingeniero redescubre la solución.
- El tiempo de respuesta depende de quién esté despierto.

## Cómo funciona

La rotación nombra a un titular y a un suplente para un servicio, normalmente por una semana. El aviso va al titular, que lo confirma. El tiempo desde el fallo hasta la primera señal es el MTTD, desde la señal hasta una confirmación el MTTA, y la recuperación completa el MTTR. Un runbook recorta este último al convertir "pensar" en "seguir".

Un buen runbook tiene un disparador (la alerta que enlaza a él), las comprobaciones que confirman la causa, la acción segura y cómo saber que funcionó. Escríbelo después de gestionar el incidente a mano una vez, mientras los pasos están frescos. El siguiente paso es convertir el runbook en un script, de modo que el aviso se resuelva solo y una persona lo revise después.

Ejemplo: un runbook de caducidad de certificado dice comprobar la fecha de caducidad, renovar, recargar el proxy y confirmar con una petición. Un script puede hacer los cuatro pasos.

## Qué cuesta

La guardia cuesta sueño, y una rotación ruidosa quema a las personas más rápido que las caídas. Un runbook se queda obsoleto cuando el sistema cambia, y nadie lo nota hasta la noche en que falla. Revisa cada uno después de cada uso.

## En Quorum

[Alertas](/research/alerting) envía el aviso, y [Rotación de guardia](/research/on-call) hace que una rotación lo confirme, de modo que el incidente empieza a atenderse en minutos. [Runbooks](/research/runbooks) permite que el equipo escriba un runbook para un tipo de incidente que ya ha gestionado a mano, y desde entonces ese tipo se resuelve solo. Las brechas, las fugas de credenciales y los simulacros de DR no tienen runbook, porque no tienen una respuesta que automatizar. Un runbook también necesita un [Equipo SRE](/research/sre-team) con un ingeniero que lo mantenga al día. Mira [Incidentes](/explanation/incidents), y las entradas del glosario [runbook](/glossary/runbook), [guardia](/glossary/on-call), [MTTD y MTTA](/glossary/mttd-and-mtta) y [MTTR](/glossary/mttr).
