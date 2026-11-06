import type { Messages } from '../messages.ts'

export const inspectorGpu: Messages['inspectorGpu'] = {
  fullPrecisionTheBaselineAndEvery: '全精度：基准，每个回答都是完整价值。',
  theTokensAndEachAnswerIs: (p0, p1) => `${p0} 倍令牌数，每个回答的价值降低 ${p1}%。`,
  batch: (p0) => `批次 ${p0}`,
  onePromptAtATimeThe: '一次一个提示：首字等待最短。',
  thePromptsASecondAndContinuous: (p0, p1) =>
    `每秒提示数为 ${p0} 倍，连续批处理让首字保持在 ${p1} 毫秒。`,
  thePromptsASecondAndThe: (p0, p1) => `每秒提示数为 ${p0} 倍，首字多等 ${p1} 毫秒。`,
  theModelFits: (speed, value, needed, held) =>
    `是中型模型 ${speed} 倍的令牌数，每个回答的价值是 ${value} 倍。权重和批次占用 ${held} GB 中的 ${needed} GB。`,
  theModelDoesNotFit: (needed, held, cause) =>
    `权重和批次需要 ${needed} GB，而 GPU 只有 ${held} GB：模型在加载时被终止，每个提示都会以 ${cause} 失败。降低精度、换更小的模型或更小的批次即可装下。`,
}
