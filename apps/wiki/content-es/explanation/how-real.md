---
title: Qué tan real es Quorum
summary: Qué modela la Simulación con fidelidad, qué simplifica a propósito y dónde dobla la realidad.
section: explanation
order: 14
aliases: realism, accuracy, simplification, model, simulation, determinism, real world, faithful, limits, simplifications, realismo, precisión, simplificación, modelo, simulación, determinismo, mundo real, fiel, límites
gdd: /design/reality-check
---

Quorum dobla la realidad en unos pocos lugares, a propósito, y esta página los enumera. Cada regla tiene que
ser lo bastante verdadera como para que lo que aprendes te sirva en el trabajo. También tiene que ejecutarse
diez veces por segundo en una pestaña del navegador, y tiene que ser divertida. Esas tres exigencias tiran en
direcciones distintas, así que las reglas conservan la forma real y simplifican las matemáticas.

## La regla de diseño: forma real, matemáticas simples

La Simulación calcula tasas. No ejecuta servidores reales, ni Kubernetes real, ni paquetes de red. En cada
Paso recorre tu Diseño desde los Usuarios hacia fuera y calcula qué llega a cada Nodo, qué puede servir, qué
espera y qué falla. El resultado es el Libro mayor: todos los números que muestra el juego.
[Cómo fluyen las peticiones](/explanation/requests) describe este recorrido.

Las curvas tienen la forma de los sistemas reales. La latencia sube de golpe cerca de la utilización total,
la cola de latencia crece con el fan-out y los reintentos empeoran la sobrecarga. Los números exactos están
estilizados, para que sean baratos de calcular y fáciles de leer.

:::Note{tone="real"}
Los diseñadores consideraron una simulación fiel de Kubernetes y la descartaron. No modelaría los números
que optimizas, como la latencia y los ingresos, y es demasiado pesada para un juego de navegador. Así que
Kubernetes es un Componente con comportamiento modelado, no un clúster simulado.
:::

## Lo que el juego modela con fidelidad

Estas reglas siguen de cerca la fórmula real o el comportamiento real:

- **La ley de Little.** Las peticiones en curso equivalen al throughput por el tiempo que se queda cada una.
  Es exacta, y es la razón por la que una Base de datos lenta llena los slots de los Servidores de
  aplicaciones que la llaman. Mira la [ley de Little](/glossary/littles-law).
- **La curva de utilización.** La espera crece con ρ / (1 − ρ), la forma de una cola de un solo servidor.
  Los servidores reales tienen muchos workers, pero el palo de hockey es el mismo. Mira
  [Capacidad, utilización y colas](/explanation/queues).
- **Apdex.** La Simulación usa la fórmula estándar de Apdex: las peticiones satisfechas cuentan completas,
  las toleradas como la mitad. Mira [Apdex e ingresos](/explanation/apdex-and-revenue).
- **Amplificación de la cola.** Cuando una petición se reparte en varias, la llamada más lenta decide su
  latencia. Esto sigue "The Tail at Scale", de Dean y Barroso.
- **Fallo metaestable.** Los reintentos pueden mantener un sistema sobrecargado cuando el disparador ya
  desapareció. El incidente Tormenta de reintentos termina solo cuando se drena el retraso acumulado. Mira
  [Errores y reintentos](/explanation/errors-and-retries).
- **Comportamiento del runtime.** Un event loop se bloquea para todas las peticiones cuando una gasta CPU.
  Un pool de workers retiene un slot mientras la petición espera. PHP libera la memoria tras cada petición,
  así que no puede filtrarla entre ellas. Mira las páginas de [Runtimes](/runtimes).
- **Los presupuestos de error** siguen la política de Google SRE, y la **dilución** por ronda sigue las
  medianas publicadas por Carta.
- **Crecimiento y bajas de usuarios.** El crecimiento sigue la clásica curva de difusión del boca a boca, y
  los usuarios menos leales se van primero, como muestran los estudios de retención. Mira
  [Usuarios y crecimiento](/explanation/users-and-growth).

## Simplificaciones hechas a propósito

Cada una de estas reglas dobla la realidad para que el juego sea jugable. Cada una conserva la lección y
cambia la escala.

**El tiempo corre rápido.** Un segundo de simulación es un minuto de calendario, así que un día de calendario
pasa en 24 minutos reales a velocidad 1×. El calendario del Equipo corre todavía más rápido. Un día del
Equipo dura un minuto real, de modo que las contrataciones y los despliegues ocurren dentro de una sesión.

**Los usuarios son impacientes.** Los usuarios reales se van alejando durante semanas cuando un sitio se
vuelve lento. En Quorum se van en minutos cuando el Apdex cae por debajo del objetivo, así que puedes sentir
el efecto y arreglarlo. Además dejan de irse en cuanto lo arreglas, y no guardan rencor.

**La sobrecarga descarta al instante.** Un servidor real acumula un retraso cuando supera su capacidad. Un
Nodo en Quorum descarta de inmediato el trabajo que pasa de la capacidad, lo que hace que cada Paso sea
independiente del anterior. Las colas son la excepción, porque una [Cola](/components/queue) guarda su
profundidad.

**La latencia se asienta en pasadas.** La latencia y la capacidad dependen una de otra, porque una Base de
datos lenta llena los Servidores de aplicaciones que esperan por ella. La Simulación resuelve este círculo
con unas pocas pasadas amortiguadas en cada Paso, en lugar de una solución exacta.

**Los precios se asignan de dos formas.** Los precios facturados por tiempo asignan un segundo de simulación
a una hora real, así que una vCPU cuesta lo que cuesta una por hora. Los precios facturados por uso, como el
egress, conservan el precio de lista real. Las dos escalas discrepan a propósito: a la tarifa por tiempo, el
egress se comería la mitad del valor de cada vista de página.

Los valores de las peticiones, el índice de costes y el índice de salarios son controles de equilibrio, no
precios reales. Los ingresos están en dólares del juego, y la Valoración los escala a un ARR en dólares
reales. Mira [Caja, Gasto y financiación](/explanation/money).

**Una Empresa nunca muere.** Ningún incidente acaba con una Empresa, y quedarte sin Caja es un revés, no un
game over. Los usuarios nunca caen por debajo de un pequeño mínimo. Nada se ejecuta mientras la Empresa está
cerrada: no empieza ningún incidente, no se va ningún usuario y no se mueve ningún dinero. Las startups
reales sí mueren, y el juego elige no modelarlo.

**Las regiones son pestañas sobre un solo Diseño.** Cada Nodo tiene una región, y una llamada entre regiones
paga el viaje de ida y vuelta entre ellas, calculado con la velocidad de la luz en fibra. El tablero muestra
una pestaña por región, pero la Simulación resuelve un solo grafo.

## Determinista a propósito

Los sistemas reales son ruidosos, y Quorum se puede repetir exactamente. La misma partida guardada, la misma
semilla y las mismas acciones dan el mismo resultado en cualquier navegador. Toda la aleatoriedad, como el
momento de los incidentes, sale de un único generador con semilla guardado en la partida.

Para garantizarlo, la Simulación usa solo matemáticas que todo motor de JavaScript calcula de la misma
manera: sumar, restar, multiplicar, dividir y raíz cuadrada. Nunca llama a funciones como `sin` o `exp`,
que los motores calculan de forma ligeramente distinta. Las curvas suaves, como el ciclo diario de demanda,
se construyen con esas operaciones exactas. Así es como el servidor puede reproducir un Desafío y comprobar
su puntuación.

## Lo que el juego simplifica

- **Servicios.** Un Servicio es una base de código que pertenece a un equipo. El coste de coordinación de
  una base de datos compartida es la penalización por tamaño de equipo, no un modelo de la base de datos.
  Mira la [ley de Conway](/glossary/conways-law).
- **Feature flags.** Un flag fija la proporción de usuarios a los que llega una Funcionalidad. Nada elimina
  después el código de una Funcionalidad, así que los flags nunca se acumulan como en una base de código
  real. Mira [feature flag](/glossary/feature-flag).
- **Instancias spot.** Un Nodo spot es más barato y el proveedor puede reclamarlo con un aviso de 10 s.
  Mira [instancia spot](/glossary/spot-instance).
- **Trazado distribuido.** La investigación añade las tablas de Servicios y de cascada del Cuadro de mando.
  Salen de los tiempos por salto, no de trazas guardadas. Mira [trazado distribuido](/glossary/distributed-tracing).

Los documentos de diseño mantienen una comprobación de realidad: una tabla con cada afirmación que hace el
juego, la regla que la modela, la simplificación y la fuente. El [glosario](/glossary) de la wiki da el
significado real de cada término y lo que hace en el juego, lado a lado.
