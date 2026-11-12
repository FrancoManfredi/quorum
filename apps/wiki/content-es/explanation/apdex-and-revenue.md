---
title: Apdex e ingresos
summary: Cómo la latencia se convierte en dinero, por qué una petición lenta paga la mitad y dónde esperan tus ingresos antes de volverse Caja.
section: explanation
order: 5
aliases: apdex, revenue, income, satisfied, tolerating, frustrated, payments drawer, collect, value per request, ingresos, satisfecho, tolerante, frustrado, cajón de pagos, cobrar, valor por petición
gdd: /design/04-simulation
---

Una respuesta lenta paga menos que una rápida, y una respuesta muy lenta no paga nada. Una petición gana su
valor completo solo si el usuario recibe la respuesta con la rapidez suficiente. Quorum mide ese "con la
rapidez suficiente" con Apdex, una puntuación estándar de la industria, y usa la misma puntuación para
decidir si los usuarios se quedan.

## Satisfechas, toleradas, frustradas

Cada tipo de petición tiene un tiempo objetivo, T. La T de una vista de página es más larga que la de una
lectura de API, porque la gente espera que una página tarde un momento. Cada petición servida cae en una
de estas clases:

| Clase      | Condición                  | Qué gana             |
| ---------- | -------------------------- | -------------------- |
| Satisfecha | Latencia hasta T           | Su valor íntegro     |
| Tolerada   | Latencia sobre T, hasta 4T | La mitad de su valor |
| Frustrada  | Latencia sobre 4T          | Nada                 |
| Fallida    | Cualquier error            | Nada                 |

[Apdex](/glossary/apdex) es la proporción de peticiones satisfechas más la mitad de la proporción de las
toleradas:

```latex
\text{Apdex} = \frac{\text{satisfied} + \text{tolerating} / 2}{\text{total}}
```

Un Apdex de 1 significa que todos los usuarios quedaron satisfechos. Un Apdex de 0.5 puede significar que
todos los usuarios toleraron la espera, o que la mitad quedó satisfecha y la otra mitad se rindió.

::Quiz{question="Una lectura de API tiene un objetivo T de 200 ms. Una lectura responde en 500 ms. ¿Qué gana?" options="Su valor íntegro|La mitad de su valor|Nada" answer="2" explain="500 ms supera T pero no 4T (800 ms), así que la petición es tolerada y gana la mitad."}

## Por qué Apdex y no la latencia media

La latencia media mezcla a todos en un solo número, mientras que Apdex cuenta personas. Un usuario que esperó
5 segundos está perdido sin importar lo rápidos que fueran los demás, así que Apdex le da cero a esa
petición. Un usuario que esperó un poco de más no está perdido, así que Apdex le da medio punto.

Apdex también encaja con cómo Quorum calcula la latencia. Los tiempos de respuesta se reparten a lo largo
de una curva, así que una parte de cada tipo siempre es más lenta que su objetivo. Para cada tipo, la
Simulación calcula la proporción exacta de peticiones respondidas por debajo de T y por debajo de 4T. Esa
proporción cae de forma suave a medida que un Nodo se llena, mucho antes de que el promedio se vea mal.
Mira [Latencia y percentiles](/explanation/latency).

Los bots no cuentan para Apdex. Los tipos que pasan por una Cola, como las subidas y las exportaciones, se
puntúan por el momento en que su resultado está listo, no por el encolado.

## Cuánto vale una petición

Los ingresos son la suma, sobre todos los tipos, de su valor multiplicado por su crédito de Apdex:

```latex
\text{revenue} = \sum_{\text{kinds}} \text{rate} \times \text{value} \times \left(\text{satisfied} + \text{tolerating} / 2\right)
```

Los valores difieren mucho entre tipos. Un pago vale bastante más que una vista de página, y un bot no vale
nada, así que el mismo problema de latencia cuesta más en el camino del dinero. Tres cosas cambian el valor
de un tipo:

- **Funcionalidades.** Algunas Funcionalidades hacen que un tipo gane más. Mira la referencia del
  [Equipo](/team#features).
- **El Stack.** El framework que responde una petición puede cambiar lo que esta gana.
- **El Emprendimiento.** Cada Emprendimiento fija su propio valor por petición.

La Funcionalidad **Planes de pago** añade una segunda fuente: una suscripción por usuario de pago y por día
de calendario. No depende de las peticiones, así que suaviza los ingresos y premia que conserves usuarios.

:::Note{tone="real"}
La Apdex Alliance publicó la fórmula como estándar, y las herramientas de monitorización aún la reportan.
Los ingresos reales no se reducen a la mitad justo en T, pero la forma es la correcta. Un estudio de Google
de 2009 encontró que 400 ms de retraso extra reducían cuánto buscaba la gente, y la pérdida duraba incluso
después de que el retraso desapareciera.
:::

## Apdex también mueve a tus usuarios

La misma puntuación decide el crecimiento. Cada Era fija un objetivo de Apdex. Mientras el Apdex de tus
usuarios durante la última hora de calendario lo supere, los usuarios crecen, y cuando cae por debajo, se
van. Así que un Diseño lento pierde dinero dos veces: en cada petición y, de nuevo, cuando se van los
usuarios. Mira [Usuarios y crecimiento](/explanation/users-and-growth).

## El cajón de Pagos

Los ingresos esperan en el cajón de [Pagos](/components/payments), y tú seleccionas Cobrar para pasarlos a
la Caja. El cajón guarda alrededor de un minuto de ingresos al ritmo actual, y los tamaños mayores guardan
más. Los ingresos que llegan con el cajón lleno se pierden.

El cajón le da algo que hacer a los primeros minutos del Garaje, y luego se aparta del camino. La
investigación [Stripe Billing](/research/stripe) cobra automáticamente. El cajón nunca se llena mientras la
Empresa está cerrada, porque el reloj se detiene con ella. A dónde va la Caja después está en
[Caja, Gasto y financiación](/explanation/money).

## Cómo subir los ingresos

Los ingresos por segundo son la mejor nota para un cambio, así que compáralos antes y después, cuando el
sistema se haya estabilizado. La mayoría de las mejoras vienen de uno de tres movimientos:

1. Quita el cuello de botella, para que se respondan más peticiones.
2. Haz más rápidas las peticiones respondidas, para que más de ellas queden satisfechas.
3. Protege primero los tipos caros, para que una ralentización cueste vistas de página y no pagos.
