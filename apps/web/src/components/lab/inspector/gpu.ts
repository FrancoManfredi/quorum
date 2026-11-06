import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  GPU_TYPES,
  GPU_MODELS,
  GPU_PRECISIONS,
  GPU_BATCHES,
  GPU_FIRST_TOKEN_MS,
  type GpuModel,
  type GpuPrecision,
} from '@quorum/simulation/catalog'
import { gpuFits, gpuHeldGB, gpuNeedGB } from '@quorum/simulation/rules'
import { has } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'

import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

const gpu = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'GPU',
    [
      picker(
        'gpu',
        (Object.keys(GPU_TYPES) as ReadonlyArray<keyof typeof GPU_TYPES>).map(
          (id) => [id, GPU_TYPES[id].name] as const,
        ),
        node.gpu,
        (choice) => Message.GpuChosen({ nodeId: node.id, gpu: choice }),
        h,
      ),
      picker(
        'gpu-model',
        (Object.keys(GPU_MODELS) as ReadonlyArray<GpuModel>).map(
          (id) => [id, GPU_MODELS[id].name] as const,
        ),
        node.gpuModel,
        (choice) => Message.GpuModelChosen({ nodeId: node.id, gpuModel: choice }),
        h,
        undefined,
        'grid-cols-3',
      ),
      caption(
        gpuFits(node)
          ? `${GPU_MODELS[node.gpuModel].speed}× the medium model's tokens, and each answer is worth ${GPU_MODELS[node.gpuModel].value}× as much. The weights and the batch take ${gpuNeedGB(node).toFixed(1)} of ${gpuHeldGB(node)} GB.`
          : `The weights and the batch need ${gpuNeedGB(node).toFixed(1)} GB and the GPUs hold ${gpuHeldGB(node)}: the model is killed as it loads, and every prompt fails as oom. A lower precision, a smaller model or a smaller batch fits.`,
        h,
      ),
      picker(
        'precision',
        (Object.keys(GPU_PRECISIONS) as ReadonlyArray<GpuPrecision>).map(
          (id) => [id, GPU_PRECISIONS[id].name] as const,
        ),
        node.precision,
        (choice) => Message.PrecisionChosen({ nodeId: node.id, precision: choice }),
        h,
        (id) => id === 'fp16' || has(game, 'quantization'),
        'grid-cols-3',
      ),
      caption(
        node.precision === 'fp16'
          ? 'Full precision: the baseline, and every answer at full value.'
          : `${GPU_PRECISIONS[node.precision].speed}× the tokens, and each answer is worth ${Math.round((1 - GPU_PRECISIONS[node.precision].value) * 100)}% less.`,
        h,
      ),
      picker(
        'batch',
        GPU_BATCHES.map((entry) => [entry.batch, `batch ${entry.batch}`] as const),
        node.batch,
        (choice) => Message.BatchChosen({ nodeId: node.id, batch: choice }),
        h,
        undefined,
        'grid-cols-3',
      ),
      caption(
        node.batch === 1
          ? 'One prompt at a time: the lowest wait for a first token.'
          : has(game, 'continuous-batching')
            ? `${GPU_BATCHES.find((entry) => entry.batch === node.batch)?.gain ?? 1}× the prompts a second, and continuous batching keeps the first token at ${GPU_FIRST_TOKEN_MS} ms.`
            : `${GPU_BATCHES.find((entry) => entry.batch === node.batch)?.gain ?? 1}× the prompts a second, and the first token waits ${GPU_BATCHES.find((entry) => entry.batch === node.batch)?.ttft ?? 0} ms longer.`,
        h,
      ),
    ],
    h,
  )

export const gpuPanel: Panel = {
  body: ({ game, node, h }) => [gpu(game, node, h)],
}
