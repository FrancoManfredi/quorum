---
title: An LLM behind a gateway on GPUs
summary: Serve AI prompts from your own GPU Nodes beside a hosted LLM API, and tune model, precision and batch size, because a GPU is cheaper per prompt only while it stays busy.
section: patterns
group: Stack ladder
order: 133
aliases: llm, gpu, inference, vllm, quantization, batching, model serving, tokens, hosted model, ai prompts
---

Put a gateway in front of AI prompts, and run your own GPUs only when the traffic keeps them busy.

## Move up when

- The hosted LLM API bill grows faster than revenue, or its rate limit throttles prompts.
- AI prompts are a large share of requests and you want control of the model.
- First-token latency is too high on the hosted API.

## The Design

::Design{id="gpu-behind-gateway"}

The gateway rate-limits all requests and passes them to the App Server. The App Server links to one GPU Node, so every prompt runs on it. A hosted LLM API is the alternative, and linking both splits prompts between them by capacity.

## Why it works

A GPU Node serves tokens a second. GPU type, model, precision and batch size all multiply that. INT8 weights serve faster and fit in less memory, and their answers are worth a little less. A larger batch raises throughput and raises the wait for a first token, and continuous batching keeps the throughput without the wait. A model too big for the GPU's memory fails every prompt as out of memory, and lower precision shrinks it until it fits.

## What it costs

A GPU Node bills all the time and is cheaper per prompt only while it stays busy. Link a GPU and a hosted API to the same App Server and the split goes by capacity, so the hosted API takes most prompts, the GPU idles, and Burn pays for both. This Design links the GPU alone, which keeps it busy enough to cost less. Models that are larger earn more per prompt and serve a fraction as many. H100s can be missing during a [GPU shortage](/incidents/gpu-shortage). The gateway's limit counts every request kind, so set it above real demand. The game has no router that prefers the GPU first.

## In Quorum

Place a [GPU Node](/components/gpu) and an [LLM API](/components/llm). Research [Hosted models](/research/hosted-models), [Model serving](/research/model-serving), [Quantization](/research/quantization) and [Continuous batching](/research/continuous-batching). Read [model inference](/glossary/model-inference), [quantization](/glossary/quantization) and [continuous batching](/glossary/continuous-batching). The next rung, [vector search and embeddings](/patterns/vector-search-and-embeddings), gives the model your own data.
