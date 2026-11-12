---
title: Recortar la factura de la nube
summary: Encuentra las líneas que forman tu Gasto, quita capacidad ociosa, elige familias de instancia más baratas y baja el egress sin perder Apdex.
section: guides
order: 3
aliases: burn, cost, cloud bill, margin, save money, runway, egress, cheaper, spend less, gasto, coste, factura, margen, ahorrar, caja
gdd: /design/09-economy
---

Usa esta guía cuando el Gasto se acerca a los ingresos, tu margen de caja (runway) es corto, o
quieres un mejor [margen](/glossary/operating-margin) antes de un [Exit](/guides/prepare-for-an-exit).

El [Gasto](/explanation/money) es la Caja que gastas por segundo. Suma el precio de cada Nodo, tus
salarios, el egress y las tarifas de terceros. Cada recorte de esta guía tiene un coste en capacidad
o en riesgo, así que haz un cambio cada vez y comprueba el Apdex después de cada uno.

## Lee la factura

1. Mira la cifra de **Caja** en el HUD. La línea de debajo es tu ingreso neto por segundo, así que un
   valor negativo significa que el Gasto supera los ingresos.
2. Selecciona el Nodo **Pagos** para abrir el Inspector.
3. Lee las filas **Ingresos**, **Gasto** y **Salarios**. Los salarios forman parte del Gasto.
4. Pulsa **D** para abrir el Cuadro de mando, cuando ya tengas [Métricas](/research/metrics). El
   gráfico **Ingresos y gasto** muestra cuándo se abrió la brecha, y una línea azul marca cada cambio
   que hiciste.

Si los salarios son la mayor parte del Gasto, el problema no es el tablero: contrata menos ingenieros
o espera a que crezcan los ingresos. Mira [Equipo y velocidad](/explanation/team-and-velocity).

## Encuentra los Nodos caros

1. Selecciona cada Nodo por turno. La tarjeta de cada Nodo en el Inspector tiene una fila **Gasto**.
2. Compara la fila Gasto con la fila **Carga** del mismo Nodo.
3. Marca cada Nodo que cuesta mucho y trabaja por debajo del 50% de carga. Son tus primeros recortes.

Un Nodo con **Standby** cuesta el doble de su Gasto, y una Base de datos con **Copias de seguridad**
cuesta más que una sin ellas. Ambos son seguros deliberados, así que quítalos solo si aceptas el
riesgo.

## Quita capacidad ociosa

1. En un Nodo con tamaño y ocioso, abre la sección **Instancia** y selecciona **Más pequeño (gratis)**.
2. Espera unos segundos de tiempo de juego y comprueba que la Carga se queda por debajo del 70%.
3. Si tienes dos copias de un Nodo y ambas van holgadas, vende una: selecciónala y haz clic en el
   botón de la papelera. El reembolso es la mitad de lo que costó la última copia.

Si el Nodo pasa a ámbar o rojo tras el cambio, selecciona **Deshacer** (Z) enseguida.

:::Note{tone="warn"}
Un cambio de tamaño reinicia el Nodo durante un rato. Un Nodo único, sin segunda copia, pierde su
tráfico mientras se reinicia.
:::

## Elige una familia más barata

1. Abre la sección **Instancia** de un Servidor de aplicaciones, un Worker o una Base de datos.
2. Lee los medidores de **Recursos** antes de cambiar nada.
3. Elige la familia que encaje con el medidor lleno:
   - **Cómputo** cuesta 0.85 veces General por vCPU y tiene la mitad de RAM. Úsala cuando la CPU es
     el límite y sobra RAM.
   - **Burstable** cuesta 0.4 veces General. Funciona con créditos de CPU y cae a una fracción de su
     CPU cuando se acaban, así que úsala solo en un Nodo que está ocioso casi siempre.
   - **Memoria** cuesta 1.3 veces General. No es un recorte, pero una Base de datos cuyo conjunto de
     trabajo no cabe en RAM puede atender más en una máquina Memoria más pequeña.
4. Vigila el medidor **Créditos de CPU** en un Nodo Burstable. Si cae hacia cero, vuelve a General.

## Baja el egress

Desde la Era Semilla, cada byte que un Servidor de aplicaciones envía a internet cuesta
[egress](/glossary/egress), y el contenido multimedia y las vistas de página son lo que más envía.

1. Investiga [Compresión](/research/gzip), abre la sección **Compresión** de cada Servidor de
   aplicaciones y selecciona **Gzip**. Las respuestas de página y de lectura se hacen más pequeñas a
   cambio de algo más de CPU.
2. Investiga [Entrega de contenido](/research/cdn) y coloca un [CDN](/components/cdn) delante de los
   Servidores de aplicaciones. Las páginas que el CDN responde en el borde cuestan $0.02 por GB,
   frente a $0.09 por GB desde un Servidor de aplicaciones.
3. Mantén en la misma zona los Nodos que se llaman entre sí, porque una llamada entre zonas paga
   egress en ambos sentidos.

## Deja que la capacidad siga a la demanda

El tráfico sigue un ciclo diario, así que una flota dimensionada para el pico de la tarde está ociosa
por la noche.

1. Investiga [Autoescalado](/research/autoscaling) y coloca un [Autoescalador](/components/autoscaler).
2. Enlaza los Servidores de aplicaciones a él.
3. En **Escalado**, fija un **min** bajo y un **max** que cubra el pico. El Autoescalador quita copias
   cuando la carga cae bien por debajo del objetivo.
4. Más adelante, investiga [Orquestación de contenedores](/research/containers). Los Servidores de
   aplicaciones enlazados a un [Clúster de Kubernetes](/components/cluster) se agrupan en nodos
   compartidos y cuestan 0.85 veces su Gasto. Cada Clúster también consume horas de desarrollo hasta
   que tengas un equipo de plataforma.

## Recorta las líneas menores

- **Analítica.** Una **Tasa de muestreo** más alta da más Conocimiento y cuesta más Gasto de
  almacenamiento, así que bájala cuando ya tengas la Investigación que necesitas.
- **Proveedor de autenticación.** Cobra por usuario, así que con cifras de usuarios muy grandes,
  compara su fila Gasto con la CPU del Servidor de aplicaciones que ahorra.
- **Motor de búsqueda, Caché, Cola.** Cada escalón de tamaño duplica capacidad y Gasto, así que
  súbelos solo cuando su Carga pase del 70%.

Después comprueba la línea de Caja en el HUD, que debe subir, y asegúrate de que el Apdex se mantiene
igual o por encima de su objetivo, porque un recorte que pierde usuarios pierde más ingresos de los
que ahorra. Abre el Cuadro de mando, donde la línea de Gasto de **Ingresos y gasto** debe caer y
mantenerse baja durante el siguiente pico de la tarde.

El Sandbox [Sin créditos](/sandboxes/out-of-credits) termina con un límite de Gasto con el tráfico
nocturno. El Sandbox [Mayoría de lecturas](/sandboxes/read-mostly) duplica la demanda y fija un
límite de Gasto.
