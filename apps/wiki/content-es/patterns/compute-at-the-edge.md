---
title: Cómputo en el edge
summary: Ejecuta handlers pequeños en Funciones edge junto al usuario y deja el trabajo pesado en el Servidor de aplicaciones, para que las peticiones baratas se salten el viaje al origen.
section: patterns
group: Scaling steps
order: 131
aliases: edge functions, cloudflare workers, isolates, cold start, wasm, edge handlers, cpu ceiling, edge cache, cómputo en el edge, funciones edge, arranque en frío, handlers en el edge, límite de CPU, caché del edge
---

Responde en el edge las peticiones baratas y comunes y envía todo lo demás al origen.

## Cuándo dar el paso

- Las páginas y lecturas de Usuarios lejanos son lentas incluso con una copia regional.
- El origen gasta capacidad en peticiones minúsculas, como redirecciones y cambios de cabeceras.
- Un arranque en frío de una función perjudica a una petición de cara al usuario.

## El Diseño

::Design{id="edge-handlers"}

El API Gateway envía las páginas y las lecturas a la Función edge y los tipos más pesados al Servidor de aplicaciones. Ambos llaman a la Base de datos. Esta imagen se ejecuta en una región, así que muestra el reparto de tipos y el límite de CPU, no la distancia ahorrada.

## Por qué funciona

Una Función edge arranca en milisegundos sin arranque en frío, y cobra por petición. Ejecuta el Stack de tu Servicio, así que el Stack debe ser JavaScript o TypeScript, o Rust o Go compilados a WebAssembly. Un Stack de PHP, Ruby o Python se rechaza ahí.

Un handler tiene un límite de CPU en lugar de una máquina. Una petición que necesita más se mata como timeout, así que el hash de contraseña de un inicio de sesión o una subida de archivo no caben.

## Qué cuesta

Un handler del edge que llama a la Base de datos en cada petición sigue pagando el viaje, así que ahorra el salto del usuario y no la consulta. Una Función edge sirve solo a su propia región, así que cópiala por región. No puede mantener un conjunto de trabajo, porque la memoria es pequeña. Una Empresa en PHP debe migrar antes su Stack, lo que cuesta Horas de desarrollo.

## En Quorum

Coloca una [Función edge](/components/edge) y fija un Stack que compile para ella. Investiga [Computación en el edge](/research/edge-compute), que necesita Entrega de contenido. Una Función edge activa también guarda la caché del edge desde la que una CDN responde las lecturas. El incidente [Certificado caducado](/incidents/certificate) le afecta. El siguiente paso, [recuperación ante desastres y una región de failover](/patterns/disaster-recovery-and-failover-region), cubre la pérdida de una región entera.
