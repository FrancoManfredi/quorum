---
title: Usuarios y crecimiento
summary: Por qué los usuarios crecen en una curva en S, por qué se van rápido cuando el Apdex cae y cómo las regiones cambian el crecimiento desde la Serie C.
section: explanation
order: 6
aliases: users, growth, churn, market, s-curve, fickle, steady, regions, going global, churn breakdown, word of mouth, usuarios, crecimiento, bajas, abandono, mercado, curva en S, volubles, constantes, regiones, ir global, desglose de bajas, boca a boca
gdd: /design/04-simulation
---

Los usuarios crecen solo mientras tu Diseño los mantiene contentos, y se van rápido cuando no. Toda moneda
depende de ellos: más usuarios envían más peticiones, ganan más ingresos y alimentan más Conocimiento.

## El crecimiento sigue una curva en S

Los usuarios nuevos vienen del boca a boca, así que cuantos más usuarios tienes, más gente oye hablar de ti.
El crecimiento también se frena al acercarte al tamaño del mercado, porque quedan menos personas por
conquistar. Juntas dan una curva en S:

```latex
\text{growth} = \text{rate} \times \text{users} \times \left(1 - \text{users} / \text{market}\right) \times \text{health}
```

Al principio, el crecimiento es lento porque poca gente habla de ti. En el medio es más rápido, y cerca del
tamaño del mercado se aplana. Cada Era tiene su propio tamaño de mercado y ritmo de crecimiento, y las
Funcionalidades que llegan a más gente amplían el mercado. Las páginas de referencia de [Eras](/eras)
enumeran ambos.

:::Note{tone="real"}
Los especialistas en marketing usan este modelo de difusión desde la década de 1960. En los productos reales,
unas pocas personas además lo adoptan sin ningún boca a boca. La fórmula deja fuera ese término, y tus
usuarios iniciales cumplen ese papel.
:::

## Salud: la prueba del Apdex

El término `health` compara el Apdex de tus usuarios durante la última hora de calendario con el objetivo de
la Era:

```latex
\begin{aligned}
\text{health} &= \frac{\text{Apdex} - \text{target}}{1 - \text{target}} && \qquad \text{kept between $-$1 and 1}
\end{aligned}
```

Por encima del objetivo, la salud es positiva y los usuarios crecen. Justo en el objetivo, el crecimiento se
detiene. Por debajo, la salud es negativa y los usuarios se van. El objetivo sube en cada Era, así que un
Diseño que era suficientemente bueno en el Garaje no lo es más adelante.

Las bajas no tienen término de mercado. Los usuarios descontentos se van a un ritmo proporcional a lo lejos
que estás por debajo del objetivo, sin importar tu tamaño. Esa asimetría es la presión principal de Quorum:
crecer lleva horas, y una mala tarde puede deshacer mucho de ello.

::Quiz{question="El Apdex de tus usuarios está justo por debajo del objetivo de la Era. Ninguna tarjeta está en rojo y nada falla. ¿Qué pasa con tus usuarios?" options="Se mantienen estables|Crecen despacio|Se van" answer="3" explain="Cualquier Apdex por debajo del objetivo vuelve negativa la salud, así que los usuarios se van. No hace falta una caída: las peticiones lentas bastan para causar bajas."}

## Usuarios volubles y constantes

La mitad de tus usuarios nuevos son volubles y el resto son constantes. Los usuarios constantes se van a una
pequeña fracción del ritmo de los volubles, así que con un mal Apdex se van primero los volubles. Los
usuarios que se quedan son más constantes, y la siguiente mala racha te cuesta menos.

Los datos reales de retención muestran lo mismo. Peter Fader y Bruce Hardie mostraron en 2007 que la
retención sube con la antigüedad sobre todo porque los clientes menos leales se van primero, y no porque cada
cliente se vuelva más leal.

## Cosas que aceleran el crecimiento

- **Financiación.** Una Era que empezó con una ronda aceptada crece al ritmo completo, y una que empezó con
  una ronda rechazada crece más despacio. Mira [Caja, Gasto y financiación](/explanation/money).
- **Funcionalidades.** Algunas aumentan el crecimiento o el mercado, y algunas reducen las bajas. Mira la
  referencia del [Equipo](/team#features).
- **Investigación.** La [Analítica de embudos](/research/funnels) aumenta el crecimiento.
- **Legado.** La ventaja Reputación del fundador aumenta el crecimiento en todas las Empresas posteriores.
  Mira [Prestigio](/prestige#perks).

## Cuando la Empresa está cerrada

El reloj se detiene cuando cierras la Empresa, así que los usuarios ni crecen ni se van mientras estás fuera.
Una partida guardada se reanuda en el Paso que contiene, y la curva de crecimiento continúa desde ahí. Nada
cambia en tu Empresa entre sesiones.

## Ir global

En la Serie C, tus usuarios viven en cuatro continentes. Tus usuarios actuales se quedan en Norteamérica, donde
empezó la Empresa, y cada otra región empieza con una pequeña semilla de usuarios. Cada región tiene entonces
su propio número de usuarios, cuota de mercado y Apdex, y la fórmula de crecimiento se ejecuta por región.
Tres reglas hacen que esto funcione como en la realidad:

- **Cada región tiene su pico en su propia tarde.** La demanda sigue al sol, así que tu hora tranquila en
  casa es el pico de otra persona.
- **El Apdex de una región cuenta las peticiones de sus propios usuarios, donde sea que las sirvas.** Un
  usuario europeo cuya lectura cruza el océano hasta Norteamérica paga dos viajes de ida y vuelta en el salto
  de internet. Ese usuario cuenta en el Apdex de Europa, y los usuarios de Europa se van si es demasiado
  lento.
- **El boca a boca cruza fronteras.** Una región crece sobre todo por sus propios usuarios, y un poco por tus
  usuarios de todas las demás. Una región que perdió a sus usuarios puede recuperarse cuando la sirves bien.

Así que una región lejana puede caer por debajo del objetivo mientras todos los Nodos del tablero de origen
están en verde. Sirve a esos usuarios cerca: abre la región y usa [GeoDNS](/research/geo-dns) para enviar a
los usuarios de cada región a su propia región. Mira [Dar el salto global](/guides/go-global).

::Sandbox{id="far-away"}

## El Desglose de bajas

Los usuarios pueden irse sin ninguna caída y sin ningún Nodo en rojo, así que el **Desglose de bajas** te da
una respuesta directa. Se abre desde la cifra de Usuarios y enumera, para cada región, las filas que quitan
puntos de Apdex: una fila por tipo de petición y causa.

- `far` significa el viaje de ida y vuelta a un Diseño en otra región.
- `slow` significa el tiempo gastado dentro de tu Diseño.
- `failed` significa errores. Con [Logs estructurados](/research/logs), nombra la causa del error.

Las filas suman el Apdex que te falta. La cabecera muestra el ritmo actual y una previsión para un día de
calendario, con la misma fórmula que usa la Simulación. Arregla primero las filas de arriba.
