import type { Messages } from '../messages.ts'

export const inspectorAutoscaler: Messages['inspectorAutoscaler'] = {
  scaling: 'Escalado',
  load: 'Carga',
  requests: 'Peticiones',
  queueDepth: 'Profundidad de la cola',
  min: (p0: string | number | null) => `mín ${p0}`,
  noMax: 'sin máximo',
  max: (p0: string | number | null) => `máx ${p0}`,
  onLoad: 'Según la carga',
  aheadOfThePeak: 'Por delante del pico',
  twoCalendarHoursBeforeTheDaily:
    'Dos horas de calendario antes del pico diario, añade las copias que el pico necesitará, así que ya están calientes cuando llega.',
  itReactsToTheLoadIt:
    'Reacciona a la carga que ve. Investiga Escalado programado para aprovisionar antes del pico.',
}
