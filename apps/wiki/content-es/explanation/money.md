---
title: Caja, Gasto y financiación
summary: Cómo los ingresos se convierten en Caja, en qué se va tu Gasto, qué cuesta de verdad aceptar o rechazar una ronda y cómo se calcula la Valoración.
section: explanation
order: 9
aliases: cash, burn, money, funding, raise, decline, round, equity, dilution, valuation, rule of 40, margin, payments drawer, subscriptions, ipo, quarters, guidance, negative cash, caja, gasto, dinero, financiación, ronda, participación, dilución, valoración, regla del 40, margen, cajón de pagos, suscripciones, trimestres, previsión, caja negativa
gdd: /design/09-economy
---

La Caja es lo que gastas en el tablero. Las peticiones la traen, el Gasto la saca cada segundo, y las rondas
de financiación la suman en grandes saltos a cambio de Participación. Tu Valoración convierte todo esto en un
solo número, y ese número decide lo que paga un Exit.

## De dónde viene la Caja

**Ingresos por peticiones.** Cada petición servida gana el valor de su tipo, ponderado por Apdex: una
petición satisfecha gana todo, una tolerada la mitad. [Apdex e ingresos](/explanation/apdex-and-revenue)
explica la ponderación.

**El cajón de Pagos.** Los ingresos esperan primero en el cajón de Pagos, y haces clic en Cobrar para pasarlos
a la Caja. El cajón guarda 60 segundos de ingresos en el tamaño 1, y nunca menos de $25. Cada escalón de
tamaño lo duplica, y los ingresos que superan el tamaño del cajón se pierden. [Stripe Billing](/research/stripe)
cobra por ti, y desde entonces el cajón solo muestra el ritmo. El cajón nunca se llena mientras la Empresa
está cerrada, porque el reloj se detiene con ella.

**Suscripciones.** Cuando se publica la Funcionalidad Planes de pago, el 5% de tus usuarios paga un plan de
$24 por día de calendario. Estos ingresos no dependen de las peticiones, así que premian conservar usuarios
más que atender ráfagas.

**Las subvenciones de financiación** llegan con cada ronda que aceptas (mira más abajo). **Vender un Nodo**
devuelve la mitad de lo que costó colocar la última copia de su Componente.

## En qué se va el Gasto

El Gasto es la Caja total que gastas por segundo. Tiene cuatro partes:

- **La factura de la nube.** Cada Nodo cuesta Caja colocarlo y Caja por segundo mantenerlo en marcha. Cada
  copia de un Componente cuesta un 25% más de colocar que la anterior.
- **Los salarios.** El salario de cada ingeniero, escalado por su lenguaje. El fundador no cobra.
- **El egress.** Los bytes enviados a los usuarios cuestan dinero, lo que encarece el contenido multimedia sin
  una CDN.
- **Las tarifas de terceros.** Las tarifas del Proveedor de pagos, las del Proveedor de autenticación, los
  tokens de LLM y los mensajes push.

Los precios suben con cada Era mediante un índice de costes, y los salarios mediante un índice de salarios.
Ambos mantienen el Gasto como una parte real de los ingresos en cada tamaño de Empresa. Las páginas de
[Eras](/eras) muestran el índice de cada Era, e [Infraestructura](/infrastructure) muestra los precios de las
instancias. [Recortar la factura de la nube](/guides/cut-the-cloud-bill) muestra por dónde empezar a mirar.

## Quedarse sin Caja

Quedarse sin dinero nunca termina una Empresa. La Caja puede bajar de cero, el Gasto continúa, y el juego
rechaza todo lo que cuesta Caja, como colocar un Nodo o firmar una contratación, hasta que puedas pagar.
Vende los Nodos que no necesites, o haz crecer los ingresos.

Si sigues escaso, los inversores ofrecen una **ronda puente**: una subvención a cambio de una porción de tu
Participación. Si la aceptas, vuelves a tener margen. Si la dejas, la Empresa empieza a apagar Nodos, los más
caros primero, hasta que la factura deje de superar los ingresos. Un Nodo apagado no sirve nada y no factura
nada, y se queda en el tablero hasta que lo vendes o pagas para reemplazarlo. Aun así la Empresa sigue,
porque quedarse sin dinero es un revés, no el final de la partida.

## Rondas de financiación

Cada Era tiene un hito de usuarios. Cuando lo alcanzas, los inversores ofrecen la siguiente ronda, y tú
eliges:

- **Aceptar.** Recibes la subvención de la ronda, y tu Participación se reduce según la dilución de la ronda.
- **Rechazar.** Conservas tu Participación y no recibes subvención. La siguiente Era crece al 70% del ritmo
  normal.

La Era avanza en cualquier caso, así que sus nuevos tipos de petición y sus problemas llegan aunque hayas
aceptado o no. El dinero compra crecimiento y la Participación es el precio. La dilución se acumula a lo
largo de las rondas, y tu Participación en el Exit multiplica el pago. Las páginas de [Eras](/eras) enumeran
cada hito, subvención y dilución.

La IPO es la última ronda. Necesita la lista de comprobación de la IPO además del hito, no puedes rechazarla
y paga 1,000 segundos de tu Gasto actual.

:::Note{tone="real"}
La dilución de las rondas de Semilla a Serie C sigue las medianas publicadas por Carta. Paul Graham acuñó
"default alive" para una startup que puede llegar a ser rentable con el dinero que tiene. En Quorum, el logro
con ese nombre es para el jugador que llega a la IPO sin levantar ninguna ronda.
:::

El [Emprendimiento](/prestige#ventures) Indie autofinanciado no tiene rondas en absoluto. Su Participación se
mantiene en el 100%, y rechazar no le cuesta crecimiento.

## Cómo funciona la Valoración

Tu Valoración son los ingresos anuales por un múltiplo:

```latex
\begin{aligned}
\text{ARR} &= \text{revenue per calendar day} \times 365 \times 0.00015 \\
\text{multiple} &= 4 + 0.15 \times \operatorname{max}\left(0{,}\ \text{Rule of}\ 40\right) && \qquad \text{kept between 2 and 30} \\
\text{Valuation} &= \text{ARR} \times \text{multiple}
\end{aligned}
```

Los valores de las peticiones son dólares del juego, así que la Caja y los ingresos están muy por encima de
las cifras reales. El factor de escala convierte un año de ingresos del juego en el ARR en dólares reales que
reportaría una empresa de tu tamaño. La Caja, los ingresos y el Gasto usan dólares del juego, mientras que la
Valoración, los pagos de los Exits y el Legado usan dólares reales.

La [Regla del 40](/glossary/rule-of-40) suma dos números:

- **Crecimiento.** El crecimiento de usuarios durante la última semana de calendario, anualizado, en
  porcentaje.
- **Margen.** (ingresos − Gasto) / ingresos, en porcentaje. Sin ingresos, marca −100%. Mira el
  [margen operativo](/glossary/operating-margin).

Así que el múltiplo premia tanto el crecimiento como el beneficio. Al principio, el crecimiento lo sostiene, y
más adelante, cuando el crecimiento se frena, el margen decide tu Valoración.
[Relaciones con inversores](/research/investor-relations) suma 2 al múltiplo.

## Trimestres como empresa cotizada

La Era Cotizada en bolsa funciona en trimestres de 7 días de calendario. Al comienzo de cada trimestre fijas
la previsión: un objetivo de crecimiento de ingresos y un objetivo de margen. Al final, el mercado compara tus
resultados con ella. Superarla sube el múltiplo, más cuanto mayor sea la previsión, y cada cuarta vez
seguida añade un bonus. No alcanzarla lo baja. Los trimestres pueden mover el múltiplo como mucho 10 en
cualquier dirección. [Modelado de previsión](/research/guidance-modeling) muestra tu probabilidad de superar
cada nivel.

## Las tres monedas se mantienen separadas

La Caja, el Conocimiento y las Horas de desarrollo no se convierten entre sí. Los únicos puentes son que la
Caja contrata ingenieros y paga la Analítica. Mantenerlas separadas hace legible cada decisión: la Caja compra
capacidad, el Conocimiento compra saber y las Horas de desarrollo compran cambio. Mira
[Equipo y velocidad](/explanation/team-and-velocity) y [Eras e Investigación](/explanation/progression).
