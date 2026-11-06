import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorGpu: Messages['inspectorGpu'] = {
  fullPrecisionTheBaselineAndEvery: '全精度：基准，每个回答都是完整价值。',
  theTokensAndEachAnswerIs: (p0, p1) => `${arg(p0)} 倍令牌数，每个回答的价值降低 ${arg(p1)}%。`,
  batch: (p0) => `批次 ${arg(p0)}`,
  onePromptAtATimeThe: '一次一个提示：首字等待最短。',
  thePromptsASecondAndContinuous: (p0, p1) =>
    `每秒提示数为 ${arg(p0)} 倍，连续批处理让首字保持在 ${arg(p1)} 毫秒。`,
  thePromptsASecondAndThe: (p0, p1) => `每秒提示数为 ${arg(p0)} 倍，首字多等 ${arg(p1)} 毫秒。`,
}
