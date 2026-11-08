import { type Action, Refusal, no, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, GameNode, GpuType } from '../state.ts'
import {
  RESEARCH,
  type GpuModel,
  type GpuPrecision,
  GPU_PRECISIONS,
  GPU_BATCHES,
  GPU_MODELS,
  GPU_FIRST_TOKEN_MS,
  GPU_TYPES,
  TOKENS_PER_PROMPT,
} from '../catalog.ts'
import { failed, through } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { flatScale, has, restarted } from '../lookups.ts'
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
      { fixedMs: GPU_FIRST_TOKEN_MS + (batched ? 0 : batch.ttft), variableMs: 100 },
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

/** Picks a GPU Node's GPU type. H100s cannot be had during a GPU shortage. */
export const setGpuType = (game: Game, id: string, gpu: GpuType): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'gpu') return notAllowed('Only a GPU Node has a GPU type.')
    if (node.gpu === gpu) return ok(game)
    if (gpu === 'h100' && game.incident?.kind === 'gpu-shortage')
      return notAllowed('No H100 capacity this month.')
    return ok(patch(game, id, { gpu, ...restarted(node) }))
  })

/** Picks a GPU Node's weight precision. INT8 and INT4 need Quantization (05 "GPU Node"). */
export const setPrecision = (game: Game, id: string, precision: GpuPrecision): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'gpu') return notAllowed('Only a GPU Node has a precision.')
    if (precision !== 'fp16' && !has(game, 'quantization'))
      return no(
        Refusal.Locked({
          what: GPU_PRECISIONS[precision].name,
          research: RESEARCH.quantization.name,
        }),
      )
    return ok(node.precision === precision ? game : patch(game, id, { precision }))
  })

/** Sets a GPU Node's batch size. Continuous batching keeps the first token's wait at its floor (05). */
export const setBatch = (game: Game, id: string, batch: number): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'gpu') return notAllowed('Only a GPU Node batches prompts.')
    if (!GPU_BATCHES.some((entry) => entry.batch === batch))
      return notAllowed(`A batch is ${GPU_BATCHES.map((entry) => entry.batch).join(', ')}.`)
    return ok(node.batch === batch ? game : patch(game, id, { batch }))
  })

/** Picks the model a GPU Node serves. It loads the weights, so the Node comes back cold. */
export const setGpuModel = (game: Game, id: string, gpuModel: GpuModel): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'gpu') return notAllowed('Only a GPU Node serves a model.')
    if (!(gpuModel in GPU_MODELS)) return notAllowed('There is no such model.')
    return ok(node.gpuModel === gpuModel ? game : patch(game, id, { gpuModel, ...restarted(node) }))
  })
