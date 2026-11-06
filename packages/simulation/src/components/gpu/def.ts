import { def } from '../define.ts'

export const gpuDef = def({
  id: 'gpu',
  code: 'gpu',
  name: 'GPU Node',
  product: 'vLLM on NVIDIA',
  group: 'compute',
  blurb: 'Serves AI prompts in tokens per second. Each size step doubles the GPUs.',
  cost: 900,
  latency: 300,
  accepts: ['infer'],
  maxOut: 0,
  unlock: 'model-serving',
  steps: 8,
  limiting: true,
  coldStart: true,
})
