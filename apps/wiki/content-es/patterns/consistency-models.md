---
title: Modelos de consistencia
summary: Un modelo de consistencia dice qué valores puede devolver una lectura tras una escritura, y los más fuertes cuestan latencia y disponibilidad.
section: patterns
group: Foundations
order: 13
aliases: consistency, linearizability, linearizable, causal consistency, eventual consistency, sequential, read your writes, stale read, consistencia, linealizabilidad, consistencia causal, consistencia eventual, lectura de tus propias escrituras, lectura obsoleta
---

Un modelo de consistencia es una promesa sobre qué valores puede devolver una lectura una vez que se han producido escrituras en algún punto del sistema. Jepsen define uno como un conjunto de historias que un sistema puede producir legalmente, y los modelos se diferencian en cuánto del orden en tiempo real conservan.

Aquí está la misma historia bajo tres modelos. Un usuario publica un comentario, y la escritura llega al primario a las `12:00:00.000`. Una réplica la aplica 200 ms después.

- **Linealizable.** Cada operación parece instantánea y en orden de tiempo real. Una vez confirmada la escritura, toda lectura en cualquier sitio la devuelve, incluida una lectura a las `12:00:00.050`. El precio es que la réplica debe consultar al primario, o que la escritura debe esperar a la réplica.
- **Lectura de tus propias escrituras (read-your-writes).** El autor siempre ve el comentario. Otros usuarios pueden ver la página vieja durante 200 ms. La solución habitual envía las lecturas de un usuario al primario durante un tiempo corto después de que escriba.
- **Eventual.** Si las escrituras se detienen, todas las réplicas convergen. Mientras tanto cualquiera, incluido el autor, puede leer la página vieja. Es el modelo más barato, y un refresco puede hacer que el comentario desaparezca y vuelva.

Entre ellos está la consistencia causal, que mantiene la causa antes del efecto: nadie ve una respuesta antes del comentario al que responde.

## Qué cambia en un diseño

Usa el modelo más débil que mantenga ciertos tus invariantes. Un contador de "me gusta" puede ser eventual, ya que una cuenta atrasada 200 ms no daña a nadie. Un usuario que acaba de cambiar su contraseña debería leer su propia escritura. Una transferencia bancaria que comprueba un saldo necesita un modelo más fuerte, porque dos lectores que actúan sobre saldos obsoletos pueden gastarlo los dos.

Los modelos más fuertes cuestan dos cosas. Cada lectura o escritura espera a más nodos, así que la latencia sube ([CAP y PACELC](/patterns/cap-and-pacelc) cubre la contrapartida), y durante una partición algunas peticiones deben fallar. Los modelos más débiles cuestan bugs: una lectura obsoleta se convierte en un pedido duplicado a menos que el código la espere.

Un camino intermedio barato envía al primario solo las lecturas que lo necesitan ([Lee tus propias escrituras](/patterns/read-your-writes), [Estrategias de replicación](/patterns/replication-strategies)).

## En Quorum

Una Réplica de lectura va por detrás de las escrituras, y la proporción obsoleta de sus lecturas sigue al retraso, que el Incidente [Retraso de replicación](/incidents/repl-lag) multiplica. [Lecturas obsoletas](/incidents/stale-read) muestra el mismo síntoma en una Caché que adelanta a su invalidación. La Investigación [Enrutado read-your-writes](/research/ryw-routing) envía las lecturas del pago al primario, y el glosario define la [consistencia eventual](/glossary/eventual-consistency), la [consistencia de lectura de tus propias escrituras](/glossary/read-your-writes-consistency) y el [retraso de replicación](/glossary/replication-lag).
