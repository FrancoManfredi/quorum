---
title: Divide la base de datos por funcionalidad
summary: Da a cada funcionalidad su propio Servidor de aplicaciones y Base de datos, para que la carga y los fallos de una funcionalidad se queden en su propio carril.
section: patterns
group: Scaling steps
order: 115
aliases: federation, functional partitioning, database per service, split by domain, vertical partitioning, federación, particionado funcional, base de datos por servicio, dividir por dominio, particionado vertical
---

Enruta cada funcionalidad a sus propios servidores y a su propia Base de datos, para que la carga de navegación no pueda ralentizar los pedidos.

## Cuándo dar el paso

- Una tabla o una funcionalidad se lleva la mayor parte de la carga de la primaria, y un informe o una búsqueda lentos allí ralentizan los pagos.
- Los equipos se pisan porque comparten un esquema y un despliegue.
- Quieres dimensionar, ajustar y hacer fallar una funcionalidad sin tocar las demás.

## El Diseño

::Design{id="split-by-feature"}

Dividir por funcionalidad necesita dos Grupos de datos, porque un grupo guarda un conjunto de datos. El selector de
Base de datos de la tarjeta de Servicios decide qué grupo lee y escribe un Servicio, así que el Servicio de pedidos y el Servicio de
navegación poseen filas distintas. Un Balanceador de carga envía cada tipo de petición por un Enlace diferente, lo que
representa el enrutado por funcionalidad. El lado de navegación atiende páginas y lecturas, y el lado de pedidos atiende
escrituras y pagos. Cada Servidor de aplicaciones llama a su propia Base de datos, y solo pedidos llega al Proveedor de
pagos.

Las dos Bases de datos están en cajas distintas. Si estuvieran en la misma caja, un grupo guardaría un conjunto de datos: Con sharding
dividiría esas filas entre ambas Bases de datos, y Multi-leader copiaría cada fila en cada una, así que
nombrar a otro líder no eliminaría la penalización de coordinación de la base de datos compartida.

## Por qué funciona

Cada Base de datos guarda menos, así que su caché cabe en sus propias filas calientes y su barra de carga sigue a una funcionalidad. Un fallo en un carril deja al otro sirviendo. También puedes dar a la Base de datos de pedidos una configuración más robusta que a la del catálogo.

## Qué cuesta

Una consulta que hace join a través de la división deja de funcionar. La aplicación tiene que llamar a ambos lados y fusionar, y un cambio que toca a los dos ya no es una sola transacción. Cada Base de datos es un Nodo que operar y pagar. Mover una tabla más tarde es una migración de datos, así que elige las costuras siguiendo la propiedad, no las tablas.

## En Quorum

Dibújalo como arriba, con un ajuste de Enlace que lleve solo algunos tipos de petición desde un [Balanceador de carga](/components/lb). Las bases de código y los equipos separados llegan con [Fronteras de servicio](/research/service-boundaries). El patrón está en [Federación](/patterns/federation), y el movimiento contrario, repartir una tabla, es el [Sharding](/patterns/sharding). El siguiente paso saca el trabajo lento de la petición: [El trabajo lento, a una cola y a workers](/patterns/slow-work-to-a-queue-and-workers).
