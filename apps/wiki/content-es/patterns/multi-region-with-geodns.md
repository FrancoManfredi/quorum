---
title: Multirregión con GeoDNS
summary: Abre una segunda región, dirige a ella los Usuarios de cada zona con GeoDNS y mantén las lecturas locales, para que los Usuarios lejanos dejen de pagar el océano dos veces en cada petición.
section: patterns
group: Scaling steps
order: 130
aliases: geodns, regions, latency abroad, europe, region tab, round trip, read replica abroad, anycast, geo routing, regiones, latencia en el extranjero, Europa, ida y vuelta, enrutado geográfico, multirregión
---

Ejecuta una copia del stack cerca de cada gran grupo de Usuarios, y deja que GeoDNS los envíe allí.

## Cuándo dar el paso

- Los Usuarios de otro continente van lentos y las barras de carga se ven sanas, así que el retraso es la distancia.
- **Por qué se van los usuarios** lista las regiones lejanas arriba del todo.
- La petición de un Usuario lejano paga el viaje de ida y vuelta dos veces, una para abrir la conexión y otra para preguntar.

## El Diseño

Antes, todos los Usuarios entran por la región de origen.

::Design{id="far-users"}

Después, los Usuarios europeos entran por su propio Nodo de Usuarios.

::Design{id="geodns-two-regions"}

La imagen muestra la pestaña de origen. Los Nodos en Europa llevan una etiqueta EU y el viaje de ida y vuelta para llegar a ellos, y un enlace entre regiones muestra su coste bajo la cinta. El Servidor de aplicaciones europeo lee de una réplica local y escribe en la primaria de origen.

## Por qué funciona

Con GeoDNS, los Usuarios de cada región entran por su propio Nodo de Usuarios, o por el más cercano que esté activo. Su Servidor de aplicaciones está a su lado, así que las llamadas se saltan el océano. Una réplica responde las lecturas en casa. Las regiones sin un Nodo propio, como Asia-Pacífico aquí, siguen llegando al más cercano y pagan su viaje, que el Apdex de esa región refleja.

## Qué cuesta

Las escrituras siguen cruzando a la primaria, y algunas lecturas de réplica llegan desactualizadas. Las llamadas entre regiones facturan egress, así que haz que el Servidor de aplicaciones de cada región llame a sus propios datos. Cada región abierta cuesta Caja abrirla y suma el Gasto de cada Nodo que copies en ella. El Espejo copia una región por ti y luego se desvía, y una caída de Región tumba todos los Nodos que contiene y que no sean globales.

## En Quorum

Fija la **Región** de un Nodo y coloca allí un Nodo de Usuarios. Investiga [Múltiples zonas](/research/multi-az), [Múltiples regiones](/research/multi-region), [GeoDNS](/research/geo-dns) e [Infraestructura como código](/research/infra-as-code). Sigue [Dar el salto global](/guides/go-global) y lee [GeoDNS](/glossary/geodns). El siguiente paso, [cómputo en el edge](/patterns/compute-at-the-edge), mueve pequeños manejadores junto al usuario.
