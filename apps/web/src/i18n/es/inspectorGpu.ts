import type { Messages } from '../messages.ts'

export const inspectorGpu: Messages['inspectorGpu'] = {
  fullPrecisionTheBaselineAndEvery:
    'Precisión completa: la referencia, y cada respuesta a valor completo.',
  theTokensAndEachAnswerIs: (p0: string | number | null, p1: string | number | null) =>
    `${p0}× los tokens, y cada respuesta vale un ${p1}% menos.`,
  batch: (p0: string | number | null) => `lote ${p0}`,
  onePromptAtATimeThe: 'Un prompt a la vez: la menor espera para el primer token.',
  thePromptsASecondAndContinuous: (p0: string | number | null, p1: string | number | null) =>
    `${p0}× los prompts por segundo, y el batching continuo mantiene el primer token en ${p1} ms.`,
  thePromptsASecondAndThe: (p0: string | number | null, p1: string | number | null) =>
    `${p0}× los prompts por segundo, y el primer token espera ${p1} ms más.`,
  theModelFits: (
    speed: string | number,
    value: string | number,
    needed: string | number,
    held: string | number,
  ) =>
    `${speed}× los tokens del modelo mediano, y cada respuesta vale ${value}× más. Los pesos y el lote ocupan ${needed} de ${held} GB.`,
  theModelDoesNotFit: (needed: string | number, held: string | number, cause: string) =>
    `Los pesos y el lote necesitan ${needed} GB y las GPUs tienen ${held}: el modelo muere al cargarse, y cada prompt falla como ${cause}. Una precisión más baja, un modelo más pequeño o un lote más pequeño encajan.`,
}
