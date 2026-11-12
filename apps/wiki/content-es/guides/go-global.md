---
title: Dar el salto global
summary: Atiende a usuarios de otros continentes desde la Serie C, con una segunda región, GeoDNS, copias locales de tu Diseño y datos que sobreviven a una caída de región.
section: guides
order: 9
era: 5
aliases: second region, regions, multi-region, geodns, latency abroad, europe, apac, region outage, mirror, anycast, segunda región, regiones, multirregión, latencia en el extranjero, caída de región, espejo
gdd: /design/10-progression
---

Usa esta guía cuando llegas a la Era Serie C y los usuarios del extranjero van lentos, o cuando
necesitas sobrevivir a una caída de región.

Desde la Serie C, los usuarios viven en cuatro regiones: Norteamérica, Europa, Asia-Pacífico y
Sudamérica. Cada región crece o se encoge según su propio Apdex, y
[Usuarios y crecimiento](/explanation/users-and-growth) explica por qué los usuarios se van tan
rápido cuando cae. Todos los usuarios siguen entrando al principio por tu región de origen, así que
un usuario lejano paga el viaje de ida y vuelta por el océano dos veces en cada petición.

## Averigua quién va lento

1. Selecciona **Usuarios** en el HUD para abrir **Por qué se van los usuarios**, y busca filas de
   regiones lejanas.
2. Selecciona el Nodo **Usuarios** y abre **Peticiones**. Compara la latencia media de cada tipo con
   las cifras de antes de la Serie C.
3. Lee la página [Serie C](/eras/series-c) para ver qué parte de tus usuarios tiene cada región.

Más capacidad no ayuda, porque el retraso es distancia, así que atiende a los usuarios desde una
región cercana a ellos.

## Abre una segunda región

1. Investiga [Múltiples regiones](/research/multi-region), que necesita
   [Múltiples zonas](/research/multi-az).
2. Busca las pestañas de región en la parte superior del tablero. Las regiones cerradas salen como
   **+ EU**, **+ APAC** y **+ SA**.
3. Haz clic en la región con más usuarios lentos. Su tooltip muestra el precio, y el juego abre la
   región con un Nodo Usuarios propio.
4. Haz clic en la pestaña nueva para ver el tablero de esa región.

## Envía a los usuarios a su región

1. Investiga [GeoDNS](/research/geo-dns). Sin él, todos los usuarios siguen entrando por el Nodo
   Usuarios de origen. Con él, los usuarios de cada región entran por su propio Nodo Usuarios, o por
   el más cercano que esté activo.
2. En la pestaña nueva, coloca un Balanceador de carga y Servidores de aplicaciones, y enlaza a ellos
   el Nodo Usuarios de la región.
3. Selecciona un Nodo y abre su sección **Región** para moverlo a otra región abierta. Un Nodo que se
   mueve se reinicia.

El Proveedor de pagos, la API de LLM, el Proveedor de notificaciones push, el Proveedor de
autenticación, el CDN, la Analítica y los Pagos sirven a todas las regiones. No los copies.

## Decide dónde viven los datos

Un Servidor de aplicaciones en el extranjero que llama a la Base de datos de origen paga un viaje de
ida y vuelta entre regiones en cada consulta, así que elige un patrón para cada Nodo de datos:

| Patrón                            | Cómo                                                                                                                         | Compromiso                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Leer en local, escribir en origen | Coloca una [Réplica de lectura](/components/replica) en la región nueva. Enlaza las escrituras a la Base de datos de origen. | Lecturas rápidas. Las escrituras cruzan el océano. Algunas lecturas salen obsoletas. |
| Almacén sin líder                 | [Almacén de columnas anchas](/components/wide) con **Regiones** en **Distribuidas**.                                         | Quórums locales. Consistencia eventual entre regiones.                               |
| Almacén de consenso               | [SQL distribuido](/components/dsql) con **Regiones** en **Distribuidas**.                                                    | Correcto en todas partes. Escrituras lentas. Mucho más Gasto.                        |

Un almacén distribuido ejecuta nodos en hasta tres regiones y factura cada una, así que usa SQL
distribuido para los checkouts y un [almacén sin líder](/glossary/leaderless-replication) para los
feeds. Mira [El nivel de datos](/explanation/the-data-tier).

El Sandbox [Escritura perdida](/sandboxes/missed-write) pide que cada lectura de la API vea la última
escritura.

## Copia el Diseño con un Espejo

Construir cada región a mano es lento y se desvía, así que con
[Infraestructura como código](/research/infra-as-code) reflejas una región en otra.

1. Haz clic en **Espejo** junto a las pestañas de región.
2. Elige una herramienta IaC. Después, bajo "Espejo en … desde", elige la región de destino. Cada
   botón muestra su precio.
3. Para cada Nodo de datos, elige cómo lo copia el Espejo: **Réplica de lectura**, **Primario
   propio**, **Replicar** o **Llamar a la fuente**.
4. Haz clic en **Aplicar**. Los Nodos nuevos sirven tras el tiempo de aplicación.
5. Más tarde, un punto en una pestaña indica que la región se ha desviado de su origen. Aplica de
   nuevo, o mantén el cambio como excepción.

[GitOps](/research/gitops) sincroniza los Espejos por sí solo, todos a la vez o de forma
**Escalonado**.

## Sobrevive a una caída de región

Una [Caída de región](/incidents/region) tumba todos los Nodos de una región, salvo los Componentes
globales y los almacenes distribuidos en suficientes regiones.

1. Mantén Servidores de aplicaciones en al menos dos regiones, con GeoDNS activado.
2. Mantén disponibles en la otra región los datos que necesita: un almacén distribuido, o una réplica
   desde la que puedas servir.
3. Mantén capacidad de reserva en cada región. Los usuarios de la región caída pasan a la región
   activa más cercana.

Esa decisión fija tu [RPO y RTO](/glossary/rpo-and-rto): cuántos datos puedes perder y cuánto tardas
en volver a servir. Antes de la IPO, el simulacro de DR tumba a propósito tu región de origen, y
[Prepararse para un Exit](/guides/prepare-for-an-exit) cubre ese paso.

## Recorta el salto del usuario

- [Anycast](/research/anycast) quita 20 ms del salto del usuario en todas partes.
- [HTTP/3](/research/http3) reduce un 20% el salto hacia usuarios lejanos.
- Las llamadas entre regiones también cuestan [egress](/glossary/egress). Procura que los Servidores
  de aplicaciones de cada región llamen a sus propios datos.

Abre **Por qué se van los usuarios** otra vez: las filas de las regiones lejanas deben encogerse, y el
Apdex del HUD debe volver a su objetivo.

El Sandbox [Usuarios lejanos](/sandboxes/far-away) pone a la mitad de tus usuarios fuera de
Norteamérica. Consigue que las lecturas de la API queden por debajo de su límite de media.
