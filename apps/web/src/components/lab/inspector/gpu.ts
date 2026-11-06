import { copy } from '@/i18n/messages.ts'
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

const gpu = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
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
          (id) => [id, t.catalog.gpuModels[id].name] as const,
        ),
        node.gpuModel,
        (choice) => Message.GpuModelChosen({ nodeId: node.id, gpuModel: choice }),
        h,
        undefined,
        'grid-cols-3',
      ),
      caption(
        gpuFits(node)
          ? t.inspectorGpu.theModelFits(
              GPU_MODELS[node.gpuModel].speed,
              GPU_MODELS[node.gpuModel].value,
              gpuNeedGB(node).toFixed(1),
              gpuHeldGB(node),
            )
          : t.inspectorGpu.theModelDoesNotFit(
              gpuNeedGB(node).toFixed(1),
              gpuHeldGB(node),
              t.inspectorUsers.causes.oom,
            ),
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
          ? t.inspectorGpu.fullPrecisionTheBaselineAndEvery
          : t.inspectorGpu.theTokensAndEachAnswerIs(
              GPU_PRECISIONS[node.precision].speed,
              Math.round((1 - GPU_PRECISIONS[node.precision].value) * 100),
            ),
        h,
      ),
      picker(
        'batch',
        GPU_BATCHES.map((entry) => [entry.batch, t.inspectorGpu.batch(entry.batch)] as const),
        node.batch,
        (choice) => Message.BatchChosen({ nodeId: node.id, batch: choice }),
        h,
        undefined,
        'grid-cols-3',
      ),
      caption(
        node.batch === 1
          ? t.inspectorGpu.onePromptAtATimeThe
          : has(game, 'continuous-batching')
            ? t.inspectorGpu.thePromptsASecondAndContinuous(
                GPU_BATCHES.find((entry) => entry.batch === node.batch)?.gain ?? 1,
                GPU_FIRST_TOKEN_MS,
              )
            : t.inspectorGpu.thePromptsASecondAndThe(
                GPU_BATCHES.find((entry) => entry.batch === node.batch)?.gain ?? 1,
                GPU_BATCHES.find((entry) => entry.batch === node.batch)?.ttft ?? 0,
              ),
        h,
      ),
    ],
    h,
  )
}

export const gpuPanel: Panel = {
  body: ({ game, node, h }) => [gpu(game, node, h)],
}
