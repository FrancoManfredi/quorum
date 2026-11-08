The GPU Node serves inference on rented GPUs, as a model server such as vLLM does on NVIDIA GPUs.

## When to place it

- Place it when AI prompts are a large share of your traffic and the [LLM API](/components/llm) bill is a large line in the Ledger. It unlocks with [Model serving](/research/model-serving).
- Skip it when the load is idle or spiky. A GPU Node bills for every second it runs, busy or not, and it is cheaper per token than the LLM API only while it stays busy.
- Resize it to your steady AI load, and leave the spikes to the LLM API.

## How it works

Its capacity is measured in tokens per second, and each AI prompt uses a fixed number of tokens. Each size step doubles the GPUs, and with them its capacity and Burn. Inference calls arrive from your App Servers and it passes nothing on. See [model inference](/glossary/model-inference).

A new or restarted GPU Node starts cold: it loads its model and serves at a fraction of its capacity until it warms up.

## Options

::Options{id="gpu"}

- **GPU**: T4 is cheap and slow. A100 is balanced. H100 is the cheapest per token and the hardest to get. Changing the type restarts the Node.
- **Model**: a larger model earns more per prompt and serves fewer. The weights, the precision, and the batch's attention cache must fit in the GPUs' memory. If they do not, the Node is killed as it loads and every prompt fails as `oom`. A lower precision, a smaller model, a smaller batch, or a bigger GPU fits it. Changing the model reloads the weights.
- **Precision**: a lower precision serves faster, uses less memory, and is worth less per answer. It needs [Quantization](/research/quantization).
- **Batch**: a larger batch serves more prompts and raises the time to first token. [Continuous batching](/research/continuous-batching) keeps the throughput and drops the added latency. See [An LLM behind a gateway on GPUs](/patterns/llm-behind-a-gateway-on-gpus).

## How it fails

- Overloaded, it drops prompts. AI prompts are a high-value kind, so this costs revenue fast.
- Idle, it burns money.

### [GPU shortage](/incidents/gpu-shortage)

- **Signs:** A GPU Node goes grey, and prompts sent to it fail. An H100 cannot be had until it ends.
- **Do now:** Link an [LLM API](/components/llm) from the App Server so prompts have somewhere to go, or place a GPU Node of a smaller type. Nothing brings the reclaimed Node back sooner: it returns after at most 120 sim seconds.
- **Prevent:** Research [Hosted models](/research/hosted-models) and keep an LLM API linked. Avoid H100 when you cannot afford a shortage.

### [Instance failure](/incidents/instance)

- **Signs:** The GPU Node card goes grey and its callout reads "The host under this VM died. It still bills." Requests sent to it are stranded.
- **Do now:** Select the Node and click **Replace**. It costs Cash and comes back cold.
- **Prevent:** Run a second GPU Node, and keep an [LLM API](/components/llm) linked so prompts have somewhere to go. The Node comes back cold.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once, the GPU Node with them.
- **Do now:** Nothing brings the zone back sooner. **Fail over** promotes a **Standby**, and this Component keeps none, so it ends on its own after at most 120 s.
- **Prevent:** Research [Multiple zones](/research/multi-az) and keep a copy of the Component in a second zone.

### [Region outage](/incidents/region)

- **Signs:** One region's board goes grey and the GPU Node in it goes down.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region), keep a copy in a second region, and add [GeoDNS](/research/geo-dns) to send users there.

## Tips

- Run a GPU Node for the steady load and the LLM API for spikes.
- Avoid H100 when you cannot afford a shortage.
