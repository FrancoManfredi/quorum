The LLM API is a hosted model, someone else's GPUs behind an API.

## When to place it

- Place it when you ship your first AI Feature. It needs no operations work, and it costs nothing while traffic is low. It unlocks with [Hosted models](/research/hosted-models).
- Skip it for steady load once the token bill grows large. Compare the bill with a busy GPU Node's Burn before you switch. The LLM API stays cheaper than a GPU Node that runs mostly idle.
- Resize it before peak when a [Traffic spike](/incidents/spike) could push you over its limit.

## How it works

It bills for each token it serves, and it is a Managed Component, so it costs nothing to place and serves every region. Inference calls come in from your App Servers and no Component sits downstream of it. Each prompt waits a fixed time for the first token, longer than a [GPU Node](/components/gpu). See [model inference](/glossary/model-inference).

It is rate limited. Each size step is a usage tier that doubles how many prompts per second it takes, and past the limit prompts fail at once as `throttled`. See [rate limiting](/glossary/rate-limiting).

## How it fails

- Past its tier, prompts fail as `throttled`.
- Its cost grows with every prompt. Watch third-party costs in the Ledger.
- Every prompt waits for the first token, so the AI prompt p99 stays high.

It also protects you. During a [GPU shortage](/incidents/gpu-shortage), an App Server linked to both a GPU Node and the LLM API keeps serving prompts.

### [Instance failure](/incidents/instance)

- **Signs:** The LLM API card goes grey and its callout reads "The host under this VM died. It still bills." Requests sent to it are stranded.
- **Do now:** Select the Node and click **Replace**. It costs Cash and comes back cold.
- **Prevent:** Run a second LLM API Node, so prompts have another place to go.

## Tips

- Keep an LLM API linked as a backup even after you place GPU Nodes.
