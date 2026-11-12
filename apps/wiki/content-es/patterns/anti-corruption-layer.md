---
title: Capa anticorrupción
summary: Una capa anticorrupción traduce entre tu modelo y el de un sistema heredado o ajeno, para que el diseño antiguo no se filtre en el nuevo.
section: patterns
group: Outside the game
order: 1005
aliases: anti-corruption layer, acl, adapter, facade, translation layer, legacy integration, bounded context, capa anticorrupción, adaptador, fachada, capa de traducción, integración con sistemas heredados, contexto delimitado
---

Una capa anticorrupción (anti-corruption layer) es un adaptador entre dos subsistemas que no comparten el mismo modelo, y traduce llamadas y datos en ambas direcciones. Eric Evans la describió en Domain-Driven Design.

Úsala cuando un servicio nuevo tiene que hablar con algo cuyo modelo no quieres copiar. Un sistema de facturación heredado llama ACCT a un cliente y le pone un código de estado de cuatro letras, mientras que tu servicio nuevo tiene un Customer con un estado tipado. La capa asigna uno al otro en un solo lugar, así que el servicio nunca ve ACCT. Azure menciona el strangler fig como patrón relacionado: mientras sacas funciones de un sistema heredado pieza a pieza, la capa deja que lo viejo y lo nuevo se hablen sin cambios en ninguno de los dos.

Añade un componente que construir, desplegar y operar, y un salto en cada llamada. Puede convertirse en cuello de botella, y si los dos modelos se separan, su mapeo se pudre en silencio. Si los sistemas ya comparten conceptos, o la integración es pequeña y de corta vida, una llamada directa sale más barata. Planea eliminar la capa cuando el sistema heredado desaparezca.

## Lo más parecido en Quorum

El juego no tiene una capa de traducción. Lo más cercano es el movimiento que esta capa apoya, que es reemplazar poco a poco una pieza vieja. El [Patrón strangler](/patterns/strangler-pattern) enruta tráfico hacia código nuevo una porción cada vez, [Expand and contract](/patterns/expand-and-contract) cambia un esquema sin romper a los lectores, y la Investigación [Fronteras de servicio](/research/service-boundaries) separa una base de código en un Servicio con su propio equipo. Mira también [patrón strangler](/glossary/strangler-pattern) en el glosario.

## Referencias

- [Anti-Corruption Layer pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer): definición, origen en Domain-Driven Design y las contrapartidas.
- [Strangler Fig pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig): la migración incremental que apoya la capa, con una fachada que enruta entre lo viejo y lo nuevo.
- [Bounded Context, Martin Fowler](https://martinfowler.com/bliki/BoundedContext.html): por qué existen dos modelos del mismo concepto y necesitan un mapeo.
