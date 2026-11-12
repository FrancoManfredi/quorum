---
title: Cómo fluyen las peticiones
summary: Cómo el juego convierte tu Diseño y tus usuarios en demanda, la encamina por cada Nodo y encuentra el cuello de botella.
section: explanation
order: 1
aliases: flow solve, demand, request kinds, backend kinds, stranded, simulation, ledger, resolución del flujo, demanda, tipos de petición, tipos de backend, simulación, libro mayor
gdd: /design/04-simulation
---

Todo número de Quorum sale de un solo modelo. La Simulación toma tu Diseño y la demanda actual y calcula el
**Libro mayor**: cada tasa, latencia, error y dólar que hay en pantalla. Esta página explica cómo mueve el
modelo las peticiones por tu tablero, y por qué se comporta como un sistema real.

## Los usuarios envían tipos de petición

Los usuarios envían **tipos de petición**, no "tráfico" genérico: vistas de página, lecturas de API, inicios
de sesión y pagos. Cada tipo tiene tres propiedades que te importan:

- **Un valor.** Lo que gana una petición satisfecha. Un pago gana mucho más que una vista de página.
- **Un perfil de coste.** Cuánta CPU necesita en un Servidor de aplicaciones y qué llamadas al backend hace.
- **Un objetivo de paciencia.** El objetivo de Apdex T, la latencia por debajo de la cual un usuario queda
  satisfecho. Mira [Apdex e ingresos](/explanation/apdex-and-revenue).

Cada Era trae nuevos tipos y cambia la mezcla. El Garaje sirve solo vistas de página y lecturas de API. Para
la Serie A, los usuarios también ven video, chatean y compran cosas:

::Mix{era="3"}

Las Funcionalidades, los Emprendimientos y las Palancas de producto cambian esa mezcla. Una palanca sube la
proporción de un tipo y toma la diferencia de los demás tipos, así que la demanda total se mantiene
([Eras e Investigación](/explanation/progression#making-a-kind-with-a-product-lever)).

Las páginas de referencia de [Eras](/eras) enumeran los tipos y las proporciones de cada Era. Los bots también
son un tipo. No ganan nada y no cuentan para Apdex, pero igualmente usan tu capacidad.

## Los Servidores de aplicaciones convierten las peticiones en trabajo de backend

Un Servidor de aplicaciones rara vez responde una petición por sí solo. Convierte cada petición en **tipos de
backend**: consultas de lectura, consultas de escritura, transacciones, búsquedas, lecturas y escrituras de
objetos, tareas, cobros, escaneos e inferencias. Una vista de página, por ejemplo, envía dos consultas de
lectura a la base de datos.

Los tipos de backend no ganan nada por sí mismos. Llevan carga al nivel de datos y a los servicios
gestionados. Una petición conserva su tipo original en cada salto, sin embargo, así que las consultas de
lectura que envía una vista de página siguen contando como tráfico de vista de página cuando la Analítica
muestrea la Base de datos. Por eso el Conocimiento tiene un tipo de petición
([Conocimiento y observabilidad](/explanation/observability)).

## La demanda sigue al reloj

La demanda es tu número de usuarios por las peticiones que envía cada usuario, moldeada por el reloj y la
mezcla:

```latex
\begin{aligned}
\text{demand} \left(\text{kind}\right) &= \text{users} \times \text{requests per user} \times \text{daily cycle} \times \text{weekly cycle} \\ &\quad \times \text{mix} \left(\text{kind}\right) \times \text{features}
\end{aligned}
```

El ciclo diario tiene su pico por la tarde y cae por la mañana, como el [tráfico diurno](/glossary/diurnal-traffic)
real. Un segundo de simulación es un minuto de calendario, así que un día completo pasa en 24 minutos reales a
velocidad normal. Eso te obliga a elegir: dimensionar para el pico y pagar capacidad ociosa por la noche, o
dejar que un [Autoescalador](/components/autoscaler) siga la curva. Tu Emprendimiento fija su propia curva, y
las Funcionalidades suben el uso de los tipos que tocan.

Los incidentes añaden demanda por encima. Un pico de tráfico la multiplica, y los ataques añaden tráfico de
bots.

## La resolución del flujo

Tu Diseño es un grafo sin bucles, y el tablero rechaza un Enlace que crearía uno. En cada Paso de una décima
de segundo de simulación, la resolución recorre el grafo desde los Usuarios, un Nodo a la vez, en orden. En
cada Nodo hace seis cosas:

1. **Llegar.** El Nodo recibe una tasa para cada tipo.
2. **Aceptar o dejar varado.** Un Nodo pasa de largo los tipos que no maneja. Si ningún Enlace de salida
   acepta un tipo, esas peticiones quedan **varadas** (`stranded`) y cuentan como errores.
3. **Servir.** El Nodo responde por sí mismo lo que puede. Una Caché responde sus aciertos.
4. **Transformar.** Un Servidor de aplicaciones convierte las peticiones en tipos de backend.
5. **Dividir.** El resto sale por los Enlaces. Un [Balanceador de carga](/components/lb) divide según su
   algoritmo, y un [API Gateway](/components/gw) divide según su tabla de rutas.
6. **Limitar.** La capacidad limita lo que procesa el Nodo. Mira
   [Capacidad, utilización y colas](/explanation/queues).

## Por qué una base de datos lenta llena tus Servidores de aplicaciones

Muchos runtimes retienen un worker o un hilo por cada petición hasta que vuelven todas las llamadas que hace.
Una petición ocupa por tanto un slot del Servidor de aplicaciones durante su propio tiempo de CPU más el
tiempo que espera a la base de datos. Esta es la [ley de Little](/glossary/littles-law): los slots en uso
equivalen a la tasa de llegada por el tiempo que se queda cada petición.

Eso forma un círculo. La capacidad del Servidor de aplicaciones depende de la latencia de la base de datos, y
la latencia de la base de datos depende de cuánto envían los Servidores de aplicaciones. La resolución
recorre el grafo varias veces por Paso y mezcla las latencias de las llamadas hasta que se asientan.

:::Note{tone="real"}
"La base de datos va lenta" suele verse en producción como "los servidores de aplicaciones están llenos". Los
servidores de aplicaciones están ocupados esperando, no calculando, así que añadir más solo manda más carga a
la base de datos.
:::

::Quiz{question="Tus Servidores de aplicaciones muestran barras de carga llenas y tu Base de datos está en ámbar. Los Servidores de aplicaciones ejecutan PHP-FPM. ¿Cuál es la solución más probable?" options="Añadir más Servidores de aplicaciones|Hacer más rápida la Base de datos|Subir la tasa de peticiones de los Usuarios" answer="2" explain="Cada worker de PHP-FPM espera sus llamadas a la base de datos. Una base de datos más rápida libera a los workers, mientras que más Servidores de aplicaciones envían aún más carga a la base de datos."}

Los runtimes que esperan sin retener un slot, como Node.js o Go, rompen este acoplamiento. Las páginas de
[Runtimes](/runtimes) muestran qué modelo usa cada runtime.

## El marcador de cuello de botella

El tablero marca un Nodo como el **cuello de botella**: el Nodo que más ingresos te cuesta. La Simulación lo
encuentra con un análisis de sensibilidad. Una vez por segundo de simulación, toma los tres Nodos más
ocupados por encima del 60% de utilización, vuelve a resolver todo el Diseño con cada uno al doble de
capacidad y se queda con el Nodo cuyo refuerzo gana más.

El marcador señala el cambio que compensaría, que no siempre es la tarjeta más roja. Un Nodo al 95% que
alimenta a otro Nodo aún más lento puede no ganar nada con más capacidad. Para un método paso a paso, mira
[Encontrar el cuello de botella](/guides/find-the-bottleneck).

## El mismo Diseño da el mismo resultado

El modelo es determinista. Un generador aleatorio con semilla guardado en la partida decide el momento y los
objetivos de los incidentes, y todo lo demás se deduce del Diseño y del reloj. La Simulación usa solo
aritmética exacta, así que todos los navegadores y el servidor calculan el mismo Libro mayor a partir de las
mismas acciones. Eso es lo que hace justas las puntuaciones de los Desafíos.
