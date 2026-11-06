export const inspectorGpu = {
  fullPrecisionTheBaselineAndEvery: 'Full precision: the baseline, and every answer at full value.',
  theTokensAndEachAnswerIs: (p0: string | number | null, p1: string | number | null) =>
    `${p0}× the tokens, and each answer is worth ${p1}% less.`,
  batch: (p0: string | number | null) => `batch ${p0}`,
  onePromptAtATimeThe: 'One prompt at a time: the lowest wait for a first token.',
  thePromptsASecondAndContinuous: (p0: string | number | null, p1: string | number | null) =>
    `${p0}× the prompts a second, and continuous batching keeps the first token at ${p1} ms.`,
  thePromptsASecondAndThe: (p0: string | number | null, p1: string | number | null) =>
    `${p0}× the prompts a second, and the first token waits ${p1} ms longer.`,
}
