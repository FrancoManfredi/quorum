import type { Messages } from '../messages.ts'

export const inspectorGpu: Messages['inspectorGpu'] = {
  fullPrecisionTheBaselineAndEvery: 'フル精度：これが基準で、すべての回答が満額の価値になります。',
  theTokensAndEachAnswerIs: (p0, p1) => `トークンは${p0}倍、回答の価値は${p1}%下がります。`,
  batch: (p0) => `バッチ ${p0}`,
  onePromptAtATimeThe: '1度に1プロンプト：最初のトークンまでの待ちが最短です。',
  thePromptsASecondAndContinuous: (p0, p1) =>
    `毎秒${p0}倍のプロンプトで、continuous batchingにより最初のトークンは${p1} msのままです。`,
  thePromptsASecondAndThe: (p0, p1) =>
    `毎秒${p0}倍のプロンプトで、最初のトークンは${p1} ms長く待ちます。`,
  theModelFits: (speed, value, needed, held) =>
    `中位モデルの${speed}倍のトークンで、回答の価値は${value}倍です。重みとバッチが${held} GBのうち${needed} GBを占めます。`,
  theModelDoesNotFit: (needed, held, cause) =>
    `重みとバッチに${needed} GBが必要で、GPUが持つのは${held} GBです。モデルは読み込み中に殺され、すべてのプロンプトが${cause}で失敗します。精度を下げるか、モデルを小さくするか、バッチを小さくすれば収まります。`,
}
