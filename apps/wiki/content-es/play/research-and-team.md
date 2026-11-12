---
title: Paneles de Investigación y Equipo
summary: Lee el árbol de Investigación, inicia un Estudio y usa el panel de Equipo para contratar ingenieros, fijar políticas, gestionar el backlog y desplegar.
section: play
order: 9
aliases: research panel, team panel, start a study, hire, hire engineer, dev hours, backlog, autopilot, deploys, locked item, study queue, panel de investigación, panel de equipo, iniciar un estudio, contratar, contratar ingeniero, horas de desarrollo, piloto automático, despliegues, elemento bloqueado, cola de estudios
gdd: /design/15-ui-ux
---

Pulsa `R` para abrir Investigación y gastar Conocimiento en un Estudio. Pulsa `T` para abrir Equipo y gastar Horas de desarrollo en Funcionalidades. Los dos paneles llenan el tablero, y `Esc` los cierra.

## El panel de Investigación

El botón Investigación está en la barra de herramientas de arriba a la derecha. Aparece la primera vez que tu Conocimiento puede pagar un elemento, y una insignia cuenta los elementos que puedes permitirte. Antes de eso, `R` no hace nada.

![El panel de Investigación con el árbol a la izquierda y la barra lateral de detalle a la derecha](/play/research-panel.png)

Mira los chips de la cabecera. Cada chip es un pool de Conocimiento y la cantidad que tienes. Luego mira el árbol: cada línea crece hacia arriba desde su raíz, con una banda por Era. Las líneas son Infraestructura, Datos, Fiabilidad, Observabilidad, Rendimiento, Runtimes, Frameworks, Seguridad, Producto y Coste.

### Lee un elemento

Haz clic en un elemento para enfocarlo. La barra lateral de detalle de la derecha muestra:

- **Coste**: una fila por cada pool de la receta del elemento. Cada fila muestra el coste, cuánto tienes **en reserva** y la tasa que gana el pool por segundo. Una cantidad en reserva en ámbar significa que todavía no puedes pagar. Un tipo con una palanca de Producto también muestra esa palanca en su fila: el paso, la proporción del tráfico que toma el tipo y un botón **Construir**.
- **Requiere**: los elementos que debes tener antes. Haz clic en uno para saltar a él.
- **Lleva a**: lo que abre el elemento.

El botón principal de la barra lateral dice lo que puedes hacer ahora:

| Botón                             | Significado                                                                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Iniciar estudio**               | Puedes iniciarlo. El botón también muestra cuánto tarda.                                                                                 |
| **Estudiando · n%**               | Se está ejecutando ahora.                                                                                                                |
| **Estudiar ahora**                | Espera en la cola. Selecciónalo para pasarlo al principio, junto con cualquier requisito previo que espere.                              |
| **Se abre en** Era                | La Era todavía no ha empezado.                                                                                                           |
| **Estudiar después de** elementos | Falta un requisito previo. Selecciónalo para encolar primero los requisitos previos que faltan y luego el elemento. El botón los nombra. |
| **Investigado**                   | Ya lo tienes.                                                                                                                            |

Un elemento bloqueado no es un error. Te dice qué hacer a continuación: esperar a la Era, o encolarlo y dejar que se ejecuten antes sus requisitos previos. Cuando falta una cadena larga, el botón cuenta los requisitos previos en lugar de nombrarlos. Una advertencia en la barra lateral dice a qué espera un Estudio: un pool que no gana nada, o una forma que el Diseño todavía no muestra, como una Caché que nunca acierta o una Base de datos que dedica muy poco de su trabajo a lecturas. La barra lateral muestra lo lejos que está el Diseño del requisito, como **47% de 60%**, y **Encolar estudio** pone el elemento en la cola para que empiece cuando se cumpla el requisito. Para una cadena, nombra el primer Estudio que espera. Un pool deja de llenarse en su tope, así que el Conocimiento que acumules más allá de ese punto no gana nada más. Lee [Gana Conocimiento e investiga](/tutorials/research-and-insight) para saber de dónde sale el Conocimiento.

### Inicia y encola un Estudio

1. Pulsa `R`.
2. Haz clic en un elemento cuyo botón diga **Iniciar estudio**.
3. Selecciona **Iniciar estudio**. La tarjeta de Conocimiento del HUD muestra el nombre del Estudio y su porcentaje.
4. Pulsa `Esc` para volver al tablero. El Estudio sigue ejecutándose.

Para encolar más, elige otro elemento y selecciona su botón, o haz doble clic en él en el árbol. La cola admite ocho Estudios, una cadena cuenta cada Estudio que contiene, y un Estudio que no puedes pagar, al principio, retiene a todos los Estudios que tiene detrás, algo que te dice la barra lateral. Cada fila de la cola tiene los botones **Subir**, **Bajar** y **Cancelar**, y puedes arrastrar una fila a otro sitio. **Cancelar** pierde su progreso.

Un Estudio nunca sube por encima de un requisito previo que necesita. Su botón **Subir** se apaga, y un arrastre que pasaría por encima del requisito previo se rechaza con un aviso que lo nombra. Cancelar un requisito previo también cancela los Estudios encolados que lo necesitan.

### Sube el suministro de un pool

Un pool que no da abasto para un Estudio lo ralentiza, y el arreglo puede ser un cambio de producto en lugar de más muestras. Abre el elemento que se está ejecutando, y cada tipo con una **Palanca de producto** muestra una bajo su fila de Coste.

1. Lee la tarjeta bajo la fila del pool. Cuando el pool limita el Estudio, el título dice que el Conocimiento de ese tipo es demasiado bajo, y la línea de debajo da las dos tasas: lo que gana el pool por segundo y lo que necesita el Estudio. La última línea nombra lo que alcanza el siguiente paso en proporción del tráfico y lo que cuesta en crecimiento de usuarios.
2. Selecciona **Construir**. El paso se une al backlog del Equipo con las Horas de desarrollo de ese paso, y un Equipo las gasta en él.
3. Mira el panel de Equipo hasta que el elemento llegue a **En despliegue**. Cuando el despliegue aterriza, la proporción del tipo sube, su pool gana más deprisa y la tarjeta ofrece el siguiente paso. Un paso que la Era no ha abierto se queda en gris, y la tarjeta dice qué Era lo abre.
4. Para dar un paso atrás, selecciona **Quitar**. Quita el último paso y devuelve la mitad de sus Horas de desarrollo, y la proporción vuelve a los demás tipos.

Un paso que ya está en el backlog, el tope de un Emprendimiento y una mezcla bloqueada dejan cada uno el botón en gris con el motivo debajo. Un Desafío fija su mezcla, así que no muestra ninguna tarjeta de palanca.

## El panel de Equipo

El botón Equipo aparece después de que se despliegue tu primera Funcionalidad. Un punto ámbar sobre él significa que el backlog está vacío. Para las reglas que hay detrás de los números, lee [Equipo y velocidad](/explanation/team-and-velocity).

![El panel de Equipo: Servicios y Equipos a la izquierda, el Tablero y las Funcionalidades a la derecha](/play/team-panel.png)

La cabecera muestra tu saldo de Horas de desarrollo, su tasa por minuto y la nómina por segundo. El panel tiene dos mitades.

### La planta (izquierda)

La planta muestra una tarjeta por Equipo. Cada tarjeta enumera a sus ingenieros, empezando por el **Fundador** (etiquetado «Tú»). Cada ingeniero muestra un salario por segundo, o **En rampa** mientras es nuevo.

1. Selecciona **Contratar** en un puesto vacío. La etiqueta del puesto nombra el lenguaje, por ejemplo «Contratar un ingeniero de Python por $x». Dice **Bloqueado** hasta la Pre-semilla, y está en gris cuando no puedes pagar el coste de incorporación.
2. Para mover a un ingeniero, arrástralo a otro Equipo, o usa el botón de mover de su tarjeta.
3. Para enseñar a un ingeniero el lenguaje que ejecuta tu Servicio, o al que se está pasando una migración, pasa el cursor por su tarjeta y usa su botón **Aprender**. El botón muestra el lenguaje y el precio. El ingeniero trabaja a media velocidad hasta que se llena su anillo, y entonces adquiere el lenguaje. El botón está en gris cuando no puedes pagar.
4. Para despedir a alguien, pasa el cursor por su tarjeta y usa su botón **Despedir**.
5. Selecciona **Nuevo equipo** para añadir un Equipo. Un Equipo tiene un tipo: Producto, Plataforma, SRE, Datos o Seguridad.

Un equipo de Producto tiene tres políticas: **Avanzar rápido**, **Equilibrado** y **Calidad**. Intercambian velocidad por deuda y despliegues defectuosos. Los demás tipos operan el sistema y no construyen Funcionalidades: SRE lleva el pager, Datos gestiona el almacén, Plataforma gestiona Clústeres y despliegues, y Seguridad gestiona las reglas del WAF, el escaneo de dependencias y el cumplimiento. Contratar pronto para ir más rápido sale mal, porque más ingenieros cuestan nómina cada segundo y la coordinación ralentiza a un Equipo grande, así que lee [Equipo y velocidad](/explanation/team-and-velocity) antes de contratar un Equipo que no necesitas.

Un equipo de ocho ingenieros deja de empezar trabajo. Cada elemento que empieza espera tu aprobación, y el tablero del Equipo dice **Te toca: equipo demasiado grande**. Aprueba el elemento, o mueve ingenieros a otro equipo. En Núcleo el fundador es una persona extra, así que Núcleo espera a las nueve personas.

### El Tablero (derecha)

El Tablero tiene cuatro columnas: **Siguiente**, **En curso**, **En despliegue** y **En producción**.

1. Busca una ficha bajo **Funcionalidades**. Selecciona **Construir** para añadirla al backlog.
2. Mírala pasar a **En curso**. Los Equipos gastan Horas de desarrollo en ella.
3. Un elemento terminado espera en **En despliegue**. La tarjeta de despliegue dice **Desplegar en** y un tiempo, y luego la Funcionalidad pasa a **En producción**.
4. Usa el botón del rayo en un elemento del backlog para **Acelerarlo** con Horas de desarrollo. El trabajo acelerado termina ya y añade deuda técnica a su Servicio. Desde la Pre-semilla, una Funcionalidad acelerada hace más probable que su despliegue lance un bug. Usa **Cancelar** para descartarlo.

Bajo **Ingeniería**, selecciona **Encolar** en una ficha para pagar deuda técnica o arreglar una fuga. La fila aparece cuando algo necesita arreglo.

La tarjeta de despliegue también muestra una línea de **% de despliegues defectuosos**. Una cifra alta significa que un despliegue puede romper los Servidores de aplicaciones. El banner de despliegue defectuoso de la página siguiente muestra cómo revertir uno.

### Piloto automático

El interruptor **Piloto automático** de la cabecera del Tablero activa el modo automático del backlog. Se muestra cuando el backlog contiene dos elementos. Otros tres interruptores aparecen solo cuando tu ventaja de Piloto automático tiene el nivel para ellos:

- **Encolar el Estudio más barato**
- **Contratar mientras la nómina esté por debajo de un cuarto de los ingresos**
- **Comprar el siguiente tamaño para los Servidores de aplicaciones con más del 70% de carga**

Como la ventaja es una compra de [Legado](/explanation/legacy), una Empresa nueva no muestra ninguno.
