import { def } from './define.ts'

export const LLM_FIRST_TOKEN_MS = 600
/**
 * LLM API price per 1,000 tokens, × cost index. It is billed on the GPU's scale, a real hour per
 * sim second, because the two serve the same prompts: $0.69 per million tokens, inside the real
 * $0.23 to $0.88 for an open 70B model, is $2.50 per 1,000. An H100 is cheaper only while it is
 * about two-thirds busy.
 */
export const LLM_PRICE = 2.5
/** Prompts per second the LLM API takes at its first usage tier; each tier doubles it.  */
export const LLM_RATE = 100

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const llmGlossary: ReadonlyArray<string> = ['model-inference', 'rate-limiting']

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
