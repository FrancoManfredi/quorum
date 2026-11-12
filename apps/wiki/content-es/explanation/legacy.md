---
title: Por qué termina una Empresa
summary: Por qué cada Empresa termina en un Exit, cómo un Exit se convierte en Legado y cómo las Ventajas, los Emprendimientos y los Mutadores hacen distinta a la siguiente Empresa.
section: explanation
order: 13
era: 3
aliases: win, goal, end game, exit, legacy, prestige, acqui-hire, acquisition, ipo, step down, perks, legacy shop, ventures, mutators, founder, reset, new company, playbooks, ganar, objetivo, final del juego, legado, prestigio, adquisición, paso al lado, ventajas, tienda de legado, emprendimientos, mutadores, fundador, reinicio, nueva empresa
gdd: /design/13-prestige
---

Quorum no tiene fin, pero una Empresa sí. En algún momento la vendes, sales a bolsa o das un paso al lado, y
eso es un **Exit**. El Exit paga **Legado**, que se queda contigo como Fundador. El Legado compra Ventajas
permanentes. Todo Emprendimiento y todo Mutador está abierto cuando fundas una Empresa, así que la siguiente
Empresa puede jugar con reglas distintas sin esperar a una tienda.

Los juegos incrementales llaman prestigio a este patrón. Cada Empresa empieza de cero, y las Ventajas que
compraste con Legado pasan a la siguiente. Un Emprendimiento o un Mutador no cuesta nada: elige las reglas
que quieres aprender.

## Los cuatro Exits

| Exit                | Se ofrece desde | Paga sobre                   | Multiplicador | Después                   |
| ------------------- | --------------- | ---------------------------- | ------------- | ------------------------- |
| Acqui-hire          | Serie A         | Valoración, con tope de $50M | 0.5           | La Empresa termina        |
| Adquisición         | Serie B         | Valoración                   | 1             | La Empresa termina        |
| IPO                 | Pre-IPO         | Valoración al salir a bolsa  | 1.5           | La Empresa pasa a cotizar |
| Dar un paso al lado | Cotizada        | Valoración                   | 1.5 + bonus   | La Empresa termina        |

El pago es tu Participación por la Valoración por el multiplicador. Un Acqui-hire es una salida rápida
cuando quieres probar un Emprendimiento nuevo, y una Adquisición paga tu Valoración completa.

La IPO es la ronda de financiación Pre-IPO, así que no aparece en la lista de Exits. Necesita la lista de
comprobación de la IPO, paga Legado al salir a bolsa y la Empresa sigue adelante hacia la Era Cotizada en
bolsa. Una vez que cotizas, dar un paso al lado es la única salida. Paga solo el Legado que no cobraste ya
en la IPO, y cada trimestre de tu racha actual de previsiones superadas suma 0.1 a su multiplicador, hasta 1
más. [Caja, Gasto y financiación](/explanation/money) explica la Valoración y los trimestres.

## Del pago al Legado

```latex
\text{Legacy} = \operatorname{floor}\left(\sqrt{\text{payout} / \$1{,}000{,}000} \times \text{founding multiplier}\right)
```

Un pago de $1 millón da 1 de Legado. Un pago de $100 millones da 10, y $10,000 millones dan 100. La raíz
cuadrada significa que un mejor Exit paga más, pero solo cien veces el pago compra diez veces el Legado, así
que una sola partida enorme no vuelve inútiles las demás. El multiplicador de fundación sale de tu
Emprendimiento y tus Mutadores (mira más abajo).

:::Note{tone="real"}
Los fundadores reales enfrentan el mismo dilema. La participación es lo que vendes en cada ronda de
financiación, y tu parte en el Exit decide lo que te llevas a casa. Un fundador que levantó todas las rondas
posee una porción pequeña de una empresa grande, y uno que las rechazó posee una porción grande de una
empresa más pequeña.
:::

## Qué se reinicia y qué se queda

Un Exit termina la Empresa. La Caja, el Conocimiento, las Horas de desarrollo, los usuarios, la
Investigación, el tablero, el equipo y la Participación se reinician, y fundas una Empresa nueva en el
Garaje, o en Pre-semilla si compraste Ventaja inicial.

La Empresa con Exit se cierra. Su archivo sale de la lista de **Empresas** y no puedes continuarla, mientras
que todas las Empresas que no has terminado siguen en la lista, y puedes abrirlas en cualquier orden.

El Fundador conserva:

- El Legado y las Ventajas que compró.
- Los Playbooks: partes guardadas de un Diseño que puedes volver a colocar en una sola acción.
- Los logros, los resultados de los Desafíos y los términos del glosario que has encontrado.
- El historial de empresas: una fila por Exit, con su nombre, Emprendimiento, pago, Legado, pico de
  usuarios, Stack y una instantánea del tablero.

## Ventajas

La tienda de Legado vende Ventajas. Cada una tiene niveles, y cada nivel cuesta más Legado que el anterior.
Algunos ejemplos:

- **Red de ángeles** duplica tu Caja inicial por nivel.
- **Red de exalumnos** añade un ingeniero que se une cuando se abre la contratación.
- **Conocimiento institucional** conserva una Investigación de tu elección durante el siguiente Exit, por
  nivel.
- **Reconocimiento de patrones** añade un 20% de Conocimiento por nivel. **Reputación del fundador** añade
  un 10% de crecimiento de usuarios.
- **Mejores condiciones** quita 2 puntos a la dilución de cada ronda.
- **Turno de noche** añade un 10% de Horas de desarrollo por nivel, porque el equipo trabaja un segundo turno.
- **Dilatación temporal** desbloquea velocidades más rápidas de la Empresa.
- **Historias de guerra** reduce a la mitad el peso extra que dan los elementos de acción abiertos a los
  incidentes.
- **Ventaja inicial** funda la siguiente Empresa en Pre-semilla.

La referencia de [Prestigio](/prestige#perks) enumera cada Ventaja con sus precios.

## Los Emprendimientos cambian las reglas

Un **Emprendimiento** es el tipo de Empresa que fundas. Todos están abiertos, y B2B SaaS es el que viene por
defecto. Un Emprendimiento cambia lo que envían tus usuarios y cuándo:

- **Red social de consumo** tiene el doble de mercado y la mitad de valor por petición, con más contenido
  multimedia.
- **Fintech** tiene su pico en horario laboral y envía cuatro veces más compras.
- **Contenido en streaming** envía cuatro veces más contenido multimedia, así que el egress domina la
  factura.
- **Backend de videojuegos** envía cuatro veces más tráfico en tiempo real.
- **Startup de IA** tiene una demanda plana y el triple de prompts de IA.
- **Comercio electrónico** duplica las compras y las búsquedas.
- **Indie autofinanciado** no tiene rondas de financiación, y su Participación se mantiene en el 100%. El
  logro Vivo por defecto sigue marcando la partida: llega a la IPO sin levantar ninguna ronda.

Cada Emprendimiento tiene su propio multiplicador de Legado, que se muestra antes de fundar, y un
Emprendimiento más difícil paga más. La referencia de [Prestigio](/prestige#ventures) tiene los detalles.

## Los Mutadores lo hacen más difícil a cambio de más Legado

Un **Mutador** es una regla opcional que hace más difícil una Empresa. Cada uno suma al multiplicador de
fundación: el multiplicador del Emprendimiento por uno más la suma de las partes de los Mutadores. Todos los
Mutadores están abiertos al fundar, así que la única razón para elegir uno es la Empresa que quieres
dirigir.

Algunos ejemplos:

- **Sin cachés** elimina la Caché y la CDN.
- **Presupuesto ajustado** reduce a la mitad las subvenciones de financiación.
- **Una sola región para siempre** mantiene a la Empresa en una sola región.
- **SLO estricto** sube un nivel el SLO de cada Era.
- **Chaos Monkey** hace que los fallos de instancia dominen desde Semilla.
- **Postgres para todo** pregunta hasta dónde llega una sola base de datos relacional, una discusión entre
  ingenieros.

Cada uno fuerza un Diseño distinto.

Mira la referencia de [Prestigio](/prestige#mutators) para ver cada Mutador y su parte.

:::Note{tone="tip"}
El archivo de una Empresa se queda en este navegador. [Mover una Empresa a otro navegador](/guides/move-a-company)
lo copia como texto antes de que borres los datos del sitio.
:::

## Cuándo hacer un Exit

No hay un momento correcto único. Un Exit más tardío suele pagar más, pero la curva del Legado se aplana, así
que una Empresa nueva con mejores Ventajas puede ganar más por hora. [Tu primer Exit](/tutorials/first-exit)
te guía por uno, y [Prepararse para un Exit](/guides/prepare-for-an-exit) muestra cómo subir antes el pago.
