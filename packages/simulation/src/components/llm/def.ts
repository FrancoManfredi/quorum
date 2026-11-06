import { def } from '../define.ts'

export const llmDef = def({
  id: 'llm',
  code: 'llm',
  name: 'LLM API',
  product: 'A hosted model',
  group: 'data',
  blurb: 'Serves AI prompts with no GPUs. Paid per token, and rate limited.',
  cost: 0,
  latency: 600,
  accepts: ['infer'],
  maxOut: 0,
  unlock: 'hosted-models',
  steps: 8,
  limiting: true,
})
