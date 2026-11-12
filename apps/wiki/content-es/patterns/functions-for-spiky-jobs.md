---
title: Funciones para trabajos con picos
summary: Ejecuta el trabajo a ráfagas o poco frecuente en una Función serverless que factura por uso y escala desde cero, y deja la carga constante en máquinas.
section: patterns
group: Scaling steps
order: 118
aliases: serverless, lambda, cloud functions, cold start, scale to zero, faas, funciones serverless, arranque en frío, escalar a cero, funciones en la nube
---

Pon el trabajo con picos marcados y largos tramos de calma en una Función serverless, para pagar solo mientras se ejecuta.

## Cuándo dar el paso

- El tráfico tiene picos, y las máquinas están ociosas la mayor parte del día o se caen en el pico.
- Un endpoint necesita su propia capacidad sin una segunda máquina que mantener.
- El trabajo es corto, ya que una función tiene un límite de tiempo.

## El Diseño

::Design{id="function-front"}

Los Usuarios llaman directamente a la Función, y esta llama a la Base de datos. No hay Servidor de aplicaciones. La Función toma su **Runtime** de tu Stack, y el runtime fija lo rápido que funciona y cuánto dura un arranque en frío.

## Por qué funciona

Nada se mantiene en pie mientras está ocioso, así que una hora tranquila cuesta casi nada. La capacidad sigue a la demanda hasta un tope de concurrencia, sin Autoescalador que ajustar y sin máquinas que arrancar. Un runtime compilado arranca en frío en una fracción de segundo, donde una JVM necesita segundos, así que el lenguaje que elijas cambia el coste de escalar a cero.

## Qué cuesta

Un entorno que estuvo ocioso desaparece, así que la siguiente llamada paga un arranque en frío. Pasado el tope, el proveedor estrangula y descarta el exceso. Cada ejecución abre sus propias conexiones a la base de datos, así que un pico recae sobre la Base de datos, y conviene tener un pooler. Por encima de una parte estable de la carga de una VM equivalente, una función cuesta más que la máquina. El trabajo largo, como una exportación, pertenece a un Worker, porque una función se detiene tras un tiempo fijo.

## En Quorum

Coloca una [Función serverless](/components/fn) después de [Serverless](/research/serverless), y una Investigación de runtime como Go para el **Runtime**. Pon una [CDN](/patterns/cdn-push-and-pull) o una [Caché](/components/cache) delante, porque cada petición que llega a una función se factura. El glosario tiene el [arranque en frío](/glossary/cold-start). El siguiente paso escala máquinas: [Autoescalar el nivel de cómputo](/patterns/autoscale-the-compute-tier).
