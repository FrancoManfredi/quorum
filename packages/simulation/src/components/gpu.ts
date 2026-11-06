import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/**
 * GPU types (05 "GPU Node"): dollars per second per GPU, at the real rental price per GPU-hour,
 * and tokens per second serving one model. T4 is cheap and slow; H100 is the cheapest per token,
 * and scarce. Prices: AWS g4dn.xlarge $0.526/h, the A100 80GB on-demand median $1.79/h, and the
 * H100 market median $3.33/h (October 2026). The H100 rate is SemiAnalysis's 2,056 tokens/s for a
 * 70B model at 30 tokens/s per user; the others follow memory bandwidth.
 */
export const GPU_TYPES = {
  t4: { name: 'T4', burn: 0.53, tokens: 200, gb: 16 },
  a100: { name: 'A100', burn: 1.8, tokens: 900, gb: 80 },
  h100: { name: 'H100', burn: 3.3, tokens: 2_000, gb: 80 },
} as const
/**
 * The model a GPU Node serves (05 "GPU Node": "Small, medium, large. Larger models earn more per
 * prompt and need more GPU memory"): the weights' GB at FP16, how many times the medium model's
 * tokens a second it serves, and what a prompt it answers is worth next to the medium model's. The
 * weights are a 3B, a 7B and a 34B model at two bytes a weight.
 */
export const GPU_MODELS = {
  small: { name: 'Small (3B)', gb: 6, speed: 2, value: 0.6 },
  medium: { name: 'Medium (7B)', gb: 14, speed: 1, value: 1 },
  large: { name: 'Large (34B)', gb: 68, speed: 0.25, value: 1.8 },
} as const
export type GpuModel = keyof typeof GPU_MODELS
/** GB of GPU memory each prompt in a batch holds for its attention cache. */
export const GPU_CACHE_GB = 0.25
/** Milliseconds to the first token on a GPU Node, and on the LLM API (05 "LLM API": 600 ms). */
export const GPU_FIRST_TOKEN_MS = 300
/**
 * A GPU Node's weight precision (05 "GPU Node"): INT8 and INT4 serve faster and use less memory,
 * and a lower-precision answer is worth less. The value penalties are the design's 5% and 15%; the
 * speed multipliers are 2× and 3×. Their weights take half and a quarter of the memory.
 */
export const GPU_PRECISIONS = {
  fp16: { name: 'FP16', speed: 1, value: 1, memory: 1 },
  int8: { name: 'INT8', speed: 2, value: 0.95, memory: 0.5 },
  int4: { name: 'INT4', speed: 3, value: 0.85, memory: 0.25 },
} as const
export type GpuPrecision = keyof typeof GPU_PRECISIONS

/**
 * A GPU Node's batch size (05 "GPU Node"): a larger batch raises throughput and raises the time to
 * the first token. Continuous batching serves new prompts as they arrive, so it keeps the
 * throughput and drops the added latency.
 */
export const GPU_BATCHES = [
  { batch: 1, gain: 1, ttft: 0 },
  { batch: 8, gain: 1.6, ttft: 150 },
  { batch: 32, gain: 2.2, ttft: 500 },
] as const

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const gpuGlossary: ReadonlyArray<string> = ['model-inference']

/** A GPU Node's GPU type (05 "GPU Node"). */
export const GpuType = Schema.Literals(['t4', 'a100', 'h100'])
export type GpuType = typeof GpuType.Type

/** The saved properties of a gpu Node, with the defaults an old save decodes to. */
export const gpuFields = {
  /** A GPU Node's GPU type. */
  gpu: GpuType.pipe(Schema.withDecodingDefaultKey(Effect.succeed('t4' as const))),
  /** A GPU Node's weight precision: FP16, INT8 or INT4 (05 "GPU Node"). */
  precision: Schema.Literals(['fp16', 'int8', 'int4']).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('fp16' as const)),
  ),
  /** The model a GPU Node serves: small, medium or large (05 "GPU Node"). */
  gpuModel: Schema.Literals(['small', 'medium', 'large']).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('medium' as const)),
  ),
  /** A GPU Node's batch size (05 "GPU Node"). */
  batch: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
} as const

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
