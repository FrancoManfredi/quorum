---
title: Tu primer incidente
summary: Levanta la ronda Pre-semilla, conoce tu primer incidente, respóndelo y archiva su postmortem.
section: tutorials
order: 3
era: 1
aliases: first incident, pre-seed, raise, funding round, postmortem, action item, replace, traffic spike, instance failure, primer incidente, pre-semilla, levantar ronda, ronda de financiación, elemento de acción, reemplazar, pico de tráfico, fallo de instancia
gdd: /design/11-incidents
---

En esta lección levantas tu primera ronda de financiación y gestionas tu primer incidente. Los
incidentes empiezan solo después del Garaje. Empieza con una Empresa que tenga su base de datos en su
propio Nodo, como en [Tu primer cuello de botella](/tutorials/first-bottleneck).

## Levanta la ronda Pre-semilla

1. Haz crecer tu Empresa hasta 1,000 usuarios. La barra bajo el nombre de la Era en el HUD se llena a
   medida que te acercas.
2. Busca el botón **Oferta Pre-semilla** bajo el nombre de la Era. Haz clic en él. Se abre la oferta.
3. Lee las dos opciones. **Levantar** te da Caja y cuesta Participación. **Rechazar** conserva tu
   Participación, no da Caja y frena tu crecimiento en la siguiente Era.
4. Selecciona **Levantar**.
5. Lee la tarjeta de la Era. Nombra el objetivo de usuarios de la siguiente ronda, el objetivo de Apdex
   y el nivel de precios. Selecciona **Continuar**.

El HUD muestra ahora **Pre-semilla**. Llegan dos tipos de petición nuevos: escrituras e inicios de
sesión. Los precios suben y pueden empezar los incidentes. Mira [Pre-semilla](/eras/pre-seed) para ver
los números.

## Prepárate

Tu primer incidente llega poco después de la ronda. Prepárate mientras esperas.

1. Cobra tus ingresos, para tener Caja que gastar.
2. Selecciona cada Nodo y revisa su fila **Carga**. Una fila por debajo del 70% deja margen para más
   tráfico.
3. Si una fila está en ámbar o rojo, arréglala como en [Tu primer cuello de botella](/tutorials/first-bottleneck).

Un incidente pone a prueba tu Diseño: el juego elige el que golpea tu punto más débil, y un Diseño con
una copia de cada Nodo y poca capacidad de reserva es débil frente a los primeros. [Cómo funcionan los
incidentes](/explanation/incidents) tiene las reglas.

## Detecta el incidente

Cuando empieza un incidente, ocurren estas cosas:

- Suena un sonido corto.
- Si el reloj corre más rápido que la velocidad normal, baja a la velocidad normal.
- Las tarjetas pasan a ámbar, rojo o gris, y el HUD muestra el cambio.

El primer incidente de una Empresa joven suele ser uno de estos dos. Lee el que veas.

## Si es un Fallo de instancia

El host que hay bajo una de tus máquinas murió. Ese Nodo se pone gris y no sirve nada.

1. Lee el aviso. Nombra el Nodo y dice **Selecciónalo y haz clic en Reemplazar.**
2. Selecciona el Nodo gris. El Inspector muestra **El host bajo esta VM murió. Sigue facturando.**
3. Selecciona **Reemplazar**. El precio está en el botón.

El Nodo vuelve en frío y se calienta, los errores paran y el Apdex empieza a subir. Un Nodo caído sigue
con su Gasto hasta que lo reemplazas, así que no esperes.

La página [Fallo de instancia](/incidents/instance) lista lo que lo previene. El arreglo habitual es una
segunda copia detrás de un [Balanceador de carga](/components/lb), que salta los hosts muertos.

## Si es un Pico de tráfico

Un gran sitio de noticias enlazó tu producto. La demanda salta a varias veces la tasa normal durante un
rato.

1. Mira las tarjetas. Tu Nodo más ocupado se pone rojo, y algunas peticiones fallan.
2. Selecciona el Nodo con el contorno ámbar que pulsa, y lee su fila **Carga**.
3. Espera. Un Pico de tráfico termina solo.

**Más grande** añade capacidad, pero el Nodo se reinicia primero y pierde su tráfico un momento. En una
sola máquina, añade la capacidad después del pico.

La capacidad de reserva es la mejor defensa. Un Diseño que funciona casi lleno todos los días no tiene
sitio para un pico. Mira [Pico de tráfico](/incidents/spike).

:::Note{tone="warn"}
Un incidente que daña a tus usuarios durante más de la mitad de su duración sube un nivel de gravedad.
Entonces dura más, y un pico se hace más grande. Una respuesta rápida lo mantiene pequeño.
:::

## Lee el postmortem

Cuando termina el incidente, un compañero te envía un postmortem. Pulsa `I` para abrir la Bandeja de
entrada y busca el mensaje titulado "Postmortem: …".

1. Selecciona el mensaje. El lector muestra una insignia **SEV** y el nombre del incidente.
2. Lee el cuerpo. Da la causa, el **MTTR** (el tiempo en restaurar el servicio), los usuarios que
   perdiste y los ingresos que perdiste.
3. Lee la última línea. Nombra lo que previene el incidente.

## Archiva el postmortem

La mayoría de los postmortems traen un elemento de acción: un elemento de Investigación que previene el
mismo incidente.

1. Busca el botón de la tarjeta con el nombre de la Investigación y su coste en Conocimiento.
2. Haz clic en él. La tarjeta se cierra y el Estudio pasa al frente de tu cola de Investigación.

También puedes hacer clic en la **X** para archivar el postmortem y dejar abierto el elemento de
acción. Entonces ese incidente sigue siendo el doble de probable hasta que tengas la Investigación. Si
aún no tienes el Conocimiento, acepta igualmente el elemento de acción. El Estudio avanza a medida que
se llenan tus pools de Conocimiento, y [Gana Conocimiento e investiga](/tutorials/research-and-insight)
explica los pools y cómo los gasta la cola.
