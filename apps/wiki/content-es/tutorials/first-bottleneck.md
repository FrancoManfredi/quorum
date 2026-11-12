---
title: Tu primer cuello de botella
summary: Encuentra el límite de la máquina del Garaje, mueve la base de datos a su propio Nodo y saca la máquina de Burstable cuando se le acaban los créditos de CPU.
section: tutorials
order: 2
era: 0
aliases: first bottleneck, out of ram, swapping, split the database, cpu credits, burstable, vertical scaling, primer cuello de botella, sin ram, separar la base de datos, créditos de cpu, escalado vertical
gdd: /design/10-progression
---

En esta lección encuentras el Nodo que limita tu Diseño, averiguas por qué y lo arreglas. El Garaje te
da dos límites que superar, primero la memoria y luego los créditos de CPU, así que parte de la Empresa
que creaste en [Tu primera Empresa](/tutorials/first-company).

## Espera al primer límite

1. Mantén el juego en marcha y cobra tus ingresos.
2. Mira la tarjeta del Servidor de aplicaciones. Con unos cientos de usuarios, su fila **Carga** salta
   y la fila pasa a ámbar o rojo.
3. Mira el Servidor de aplicaciones. Su contorno empieza a pulsar en ámbar.

El cuello de botella es el único Nodo que más ingresos te cuesta ahora. Mira
[Cómo fluyen las peticiones](/explanation/requests) para ver cómo lo encuentra el juego.

Cuando la máquina es el cuello de botella por primera vez, el botón de redimensionar de la parte
inferior de su tarjeta brilla. No hagas clic todavía. Primero averigua por qué la máquina está llena.

## Lee la causa

1. Selecciona el Servidor de aplicaciones. Se abre el Inspector.
2. Lee el cuadro rojo bajo el título. Dice **Sin RAM y en swap: cada petición va más lenta.**
3. Busca la sección **Recursos**. El medidor de **RAM** está lleno.

El Servidor de aplicaciones y PostgreSQL comparten una máquina, y la base de datos mantiene más datos
en memoria a medida que crecen tus usuarios, así que a la máquina se le acaba la RAM. Pasa memoria a
disco, lo que se llama swap, y cada petición se ralentiza. En el HUD, el **Apdex** cae por debajo de su
objetivo y **Usuarios** muestra un ▼, porque los usuarios se van mientras esperas.

## Mueve la base de datos a su propio Nodo

El primer arreglo es darle a la base de datos su propia máquina, que es lo que hacen la mayoría de los
equipos al principio.

1. En el dock de construcción de la parte inferior, selecciona el grupo **Datos**. También puedes
   pulsar su tecla numérica. Cada elección arma una pieza, así que elige de nuevo por cada Nodo que
   coloques.
2. Selecciona **Base de datos** en la lista. Su precio aparece a la derecha de la fila.
3. Haz clic en el tablero a la derecha del Servidor de aplicaciones. Aparece la tarjeta de la Base de
   datos.
4. Busca el puerto de salida azul en la tarjeta del Servidor de aplicaciones.
5. Arrastra desde ese puerto hasta la tarjeta de la Base de datos. Aparece un Enlace. Para cortar un
   Enlace más adelante, haz clic en él y luego en la **x** que aparece sobre él, o pulsa **Supr**.

Cuando enlazas la primera máquina a una Base de datos, PostgreSQL sale de la máquina para siempre.
Selecciona de nuevo el Servidor de aplicaciones. El cuadro rojo ha desaparecido y el medidor de **RAM**
está lejos de llenarse.

Ahora vigila el HUD durante medio minuto:

- El **Apdex** vuelve a subir por encima de su objetivo.
- **Usuarios** vuelve a mostrar un ▲.
- El contorno sale del Servidor de aplicaciones, o ningún Nodo lo tiene.

Si te equivocas, pulsa **Z** para deshacer. Deshacer en menos de 30 segundos reembolsa el coste completo.

:::Note{tone="real"}
Una máquina para la aplicación y la base de datos es como empiezan la mayoría de los productos. Sacar la
base de datos es el primer paso de escalado clásico. Cada pieza puede crecer por su cuenta.
:::

## Espera al segundo límite

El Servidor de aplicaciones es una máquina Burstable. Gana créditos de CPU mientras está ocioso, y los
gasta cuando trabaja duro. Cuando se acaban los créditos, la máquina funciona con una pequeña fracción
de su CPU.

1. Mantén el juego en marcha. Cobra tus ingresos.
2. Selecciona el Servidor de aplicaciones de vez en cuando. Vigila el medidor de **Créditos de CPU** en
   **Recursos**. Baja a medida que crece tu tráfico.
3. Cuando el medidor está vacío, el Inspector muestra **Sin créditos de CPU: limitado al 20% de CPU.**

La fila **Carga** se pone roja y el contorno vuelve al Servidor de aplicaciones.

## Deja Burstable

1. Selecciona el Servidor de aplicaciones.
2. Busca la sección **Instancia** en el Inspector. Muestra cinco familias: **Burstable**, **General**,
   **Cómputo**, **Memoria** y **ARM**. ARM necesita investigación.
3. Selecciona **General**.
4. Si se abre una tarjeta de Tradeoff, lee su vista previa y selecciona **Confirmar**.

La máquina se reinicia un rato, así que su tráfico cae un momento. Después, el medidor de **Créditos de
CPU** desaparece y la fila **Carga** baja. Una máquina General cuesta más por segundo que una Burstable,
pero nunca se limita.

También puedes hacer la máquina más grande. Selecciona **Más grande** en la sección **Instancia**, o
pulsa **U** con el Nodo seleccionado. Una máquina más grande tiene más CPU y RAM, y un precio más alto.
Es el [escalado vertical](/glossary/vertical-and-horizontal-scaling).

El botón de tamaño del pie de la tarjeta solo compra si lo mantienes pulsado unos 0.6 segundos, así que
un clic rápido no hace nada. Sigue pulsando para comprar más tamaños.

Dos Sandboxes guiados repiten esta lección en un tablero fijo: [Sin créditos](/sandboxes/out-of-credits)
y [Máquina compartida](/sandboxes/shared-box). [Cómo fluyen las peticiones](/explanation/requests)
explica el recorrido de Usuarios a los datos que ya has hecho dos veces, y
[Tu primer incidente](/tutorials/first-incident) empieza en el momento en que esta Empresa levanta su
ronda Pre-semilla.
