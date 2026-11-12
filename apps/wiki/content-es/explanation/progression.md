---
title: Eras e Investigación
summary: Por qué tu Empresa avanza por Eras, por qué la Investigación de cada Era necesita el tráfico de esa Era y cómo los Estudios convierten el Conocimiento en nuevas herramientas.
section: explanation
order: 10
aliases: eras, progression, research, studies, study, insight, recipe, pools, spike, milestone, unlock, tracks, queue, progresión, investigación, estudios, estudio, conocimiento, receta, hito, desbloqueo, pistas, cola
gdd: /design/10-progression
---

Una Empresa crece a lo largo de ocho Eras, del Garaje a la Era Cotizada en bolsa, y cada Era trae sus
problemas junto con la Investigación para resolverlos. Los nuevos tipos de petición y modos de fallo llegan
con la Era. Compras las herramientas con Conocimiento, y tu propio tráfico lo produce, así que no puedes
investigar un problema que aún no has encontrado.

## Qué cambia una Era

Sales de una Era alcanzando su hito de usuarios y aceptando (o rechazando) la ronda de financiación que
ofrece. [Caja, Gasto y financiación](/explanation/money) explica esa elección. Cada nueva Era cambia cinco
cosas a la vez:

- **La mezcla de peticiones.** Llegan nuevos tipos de tráfico, como escrituras e inicios de sesión en
  Pre-semilla, o búsquedas, subidas y bots en Semilla. Cada tipo carga tu Diseño a su manera.
- **El mercado.** Cada Era tiene un mercado mayor, que limita cuántos usuarios puedes conquistar. Las
  Funcionalidades pueden ampliarlo.
- **La vara.** El objetivo de Apdex sube en cada Era, así que un Diseño que mantenía contentos a los usuarios
  en una Era puede perderlos en la siguiente. Desde la Serie A, un SLO de disponibilidad también cuenta cada
  petición fallida.
- **Los precios.** Un índice de costes y un índice de salarios escalan todos los precios, para que el Gasto
  siga siendo una parte real de los ingresos.
- **Los incidentes.** Desde Pre-semilla empiezan los incidentes, y las Eras posteriores permiten otros más
  graves.

Esta es la mezcla de peticiones de la Era Semilla:

::Mix{era="2"}

Las páginas de referencia de [Eras](/eras) muestran el hito, el mercado, los objetivos, la mezcla y las
llegadas de cada Era.

:::Note{tone="real"}
Cada Era plantea una pregunta que las empresas se encuentran más o menos a ese tamaño: "¿Hasta dónde llega
una sola máquina?" en el Garaje, y "¿Qué pasa cuando falla una zona entera?" en la Serie A. El orden sigue
el camino habitual de un producto en crecimiento: escalado vertical, luego la base de datos, luego separar
cargas de trabajo distintas, luego disponibilidad, luego datos a gran escala y luego geografía.
:::

## El Conocimiento viene en tipos

El Conocimiento es la moneda de la Investigación, y el Nodo de [Analítica](/components/analytics) lo produce
muestreando los Nodos que enlazas a él. Una petición muestreada da Conocimiento de su propio tipo: una
lectura muestreada da Conocimiento de lectura, y una búsqueda muestreada da Conocimiento de búsqueda. Tu
Empresa mantiene un pool por cada tipo de petición, más un pool de **Fallos** que se llena con las peticiones
que fallan o frustran a los usuarios. [Conocimiento y observabilidad](/explanation/observability) explica el
rendimiento en detalle.

La primera vez que tu Diseño atiende con éxito más de la mitad de un nuevo tipo de petición, el pool de ese
tipo recibe además un regalo único de 20 de Conocimiento.

## Las recetas atan la Investigación al tráfico

Cada elemento de Investigación tiene una **receta**: los pools que lo pagan. Por defecto, la receta de un
elemento son los tipos de petición de su Era. Algunos elementos piden los tipos que muestran su problema:
Caché pide Conocimiento de lectura, y Pooling de conexiones pide Conocimiento de escritura. La mitad del
coste de cada elemento de Fiabilidad es Conocimiento de fallos, porque la fiabilidad se aprende viendo
fallos.

Así que más vistas de página nunca compran la Investigación de la Serie B. Primero tienes que servir los
nuevos tipos. Los juegos de fábricas usan el mismo diseño con paquetes de ciencia, donde la línea de
producción de cada etapa paga el siguiente paso.

Ningún elemento se abre antes de su Era, y ninguno se ejecuta antes que los elementos que requiere. Los
elementos bloqueados de la siguiente Era siguen visibles, para que puedas planificar.

## Crear un tipo con una palanca de producto

Un Estudio avanza al ritmo de su pool más escaso, así que el objetivo es un suministro igual de todos los
pools de su receta. La mezcla de la Era juega en tu contra. Pre-semilla da a las escrituras varias veces la
proporción de los inicios de sesión, y la receta predeterminada de Pre-semilla paga ambos, así que todo
elemento de esa receta avanza despacio por el inicio de sesión. Más muestras suben todos los pools a la vez.
Una **Palanca de producto** cambia la propia mezcla.

Cada palanca es un cambio de producto, como un cuadro de búsqueda en cada página o una exportación nocturna
de datos. Tiene tres pasos, y cada paso sube la proporción de tráfico de ese tipo. Los demás tipos ceden la
diferencia en proporción, así que una palanca mueve demanda de un tipo a otro en lugar de añadirla. Un paso
cuesta Horas de desarrollo en tu backlog y frena el crecimiento de usuarios. Cuando quitas un paso, vuelve la
mitad de sus Horas de desarrollo.

::Lever{kind="login"}

Las peticiones añadidas ganan lo que ganaba el tráfico al que desplazaron. Son usuarios marginales del mismo
producto, no usuarios nuevos, así que los ingresos por usuario se quedan donde estaban. Lo que compra la
palanca es velocidad de Investigación y una carga que tú no elegiste. Subir la palanca de inicio de sesión
pone más hashes de contraseña en tus Servidores de aplicaciones, por ejemplo. Ese intercambio es la razón por
la que una palanca sobre un tipo que no sirves no hace nada. Un tipo llega con su Era y la Funcionalidad que
lo trae, y una palanca solo mueve una proporción que ya existe.

Encuentra una palanca en el panel de Investigación. Abre un elemento y lee sus filas de **Coste**. El pool que
limita el Estudio muestra una tarjeta: su título dice que el Conocimiento de ese tipo es demasiado bajo, da
lo que gana el pool frente a lo que necesita el Estudio, y su botón nombra el paso y sus Horas de desarrollo.
Bajo el título, la tarjeta dice qué alcanza el paso en proporción del tráfico y qué cuesta en crecimiento de
usuarios. Cuando la Era es temprana, cuando un Emprendimiento limita el tipo o cuando un paso ya espera en el
backlog, el botón aparece en gris y la tarjeta da el motivo. El Sandbox gratuito enumera todas las palancas
de su mezcla actual y fija un paso al instante, porque no tiene un Equipo que lo construya.

## Los Estudios se ejecutan de uno en uno

Un elemento de Investigación se ejecuta como un **Estudio**, y solo se ejecuta un Estudio a la vez. Puedes
encolar hasta 8, reordenarlos y cambiar cuál se ejecuta. Un Estudio conserva su progreso cuando cambias a
otro, pero cancelarlo pierde su progreso y el Conocimiento que consumió. Su efecto empieza cuando se
completa.

También puedes encolar un elemento bloqueado, como Civilization te deja elegir una tecnología lejana e
investiga el camino hasta ella. Encola [Modo clúster de Node.js](/research/node-cluster) sin tener Node.js, y
Node.js entra en la cola por delante. El botón dice lo que añade antes de que lo pulses. Como el Estudio en
curso tiene que ser uno que puedas investigar, la cola guarda un orden: un Estudio nunca se pone por encima
de uno que necesita, **Estudiar ahora** lleva al frente los requisitos previos de un elemento junto con él,
y cancelar un requisito previo cancela lo que lo necesita. El coste es que una cadena larga llena la cola
rápido, y si el primer Estudio de ella se atasca, todo lo que hay detrás espera.

Un Estudio consume Conocimiento mientras avanza, no todo de una vez. Cada Era fija una duración base, desde
segundos en el Garaje hasta una hora de tiempo de simulación en la Era Cotizada en bolsa. Cada segundo, el
Estudio toma su parte del coste de cada pool de su receta. Cuando un pool se queda seco, el Estudio se frena
al ritmo que gana ese pool, así que el tipo más escaso marca el ritmo. El tráfico baja por la noche, así que
un Estudio que necesita un tipo tranquilo también se frena de noche.

Puedes empezar un Estudio sin Conocimiento guardado, y de todos modos no puedes acumular mucho. Cada pool
guarda solo lo que recoge tu ventana de retención de Analítica al ritmo actual, y nunca menos que la parte de
un Estudio. Los Estudios solo avanzan mientras la Empresa está abierta; el reloj se detiene cuando la cierras.

## Hacer más rápidos los Estudios

Dos cosas aumentan la velocidad de un Estudio:

- **Un Spike.** Pon un Spike en el backlog de un equipo, y ese equipo trabaja en el Estudio en curso en lugar
  de en el producto. Mientras lo hace, el Estudio avanza al doble de velocidad. La Investigación compite con
  las Funcionalidades por los ingenieros, como en las empresas reales. Mira
  [Equipo y velocidad](/explanation/team-and-velocity).
- **Investigación de velocidad de Estudio.** [Búsqueda de trazas](/research/trace-search) y
  [Notebooks](/research/notebooks) suman un 25% cada una.

Algunos elementos de Observabilidad también necesitan amplitud. El [Trazado distribuido](/research/tracing)
necesita que sus tipos se muestreen en 3 tipos de Componente, porque una traza necesita más de un salto.

## Las pistas

La Investigación se agrupa en diez pistas: Infraestructura, Datos, Fiabilidad, Observabilidad, Rendimiento,
Runtimes, Frameworks, Seguridad, Producto y Coste. Las pistas son una forma de explorar, y un elemento de
cualquier pista puede requerir uno de otra. La referencia de [Investigación](/research) enumera cada elemento
con su Era, su coste y sus requisitos.

Los incidentes también orientan la Investigación. Cuando termina un incidente, su postmortem nombra la
primera Investigación que lo evitaría y que puedes estudiar ahora, y hasta que la tengas, ese incidente es
más probable. [Cómo funcionan los incidentes](/explanation/incidents) explica este bucle.

## Por encima de la Empresa

Las Eras y la Investigación se reinician cuando termina una Empresa. El Legado, que ganas en un Exit, pasa a
la siguiente. [Por qué termina una Empresa](/explanation/legacy) explica esa capa. Para empezar, sigue
[Gana Conocimiento e investiga](/tutorials/research-and-insight).
