---
title: Correo, Cuadro de mando, Glosario, pager y pestañas de región
summary: Lee la Bandeja de entrada, el Cuadro de mando, el Glosario y el pager, y cambia entre pestañas de región.
section: play
order: 10
aliases: inbox, mail, spam, thread, dashboard, metrics, glossary, pager, alerts, incident bar, postmortem, region tabs, mirror, bandeja de entrada, correo, hilo, cuadro de mando, métricas, glosario, alertas, barra de incidente, pestañas de región, espejo
gdd: /design/15-ui-ux
---

Pulsa `I` para el Correo y `D` para el Cuadro de mando. El pager y las pestañas de región están en el propio tablero, así que nunca los abres.

## La Bandeja de entrada

La Bandeja de entrada es un botón en la parte inferior derecha del tablero, y su insignia cuenta el Correo sin leer. La insignia se pone roja cuando un mensaje espera tu decisión. Pulsa `I` para abrir el panel y `Esc` para cerrarlo.

![La Bandeja de entrada con sus carpetas a la izquierda y un mensaje abierto a la derecha](/play/mail.png)

Mira las carpetas de la parte superior: **Requiere acción**, **Información**, **Spam** y **Papelera**. Requiere acción contiene el Correo con un botón que cambia algo y que aún no tiene respuesta. Información contiene el resto.

Cada fila muestra la insignia de color del remitente, el remitente, la hora y el asunto. La forma y el glifo de la insignia indican el tipo de remitente: un proveedor de nube, una herramienta de monitorización, un proveedor, un compañero de equipo, un inversor, etcétera. El color viene de la empresa que parodia el remitente, así que lee también la etiqueta del tipo. El color nunca es la única señal.

El Correo sobre un mismo asunto de un mismo remitente es un **hilo**, y una repetición se une a él y muestra un contador en lugar de una fila nueva. Un hilo se resuelve cuando desaparece su causa, aunque se queda como registro.

Para responder a un mensaje:

1. Selecciona una fila. El lector se abre a la derecha.
2. Lee el cuerpo y luego los botones que hay debajo. **Ver en el tablero** selecciona el Nodo al que se refiere el mensaje.
3. Haz clic en un botón de acción, o pulsa su tecla numérica. `1` pulsa el primer botón, `2` el segundo, y así sucesivamente.

Una tecla numérica activa su botón incluso en un mensaje que no has leído, y ese botón ejecuta una acción real, como un cambio de tamaño o una ronda de financiación, así que lee primero.

| Tecla | Efecto en la Bandeja de entrada         |
| ----- | --------------------------------------- |
| `J`   | Mensaje siguiente                       |
| `K`   | Mensaje anterior                        |
| `E`   | Eliminar, o restaurar desde la Papelera |
| `S`   | Marcar como spam, o No es spam          |
| `Esc` | Cierra la Bandeja de entrada            |

El spam es Correo que ningún remitente real escribiría. Abrirlo no cuesta nada, pero actuar sobre una trampa sí. Cuando hay más de ocho hilos sin leer, los hilos de Información más antiguos se pliegan en una sola fila de **Resumen**. No se pierde nada, y el Resumen enumera cada uno.

## El Cuadro de mando

El Cuadro de mando se abre con `D`, después de investigar `metrics`. Es un conjunto de Gráficos a pantalla completa que muestra el Diseño a lo largo del tiempo.

![El Cuadro de mando con los botones de rango de tiempo, los interruptores y las señales doradas](/play/dashboard.png)

Léelo desde arriba:

1. **Rango de tiempo.** Elige **1h**, **6h**, **1d**, **7d** o **30d**. Son tiempos de calendario, así que una hora es aproximadamente un minuto de juego a velocidad 1×.
2. **Variables.** Los selectores acotan cada gráfico por tipo de petición, y por Servicio y región cuando tienes más de uno.
3. **Comparar** dibuja una línea tenue con el día de ayer en cada serie temporal.
4. **Tabla** convierte cada gráfico en una tabla con sus valores.
5. **Interruptores de anotación.** **Cambio de diseño**, **Despliegue**, **Incidente**, **Empresa** e **Investigación** dibujan cada uno un marcador vertical de color en cada serie temporal. Desactiva uno cuando los marcadores saturen la línea.

La primera fila contiene las señales doradas: Usuarios, Caja por segundo, Apdex, el Nodo más cargado, la tasa de error y el p99. Debajo hay una fila por cada Componente, y luego filas de Empresa e Incidentes. Para ver por qué se dobló una línea, activa los interruptores y busca el marcador justo antes de la curva. Lee [Leer el p99 y la latencia de cola](/guides/read-p99) para los gráficos de latencia.

Aparecen más gráficos con cada Investigación de visibilidad, y un gráfico sin su Investigación dice cuál necesita.

## El Glosario

El juego enlaza cada término de ingeniería con su página en el [Glosario](/glossary) de esta wiki. El botón con forma de libro de la barra de herramientas abre el índice, después de que veas tu primera tarjeta de Tradeoff.

Un chip de término en una tarjeta de Tradeoff, un chip `?` en un elemento de Investigación y un id de CVE en un aviso de seguridad abren su página en una pestaña nueva. Los avisos de seguridad aparecen en **Seguridad** dentro del índice.

Cada página explica qué significa el término en el trabajo y qué hace en Quorum, con términos relacionados y fuentes para seguir leyendo.

## El pager y la barra de incidente

Las alertas necesitan la Investigación `alerting`. Después, la franja superior del tablero lleva dos avisos, y solo uno de ellos es ruidoso.

La **barra de incidente** es roja porque un clic termina el incidente: nombra el incidente, su gravedad y el clic que lo detiene. Lleva un incidente a la vez, y un botón con una mira selecciona el Nodo al que golpeó el incidente. Una cascada añade una línea dentro de la barra, como «Vino después de Consulta lenta, que quedó sin atender.», para que el segundo aviso se lea como un segundo aviso.

Debajo, el **chip de alertas** se queda callado mientras salta una regla. Cuenta las reglas, nombra el primer síntoma y contiene dos botones. La marca de verificación confirma todas las reglas activas, lo que pliega el chip a un contador hasta que una de ellas se despeje. **Alertas** abre la fila de Alertas del Cuadro de mando.

![La barra de incidente roja y el chip de alertas silencioso en la franja superior](/play/pager.png)

El ajuste vive en el Cuadro de mando. La fila de Alertas contiene los tres umbrales de cada regla, lo que la regla lee ahora, cuánto tiempo lleva así y su estado. Una regla que dio demasiadas falsas alarmas muestra **Ignorado** en el chip y en esa fila; elige otro umbral ahí para volver a activarla.

La barra de incidente contiene un botón, el arreglo de un clic para el incidente que muestra:

- **Revertir**, en Despliegue defectuoso. Está en gris hasta que investigas CI.
- **Renovar**, **Aislar al líder**, **Cancelar migración**, **Fijar y volver a desplegar**, **Restaurar**, **Reiniciar**, **Reiniciar nodos**, **Hacer failover**, **Limitar conexiones** y **Mover el inicio de sesión**. Cada uno termina un incidente que le corresponde.

Los postmortems son Correo. Cuando termina el incidente, un compañero pregunta qué pasó, y ese mensaje contiene **Registrar el postmortem** y, a su lado, la acción pendiente. Dejar abierta la acción pendiente hace ese incidente el doble de probable.

Lee [Tu primer incidente](/tutorials/first-incident) para un recorrido completo.

## Pestañas de región

Desde la Serie C, con `multi-region` investigado, una barra de **Regiones** aparece en la franja superior. Cada región abierta es una pestaña con un nombre corto como NA o EU. Haz clic en una para ver el Tablero de esa región. Una región cerrada se lee «+ EU». Haz clic en ella para abrir la región, y pasa primero el cursor para leer su precio.

Con la infraestructura como código investigada, un botón **Espejo** se une a la barra, y [Dar el salto global](/guides/go-global) explica lo que copia. Un punto ámbar en una pestaña significa que esa región se ha desviado de su origen.
