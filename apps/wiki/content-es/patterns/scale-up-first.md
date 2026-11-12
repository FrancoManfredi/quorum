---
title: Escala primero hacia arriba
summary: Dale al Servidor de aplicaciones una instancia más grande antes de añadir una segunda. Es el cambio más barato que añade capacidad.
section: patterns
group: Scaling steps
order: 104
aliases: vertical scaling, scale up, bigger instance, resize, instance size, upgrade the server, escalado vertical, escalar hacia arriba, instancia más grande, cambiar tamaño, tamaño de instancia, mejorar el servidor
---

Cambia el Servidor de aplicaciones al siguiente tamaño de instancia antes de recurrir a una segunda máquina.

## Cuándo dar el paso

- La barra de CPU del Servidor de aplicaciones está llena mientras la Base de datos tiene margen.
- El p99 sube y se descartan algunas peticiones, aunque ningún componente esté roto.

## El Diseño

::Design{id="small-box-full"}

::Design{id="bigger-box"}

Los mismos Usuarios, la misma Base de datos. El único cambio es un escalón de tamaño en el Servidor de aplicaciones.

## Por qué funciona

Un escalón de tamaño duplica las vCPU y cuesta un poco más de Gasto. Nada más cambia: ni balanceador, ni segunda copia, ni preguntas sobre el estado compartido. En la segunda imagen la barra de carga del Servidor de aplicaciones baja muy por debajo de llena, las peticiones descartadas cesan y el p99 vuelve a la normalidad.

Escalar hacia arriba también es reversible. Si el pico fue corto, reduce el tamaño y la factura lo sigue.

## Qué cuesta

Cambiar el tamaño reinicia el Nodo y vuelve en frío, así que hazlo antes del pico y no durante. Los tamaños tienen un tope, y una máquina sigue siendo un único punto de fallo. El precio sube con el tamaño, así que pagas capacidad que usas solo en el pico.

Un runtime que ejecuta un solo proceso no puede usar núcleos adicionales. Node.js simple es un único bucle de eventos, así que duplicar sus vCPU compra poco, y una segunda copia o un runtime en clúster ayuda más. Comprueba el runtime antes de pagar por núcleos.

## En Quorum

Cambia el tamaño desde el Inspector del Nodo, y lee el coste antes de comprometerte. [Encontrar el cuello de botella](/guides/find-the-bottleneck) muestra cómo distinguir el Servidor de aplicaciones de la Base de datos. El glosario define el [escalado vertical y horizontal](/glossary/vertical-and-horizontal-scaling). El siguiente paso es [varios servidores de aplicaciones tras un balanceador de carga](/patterns/several-app-servers-behind-a-load-balancer).
