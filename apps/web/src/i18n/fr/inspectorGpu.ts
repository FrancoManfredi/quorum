import type { Messages } from '../messages.ts'

export const inspectorGpu: Messages['inspectorGpu'] = {
  fullPrecisionTheBaselineAndEvery:
    'Pleine précision : la référence, et chaque réponse à sa valeur entière.',
  theTokensAndEachAnswerIs: (p0, p1) =>
    `${p0}× les jetons, et chaque réponse vaut ${p1} % de moins.`,
  batch: (p0) => `lot ${p0}`,
  onePromptAtATimeThe: 'Une invite à la fois : l’attente la plus courte avant le premier jeton.',
  thePromptsASecondAndContinuous: (p0, p1) =>
    `${p0}× les invites par seconde, et le traitement par lots continu garde le premier jeton à ${p1} ms.`,
  thePromptsASecondAndThe: (p0, p1) =>
    `${p0}× les invites par seconde, et le premier jeton attend ${p1} ms de plus.`,
  theModelFits: (speed, value, needed, held) =>
    `${speed}× les jetons du modèle moyen, et chaque réponse vaut ${value}× autant. Les poids et le lot occupent ${needed} Go sur ${held}.`,
  theModelDoesNotFit: (needed, held, cause) =>
    `Les poids et le lot demandent ${needed} Go et les GPU en offrent ${held} : le modèle est tué au chargement, et chaque invite échoue en ${cause}. Une précision plus basse, un modèle plus petit ou un lot plus petit passe.`,
}
