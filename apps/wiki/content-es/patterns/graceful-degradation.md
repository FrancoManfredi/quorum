---
title: Degradación elegante
summary: Cuando un sistema no puede hacerlo todo, apaga primero las funciones costosas, para que el núcleo del producto siga funcionando.
section: patterns
group: Resilience
order: 508
aliases: degrade, degraded mode, fallback, brownout, feature shedding, degradar, modo degradado, alternativa, descarte de funciones
---

La degradación elegante (graceful degradation) descarta trabajo opcional a propósito cuando el sistema está bajo estrés, para que los usuarios conserven la parte que importa.

## Cuándo usarla

- Algunas funciones cuestan mucho más de lo que aportan, como las recomendaciones, las exportaciones o los informes.
- Un pico o una dependencia que falla amenaza a toda la página.
- Puedes mostrar algo útil sin la función, como un valor por defecto o una copia en caché.

## Cómo funciona

Cada función recibe un rango, y bajo presión el sistema apaga primero las de mayor coste y menor necesidad. La página de una tienda puede mostrarse sin el panel de recomendaciones, así que cuando el recomendador es lento, la página lo omite tras un plazo corto. Netflix muestra una fila genérica cuando la personalización está caída. El usuario ve menos, no nada.

## Qué cuesta

Alguien tiene que decidir qué funciones pueden irse, y eso es una decisión de producto, no de ingeniería. Los caminos degradados necesitan pruebas, porque un camino que nunca se ha ejecutado suele fallar la primera vez que importa. Un sistema degradado también puede parecer sano mientras pierde valor en silencio, así que cuenta cuántas veces se activa.

## En Quorum

::Design{id="degrade-dearest"}

**Drop dearest** está bajo **Overload** en un Servidor de aplicaciones. Pasada su línea de carga, el Servidor de aplicaciones descarta primero los tipos de petición que más CPU cuestan, para que los tipos baratos conserven su latencia. Frente al [Descarte de carga](/patterns/load-shedding), que descarta los tipos de menor valor, esto mantiene contenta a una parte mayor de los Usuarios cuando la causa son los tipos caros. Compara ambos pies de imagen: el Apdex es más alto aquí y los errores bajan, aunque los tipos descartados siguen contando como errores. Si un Nodo tiene ambos, degrada primero. [Degradación elegante](/research/graceful-degradation) necesita [Feature flags](/research/feature-flags). El glosario define la [degradación elegante](/glossary/graceful-degradation).
