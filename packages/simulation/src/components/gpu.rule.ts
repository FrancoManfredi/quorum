import type { GameNode } from '../state.ts'
import {
  GPU_PRECISIONS,
  GPU_BATCHES,
  GPU_MODELS,
  GPU_FIRST_TOKEN_MS,
  GPU_TYPES,
  TOKENS_PER_PROMPT,
} from '../catalog.ts'
import { failed, through } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { flatScale, has } from '../lookups.ts'
import { type ComponentRule, gpuFits, terminal } from '../rule-kit.ts'
import { warmOf } from '../life.ts'

/** Prompts per second a GPU Node serves at full warmth. */
const gpuCapacity = (node: GameNode): number =>
  (GPU_TYPES[node.gpu].tokens * flatScale(node)) / TOKENS_PER_PROMPT

// Prompts per second: tokens per second over the tokens in a prompt. A cold Node loads its model.
export const gpuRule: ComponentRule = {
  model: (solver, node, arriving) => {
    const precision = GPU_PRECISIONS[node.precision]
    const batch = GPU_BATCHES.find((entry) => entry.batch === node.batch) ?? GPU_BATCHES[0]
    // Continuous batching serves the batch as it arrives, so the throughput stays and the wait
    // for a first token does not (05 "GPU Node").
    const batched = has(solver.game, 'continuous-batching')
    return flatModel(
      gpuCapacity(node) *
        GPU_MODELS[node.gpuModel].speed *
        precision.speed *
        batch.gain *
        Math.max(0.1, warmOf(node.life)),
      arriving,
      { fixed: GPU_FIRST_TOKEN_MS + (batched ? 0 : batch.ttft), variable: 100 },
      solver.boost(node),
    )
  },
  // A quantized answer is worth less: 5% at INT8 and 15% at INT4 (05 "GPU Node").
  // A model that does not fit in the GPU's memory is killed as it loads: every prompt fails as
  // `oom`. Quantization shrinks the weights until it fits.
  outcome: (answer, node, kind) =>
    gpuFits(node)
      ? through(
          answer.ownHop(
            kind,
            GPU_PRECISIONS[node.precision].value * GPU_MODELS[node.gpuModel].value,
          ),
        )
      : failed('oom'),
  ...terminal,
}
