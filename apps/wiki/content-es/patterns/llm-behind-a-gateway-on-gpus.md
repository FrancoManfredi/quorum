---
title: Un LLM detrás de un gateway en GPU
summary: Sirve prompts de IA desde tus propios Nodos GPU junto a una API de LLM alojada, y ajusta modelo, precisión y tamaño de lote, porque una GPU sale más barata por prompt solo mientras se mantiene ocupada.
section: patterns
group: Scaling steps
order: 133
aliases: llm, gpu, inference, vllm, quantization, batching, model serving, tokens, hosted model, ai prompts, inferencia, cuantización, procesamiento por lotes, servicio de modelos, modelo alojado, prompts de IA
---

Pon un gateway delante de los prompts de IA, y ejecuta tus propias GPU solo cuando el tráfico las mantenga ocupadas.

## Cuándo dar el paso

- La factura de la API de LLM alojada crece más rápido que los ingresos, o su límite de tasa estrangula los prompts.
- Los prompts de IA son una gran parte de las peticiones y quieres controlar el modelo.
- La latencia del primer token es demasiado alta en la API alojada.

## El Diseño

::Design{id="gpu-behind-gateway"}

El gateway limita la tasa de todas las peticiones y las pasa al Servidor de aplicaciones. El Servidor de aplicaciones se enlaza con un Nodo GPU, así que cada prompt se ejecuta en él. Una API de LLM alojada es la alternativa, y enlazar ambas reparte los prompts entre ellas según la capacidad.

## Por qué funciona

Un Nodo GPU sirve tokens por segundo. El tipo de GPU, el modelo, la precisión y el tamaño de lote multiplican ese valor. Los pesos INT8 sirven más rápido y caben en menos memoria, y sus respuestas valen un poco menos. Un lote mayor sube el throughput y sube la espera del primer token, y el batching continuo mantiene el throughput sin la espera. Un modelo demasiado grande para la memoria de la GPU falla todos los prompts por falta de memoria, y una precisión menor lo reduce hasta que cabe.

## Qué cuesta

Un Nodo GPU factura todo el tiempo y sale más barato por prompt solo mientras se mantiene ocupado. Si enlazas una GPU y una API alojada al mismo Servidor de aplicaciones, el reparto va por capacidad, así que la API alojada se lleva la mayoría de los prompts, la GPU queda ociosa y el Gasto paga por las dos. Este Diseño enlaza solo la GPU, lo que la mantiene lo bastante ocupada para costar menos. Los modelos más grandes ganan más por prompt y sirven una fracción de los prompts. Pueden faltar H100 durante una [Escasez de GPU](/incidents/gpu-shortage). El límite del gateway cuenta cada tipo de petición, así que fíjalo por encima de la demanda real. El juego no tiene un enrutador que prefiera primero la GPU.

## En Quorum

Coloca un [Nodo GPU](/components/gpu) y una [API de LLM](/components/llm). Investiga [Modelos alojados](/research/hosted-models), [Servicio de modelos](/research/model-serving), [Cuantización](/research/quantization) y [Batching continuo](/research/continuous-batching). Lee sobre la [inferencia de modelo](/glossary/model-inference), la [cuantización](/glossary/quantization) y el [batching continuo](/glossary/continuous-batching). El siguiente paso, [búsqueda vectorial y embeddings](/patterns/vector-search-and-embeddings), da al modelo tus propios datos.
