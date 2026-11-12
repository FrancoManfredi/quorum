---
title: Elegir un stack
summary: Elige el runtime y el framework de tus Servidores de aplicaciones según el límite que alcanza tu Diseño, y pasa a él con una migración que mueve el tráfico por etapas.
section: guides
order: 8
aliases: stack, runtime, framework, language, migration, php, node, go, java, rust, elixir, strangler, lenguaje, migración, patrón strangler
gdd: /design/06-runtimes
---

Usa esta guía cuando tus Servidores de aplicaciones chocan con un límite que la capacidad no
arregla, o cuando quieres que el Equipo entregue Funcionalidades más rápido.

Un Stack es un runtime más un framework. Ninguno es mejor en todo: cada uno cambia throughput,
latencia de cola, memoria y velocidad de entrega del Equipo. En [Runtimes](/runtimes) tienes todas
las opciones con sus números.

## Nombra primero el problema

1. Selecciona un Servidor de aplicaciones y lee sus medidores de **Recursos**.
2. Busca tu problema en la tabla. Te indica los Stacks que lo resuelven.

| Lo que ves                                         | Stacks que ayudan                                                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| La **RAM** se llena antes que la **CPU**.          | Un runtime con poca memoria por petición: [Go](/runtimes/go), [Tokio](/runtimes/tokio), [Node.js](/runtimes/node).                    |
| **Workers ocupados** está lleno y la CPU baja.     | Un runtime donde esperar no retiene un worker: [Go](/runtimes/go), [Node.js](/runtimes/node), [Kestrel](/runtimes/kestrel).           |
| Una petición lenta sube el p99 de todos los tipos. | Un runtime sin un único bucle de eventos: [Go](/runtimes/go), [BEAM](/runtimes/beam). O [Clúster de Node.js](/runtimes/node_cluster). |
| El p50 está bien y el p99 se dispara.              | Un runtime sin pausas de GC: [Tokio](/runtimes/tokio), [BEAM](/runtimes/beam). O ajusta el colector en Java y Go.                     |
| La CPU está llena en un Diseño pequeño.            | Un runtime más rápido, o un framework con menos sobrecarga. [OPcache](/research/opcache) hace PHP 2.5 veces más rápido.               |
| Las Funcionalidades salen demasiado despacio.      | Un framework que entregue rápido: [Laravel](/frameworks/laravel), [Rails](/frameworks/rails), [Django](/frameworks/django).           |

Los frameworks que entregan rápido cuestan CPU, y Laravel, Rails y Django envían
[consultas N+1](/glossary/n1-query) hasta que investigas [Carga anticipada](/research/eager-loading).

## Compara las opciones

1. Abre la sección **Runtime** del Servidor de aplicaciones.
2. Pasa el puntero sobre un runtime. Una tarjeta de Tradeoff dibuja sus seis ejes frente a tu Stack
   actual, con una vista previa de lo que hace a este Diseño.
3. Haz lo mismo en la sección **Framework**. Solo lista los frameworks del lenguaje del runtime.
4. Una opción en gris necesita Investigación. Su tooltip nombra la Investigación que la desbloquea.

Compara también el salario del lenguaje y el tiempo de contratación. Contratas ingenieros del
lenguaje de tu servicio, así que un lenguaje raro encarece al Equipo y frena su crecimiento. Los
ingenieros que no conocen el lenguaje nuevo trabajan más despacio hasta que los formas, lo cual sale
más barato que despedirlos y volver a contratar. Mira [Equipo y velocidad](/explanation/team-and-velocity).

## Inicia la migración

En una Empresa, cambiar de Stack inicia una migración de todo el servicio.

1. Selecciona el runtime o el framework nuevo en cualquier Servidor de aplicaciones. La primera vez
   que eliges en una sección, la tarjeta de Tradeoff se queda abierta. Haz clic en **Confirmar**. El
   juego inicia una migración y pone su primera etapa en el backlog del Equipo.
2. Pulsa **T** para abrir el panel del Equipo. Una tarjeta de migración arriba muestra el Stack
   antiguo y el nuevo.

El coste en horas de desarrollo depende de lo grande que sea el cambio y de tu código: un runtime
del mismo lenguaje cuesta lo menos, un framework cuesta más y un lenguaje nuevo cuesta lo más,
sobre todo si entrega despacio.

## Mueve el tráfico por etapas

La migración pasa los Servidores de aplicaciones al Stack nuevo en cuatro etapas: 5%, 25%, 50% y
100%. Es el [patrón strangler](/glossary/strangler-pattern).

1. Espera a que la tarjeta muestre **Listo**. El Equipo ha construido la etapa.
2. Haz clic en **Pasar al …%**. El juego mueve esa parte de los Servidores de aplicaciones al Stack
   nuevo, y arrancan en frío. Con el **Piloto automático** activado, el juego pasa cada etapa lista
   por ti.
3. Vigila la insignia **Bugs** de la tarjeta. Las peticiones en el Stack nuevo fallan en una pequeña
   parte hasta que se entrega la tarea **Corregir errores de migración**. El juego la encola por ti.
4. Comprueba el Apdex y la proporción de errores en el HUD después de cada etapa.

Si el Stack nuevo empeora las cosas, haz clic en **Cancelar** en la tarjeta. Los Servidores de
aplicaciones movidos vuelven atrás y pierdes las horas de desarrollo gastadas. No puedes cancelar
después de la última etapa: corrige sus bugs.

:::Note{tone="warn"}
Las Funcionalidades se construyen a la mitad de velocidad mientras corre una migración. Empieza una
cuando el Diseño esté estable, no durante un incidente.
:::

## Cambios más pequeños

No siempre necesitas un lenguaje nuevo:

- **Tamaño del pool.** En PHP-FPM y Gunicorn, la sección **Tamaño del pool** fija los workers. Mantén
  el número igual o por debajo de **Caben … en RAM**.
- **Colector.** En Java, investiga [ZGC](/research/zgc) y elígelo en **Colector**.
- **GOGC.** En Go, investiga [Ajuste del GC de Go](/research/gogc-tuning) y cambia **GOGC**.
- **Clúster de Node.js.** Investiga el [Modo clúster de Node.js](/research/node-cluster) para usar
  todos los núcleos.

Los Workers ejecutan su propio Stack. Un cambio en un Worker se aplica en ese Worker al instante, y
tras la última etapa la tarjeta de migración dice **Migrado** hasta que se entrega Corregir errores
de migración, y entonces se cierra. El medidor que estaba lleno al empezar ya tiene margen, y
**Velocidad** en el Nodo Usuarios muestra lo rápido que entrega el Stack nuevo.

Los Sandboxes [Bloqueo del bucle de eventos](/sandboxes/event-loop-stall) y
[Pausas de GC](/sandboxes/gc-pauses) muestran cada uno la debilidad de un runtime, y en un Sandbox un
cambio de Stack se aplica al instante, sin migración. [Runtimes](/runtimes) lista todas las opciones
con sus números, y [Leer el p99](/guides/read-p99) trata las pausas de GC y los bloqueos del bucle de
eventos que quizá acabas de dejar atrás.
