import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorGpu: Messages['inspectorGpu'] = {
  fullPrecisionTheBaselineAndEvery:
    'Pleine précision : la référence, et chaque réponse à sa valeur entière.',
  theTokensAndEachAnswerIs: (p0, p1) =>
    `${arg(p0)}× les jetons, et chaque réponse vaut ${arg(p1)} % de moins.`,
  batch: (p0) => `lot ${arg(p0)}`,
  onePromptAtATimeThe: 'Une invite à la fois : l’attente la plus courte avant le premier jeton.',
  thePromptsASecondAndContinuous: (p0, p1) =>
    `${arg(p0)}× les invites par seconde, et le traitement par lots continu garde le premier jeton à ${arg(p1)} ms.`,
  thePromptsASecondAndThe: (p0, p1) =>
    `${arg(p0)}× les invites par seconde, et le premier jeton attend ${arg(p1)} ms de plus.`,
}
