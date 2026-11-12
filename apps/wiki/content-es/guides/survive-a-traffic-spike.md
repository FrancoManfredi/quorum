---
title: Sobrevivir a un pico de tráfico
summary: Sigue sirviendo cuando la demanda se multiplica por un rato, durante el pico y con capacidad de reserva, cachés y descarte de carga antes del siguiente.
section: guides
order: 5
era: 1
aliases: traffic spike, spike, hug of death, slashdot, demand, surge, viral, burst, pico de tráfico, pico, demanda, oleada, viral, ráfaga
gdd: /design/11-incidents
---

Usa esta guía cuando empieza un incidente de [Pico de tráfico](/incidents/spike), o cuando quieres que
tu Diseño sobreviva al siguiente sin intervenir.

En un pico, un sitio grande te enlaza y la demanda sube de 3 a 10 veces durante un rato, así que todos
los Nodos del camino reciben la carga extra a la vez. Un Diseño sin capacidad de reserva descarta
peticiones y pierde usuarios, porque el tiempo de espera se dispara cuando un Nodo se acerca a la
carga total. Esa curva es la que dibuja [Capacidad, utilización y colas](/explanation/queues).

## Reconoce el pico

- Una línea roja con la etiqueta **▲ SEV3 Pico de tráfico** aparece en los gráficos del Cuadro de
  mando (D).
- La fila **Peticiones** del Nodo Usuarios salta. Cada tarjeta de Nodo pasa a ámbar y luego a rojo.
- Con [Alertas](/research/alerting), salta el aviso por errores, p99 o saturación.

## Durante el pico

El pico termina solo. Tu objetivo es perder los menos usuarios posibles hasta que acabe. Un incidente
que daña a los usuarios durante más de la mitad de su duración [escala](/explanation/incidents) una
vez: dura más y el pico crece en la mitad de su tamaño.

1. Pulsa **Espacio** para pausar si necesitas tiempo para mirar. Con el ajuste **Pausar en SEV1 y
   SEV2** activado, el juego pausa por ti en los incidentes más graves.
2. Encuentra el primer Nodo del camino que se puso rojo, que suele ser el Servidor de aplicaciones o la
   Base de datos.
3. Selecciónalo y selecciona **Más grande**, o pulsa **U**. Más capacidad ayuda al instante, tras un
   breve reinicio.
4. Si el Servidor de aplicaciones está en rojo, coloca mejor una segunda copia detrás del Balanceador
   de carga, para que ningún reinicio pierda tráfico.
5. Si tienes [Descarte de carga por prioridad](/research/load-shedding), abre la sección **Sobrecarga**
   de cada Servidor de aplicaciones y selecciona **Descartar lo menos valioso**, para que un Servidor
   de aplicaciones saturado descarte primero los tipos de menor valor, empezando por los bots.
6. Vigila la cifra de Apdex del HUD, y deja de hacer cambios cuando se mantenga cerca del objetivo.

:::Note{tone="warn"}
No añadas un Autoescalador durante un pico para que te salve. Una copia nueva en una VM tarda 180
segundos en servir, así que suele llegar después del pico. En un
[Clúster de Kubernetes](/components/cluster), una copia nueva tarda 30 segundos.
:::

## Después del pico

1. Cuando termina el incidente, llega un Correo de postmortem. Si ofrece un elemento de acción, pulsa
   su botón para poner ese Estudio el primero de la cola. Archivar el mensaje sin él deja el elemento
   abierto, y el incidente sigue siendo el doble de probable.
2. Usa **Más pequeño (gratis)** en los Nodos que redimensionaste, cuando la Carga baje, si te importa
   el Gasto.

## Prepárate para el siguiente pico

Un Diseño que sobrevive a los picos sin intervenir tiene margen en cada Nodo del camino. Haz esto por
orden de coste.

1. **Mantén capacidad de reserva.** Dimensiona cada Nodo para que su Carga se quede por debajo del 50%
   en el pico diario, y luego revisa la fila **Saturación** del Cuadro de mando en el pico de la
   tarde.
2. **Cachea las lecturas.** Investiga [Caché](/research/caching) y coloca una [Caché](/components/cache)
   delante de la Base de datos, para que la mayoría de las lecturas extra de un pico nunca la alcancen.
3. **Responde las páginas en el borde.** Desde la Era Semilla, investiga
   [Entrega de contenido](/research/cdn) y coloca un [CDN](/components/cdn) delante de los Servidores
   de aplicaciones, que responde páginas y contenido multimedia cacheables sin tus servidores.
4. **Reparte los Servidores de aplicaciones.** Usa un [Balanceador de carga](/components/lb) con dos o
   más copias del Servidor de aplicaciones. Una segunda copia añade margen sin reinicio, y además
   sobrevive a un fallo de instancia.
5. **Escala con la demanda.** Investiga [Autoescalado](/research/autoscaling). Enlaza los Servidores de
   aplicaciones a un [Autoescalador](/components/autoscaler), y fija su **min** en las copias que
   necesitas en el pico. El mínimo mantiene copias calientes, así que el pico encuentra capacidad que
   ya está funcionando.
6. **Descarta carga.** Activa **Descartar lo menos valioso** en cada Servidor de aplicaciones, para que
   un pico te cueste primero los bots y los tipos baratos.

Mira el Nodo Usuarios durante el siguiente pico, donde los errores `descartado` en **Errores por
causa** deben mantenerse cerca de cero, y comprueba que el Apdex del HUD se mantiene por encima de su
objetivo durante todo el pico. Si algún Nodo aún se pone rojo, es el siguiente límite, así que mira
[Encontrar el cuello de botella](/guides/find-the-bottleneck).

El Sandbox [Arranque en frío](/sandboxes/cold-start) envía un pico a un Servidor de aplicaciones Java.
Las copias Java nuevas arrancan lentas, así que debes planificar la capacidad antes de que llegue el
pico.
