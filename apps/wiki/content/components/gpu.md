The GPU Node serves inference on rented GPUs, as a model server such as vLLM does on NVIDIA GPUs.

## When to place it

- Place it when AI prompts are a large share of your traffic and the [LLM API](/components/llm) bill is a large line in the Ledger. It unlocks with [Model serving](/research/model-serving).
- Skip it when the load is idle or spiky. A GPU Node bills for every second it runs, busy or not, and it is cheaper per token than the LLM API only while it stays busy.
- Resize it to your steady AI load, and leave the spikes to the LLM API.

## How it works

It takes inference calls from your App Servers and sends nothing on. Its capacity is measured in tokens per second, and each AI prompt uses a fixed number of tokens. Each size step doubles the GPUs, and with them its capacity and Burn. See [model inference](/glossary/model-inference).

A new or restarted GPU Node starts cold: it loads its model and serves at a fraction of its capacity until it warms up.

## Options

The **GPU type** sets the tradeoff:

- T4 is cheap and slow.
- A100 is balanced.
- H100 is the cheapest per token and the hardest to get.

Changing the type restarts the Node.

The **model** (small, medium or large) sets how many prompts a second the Node serves and what each answer is worth: a larger model earns more and serves fewer. The weights, at the chosen precision, and the batch's attention cache must fit in the GPUs' memory. If they do not, the Node is killed as it loads and every prompt fails as `oom`. A lower precision, a smaller model, a smaller batch or a bigger GPU fits it. Changing the model reloads the weights.

## How it fails

- Overloaded, it drops prompts. AI prompts are a high-value kind, so this costs revenue fast.
- Idle, it burns money.
- [GPU shortage](/incidents/gpu-shortage): the provider reclaims a GPU Node, and no H100 capacity exists that month. Link the LLM API too, so prompts have somewhere to go.
- [Instance failure](/incidents/instance) takes a single copy offline. It comes back cold.

## Tips

- Run a GPU Node for the steady load and the LLM API for spikes.
- Avoid H100 when you cannot afford a shortage.
