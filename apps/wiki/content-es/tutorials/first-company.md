---
title: Tu primera Empresa
summary: Funda una Empresa en el Garaje, lee el tablero, cobra tus primeros ingresos y crece hacia la primera ronda de financiación.
section: tutorials
order: 1
era: 0
aliases: first run, start, new game, garage, collect, payments, drawer, hud, primera partida, empezar, nueva partida, garaje, cobrar, pagos, cajón
gdd: /design/03-game-loops
---

Diez minutos, y nada que construir. Fundas una Empresa, lees las cuatro tarjetas del tablero y cobras
los ingresos que tus usuarios ya te pagan. El Garaje mantiene oculto el resto de la interfaz hasta que
lo necesites.

## Funda la Empresa

1. Abre Quorum. En la pantalla aparece un lector de tarjetas.
2. Haz clic en la tarjeta de **Fundador** para fichar. Se abre el menú principal.
3. Selecciona **Fundar una empresa**. Se abre la pantalla Nueva empresa.
4. Escribe un nombre en **Nombre de la empresa** y elige un logo. El logo aparece en la pantalla de
   título y en el menú del juego.
5. Deja seleccionado **B2B SaaS**. Es el único Emprendimiento al empezar. Los Mutadores están
   bloqueados hasta que los consigas.
6. Selecciona **Fundar** seguido del nombre de tu Empresa, en la parte inferior de la pantalla.

El tablero se abre en el **Garaje**, la primera [Era](/eras/garage). Al principio el juego solo muestra
unos pocos controles. El resto aparecen uno a uno, cuando resultan útiles.

## Lee el tablero

Hay cuatro Nodos en el tablero. Las peticiones empiezan en Usuarios, cruzan el Servidor de aplicaciones
y llegan a Analítica, de izquierda a derecha. Pagos está solo, y nada se enlaza a él.

- **Usuarios** es donde empieza el tráfico. Su tarjeta muestra tu número de usuarios, tu Apdex y las
  peticiones por segundo que envían los usuarios.
- **Servidor de aplicaciones** es tu única máquina. Ejecuta PHP bajo Apache, y la base de datos
  PostgreSQL corre en la misma máquina. Es una máquina Burstable pequeña y barata.
- **Analítica** muestrea el tráfico del Servidor de aplicaciones y lo convierte en Conocimiento.
- **Pagos** guarda los ingresos que pagan tus usuarios.

::Component{id="server"}

Selecciona el Servidor de aplicaciones y el Inspector se abre a la derecha con una fila **Carga** que
dice cuánta capacidad de la máquina está en uso. Bajo **Recursos** están los medidores de CPU, RAM y
créditos de CPU. Pulsa **Esc** para cerrarlo.

En el Garaje, los usuarios envían dos tipos de petición: vistas de página y lecturas de API.

::Mix{era="0"}

## Lee el HUD

El HUD es el panel de arriba a la izquierda. Al empezar muestra cuatro filas:

- **Caja**: el dinero que puedes gastar, y tu ingreso neto por segundo.
- **Usuarios**: tu número de usuarios, y un ▲ o un ▼ con la tendencia reciente.
- **Apdex**: lo satisfechos que están tus usuarios, de 0 a 1, junto al objetivo de la Era.
- **Latencia**: el tiempo medio en responder una petición.

La fila de arriba muestra el nombre de la Era y la hora del calendario. Un segundo de tiempo de juego
es un minuto en el calendario. La barra de debajo se llena a medida que tus usuarios se acercan a la
siguiente ronda de financiación.

Tu Empresa empieza con 150 usuarios y $300. Los usuarios crecen mientras el Apdex se mantiene igual o
por encima del objetivo, y se van cuando cae por debajo. Para saber el motivo, mira
[Apdex e ingresos](/explanation/apdex-and-revenue).

## Cobra tus ingresos

Los ingresos no pasan solos a la Caja. Esperan en el cajón de Pagos.

1. Espera unos treinta segundos. Mira la tarjeta de Pagos. Su fila **Cajón** se llena.
2. Busca el botón en la parte inferior de la tarjeta de Pagos. Dice **Cobrar** y una cantidad.
3. Haz clic en **Cobrar**. Un aviso confirma la cantidad, y la fila Caja del HUD sube.

También puedes pulsar **C** en cualquier punto del tablero para cobrar.

El cajón guarda cerca de un minuto de ingresos, y lo que pase de ahí se derrama y se pierde, así que
cobra al menos una vez por minuto mientras juegas. El juego te avisa cuando se derrama.

:::Note{tone="tip"}
Cuando el cajón está a medias por primera vez, el botón Cobrar brilla. El brillo es la única pista del
juego, y desaparece cuando usas el botón.
:::

## Controla el reloj

El reloj corre a 1×, y solo el menú o una ventana que pierde el foco lo detienen. Para pausarlo tú o
cambiar su velocidad, activa el **Modo fácil** en Ajustes:

- Pulsa **Espacio** para pausar y reanudar.
- Pulsa **S** para cambiar la velocidad. Cada pulsación pasa a la siguiente velocidad.

No cambia nada mientras el reloj está detenido.

## Mira cómo crecen tus usuarios

1. Sube la velocidad a un paso más rápido.
2. Cobra cuando se llene el cajón.
3. Mira la fila **Usuarios**. El número sube.
4. Mira la fila **Carga** del Servidor de aplicaciones. Sube con tus usuarios.

A medida que crece la carga, la máquina se acerca a su límite, y su fila pasa a ámbar al 70% y a rojo
al 90%. Pronto se agotará un recurso, y la siguiente lección trata de encontrar y arreglar ese límite.

## Conoce el objetivo

El Garaje termina en 1,000 usuarios. Cuando los alcanzas, aparece un botón de **Oferta Pre-semilla**
bajo el nombre de la Era en el HUD. Esa ronda la levantas en [Tu primer incidente](/tutorials/first-incident).

Pulsa **H** en cualquier momento para abrir **Cómo jugar**. Lista las teclas y las seis acciones
principales. Pulsa **Esc** sin nada abierto para llegar al **Menú**.

Quorum guarda esta Empresa cada 5 segundos de simulación, y se queda en **Empresas** cuando empiezas
otra desde la pantalla de título. [Mover una Empresa a otro navegador](/guides/move-a-company) la copia
como texto para una copia de seguridad o para otro navegador. [Tu primer cuello de botella](/tutorials/first-bottleneck)
continúa donde termina esta, cuando a la máquina se le acaba algo.
