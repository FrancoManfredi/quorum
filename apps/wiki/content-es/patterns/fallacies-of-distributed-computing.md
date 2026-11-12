---
title: Falacias de la computación distribuida
summary: Ocho suposiciones que valen en una máquina y fallan a través de una red, cada una con una defensa estándar.
section: patterns
group: Foundations
order: 16
aliases: fallacies, eight fallacies, deutsch, network is reliable, latency is zero, distributed computing, falacias, ocho falacias, la red es fiable, la latencia es cero, computación distribuida
---

Las falacias de la computación distribuida son ocho cosas que los programadores suponen sobre las redes y aprenden por las malas. L. Peter Deutsch enumeró siete en Sun Microsystems en 1994, partiendo de cuatro que Bill Joy y Dave Lyon habían nombrado, y James Gosling añadió la octava hacia 1997.

Cada una falla con un número concreto:

- **La red es fiable.** Una llamada puede desvanecerse, así que un timeout es la única respuesta honesta. Reintentarla arriesga a hacer el trabajo dos veces, lo que significa que la operación debe ser segura de repetir ([Claves de idempotencia](/patterns/idempotency-keys)).
- **La latencia es cero.** Un viaje de ida y vuelta entre Fráncfort y Virginia tarda unos 90 ms. Un bucle que hace 10 en secuencia cuesta 900 ms, donde en una sola máquina no costaba nada.
- **El ancho de banda es infinito.** Una respuesta de 5 MB enviada a 1,000 clientes por segundo son 5 GB por segundo.
- **La red es segura.** Todo lo que viaja por el cable puede leerse o alterarse, así que cifra también el tráfico entre servicios.
- **La topología no cambia.** Los hosts van y vienen, así que usa nombres y comprobaciones de estado, no direcciones fijas.
- **Hay un único administrador.** Una dependencia gestionada por otro equipo, u otra empresa, cambia sin avisarte.
- **El coste del transporte es cero.** Serializar y enviar datos consume CPU, y los proveedores de nube facturan los bytes que cruzan zonas y regiones.
- **La red es homogénea.** Los clientes, los enlaces y los servidores difieren en velocidad, versión y comportamiento.

## Qué cambia en un diseño

Trata cada llamada remota como algo que puede ser lento, erróneo o inexistente. Ponle un [timeout](/patterns/timeouts), reinténtala con [backoff](/patterns/retry-with-backoff) y asegúrate de que el trabajo pueda ejecutarse dos veces. Prefiere una llamada gruesa a diez finas, porque cada llamada vuelve a pagar latencia y probabilidad de fallo, y mantén los servicios conversadores en una misma zona.

Nada de esto requiere sucesos raros. Con una tasa anual de fallos de unos pocos puntos porcentuales, una flota de 1,000 servidores pierde un host cada una o dos semanas, así que el fallo es rutina y el diseño debe darlo por hecho.

## En Quorum

Varios Incidentes y costes de aquí son las falacias en acción. En el Incidente [Partición de red](/incidents/partition), las llamadas entre regiones agotan su tiempo. Una llamada a otra Zona añade latencia y [Egress](/glossary/egress), y una llamada a otra región paga el viaje de ida y vuelta. Hasta que investigas [Tiempos de espera y reintentos](/research/timeouts), cada Enlace espera mucho tiempo una respuesta, que es la primera falacia en un Tablero. La entrada del glosario [falacias de la computación distribuida](/glossary/fallacies-of-distributed-computing) las enumera, y [Errores y reintentos](/explanation/errors-and-retries) muestra cómo cambia la carga el hecho de que los llamadores se rindan.
