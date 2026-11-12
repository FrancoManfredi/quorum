---
title: Lee tus propias escrituras
summary: Después de que un usuario escriba, envía sus lecturas a la primaria durante un tiempo, para que nunca vea datos más viejos que su propio cambio.
section: patterns
group: Scaling data
order: 308
aliases: read after write, session consistency, stale read, replica lag, sticky primary, monotonic reads, read your writes, lectura tras escritura, consistencia de sesión, lectura obsoleta, retraso de réplica, lecturas monótonas, lee tus escrituras
---

Read-your-writes garantiza que un usuario que acaba de guardar algo lo ve en la página siguiente.

## Cuándo usarlo

- Las lecturas van a réplicas que van por detrás de la primaria, y los usuarios editan algo que luego ven.
- Un pago o una página de ajustes lee de vuelta lo que acaba de escribir.
- Las respuestas obsoletas por escrituras de otros usuarios son aceptables, pero las de uno mismo no.

## Cómo funciona

La aplicación anota cuándo escribió un usuario por última vez, y durante una ventana corta después envía las lecturas de ese usuario a la primaria. Una ventana habitual son unos segundos, más que el retraso habitual de las réplicas. Las demás lecturas van a las réplicas como antes. Otra forma es llevar la posición del log de la escritura y leer solo de una réplica que la haya alcanzado.

Si un usuario guarda un perfil y 200 ms después recarga, una réplica retrasada puede devolver el antiguo. Con la regla, la recarga va a la primaria y muestra el nuevo.

## Qué cuesta

Las lecturas posteriores a una escritura caen en la primaria, así que un usuario que escribe mucho añade carga allí. La regla funciona por usuario o sesión y no impide que un usuario vea datos más viejos de otro. También necesita un reloj o una posición en los que la aplicación pueda confiar, y un usuario con dos dispositivos tiene dos sesiones. Las ventanas demasiado cortas siguen mostrando datos obsoletos.

## En Quorum

::Design{id="ryw-routed-reads"}

El interruptor de enrutado está en el [Servidor de aplicaciones](/components/server). Con él activado, las lecturas del pago van a la primaria y nunca vuelven obsoletas, y la mayoría de las demás lecturas obsoletas desaparecen. Necesita [Enrutado read-your-writes](/research/ryw-routing) tras [Réplicas de lectura](/research/replication).

Hace mucho más raro el incidente [Retraso de replicación](/incidents/repl-lag), y el incidente [Lecturas obsoletas](/incidents/stale-read) lo lista como una solución. Una [réplica síncrona](/patterns/replication-strategies) es la solución más costosa. El glosario define la [consistencia de lectura de tus propias escrituras](/glossary/read-your-writes-consistency).
