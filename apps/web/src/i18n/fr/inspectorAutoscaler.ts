import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorAutoscaler: Messages['inspectorAutoscaler'] = {
  scaling: 'Mise à l’échelle',
  load: 'Charge',
  requests: 'Requêtes',
  queueDepth: 'Profondeur de file',
  min: (p0) => `min ${arg(p0)}`,
  noMax: 'pas de maximum',
  max: (p0) => `maximum ${arg(p0)}`,
  onLoad: 'Selon la charge',
  aheadOfThePeak: 'Avant le pic',
  twoCalendarHoursBeforeTheDaily:
    'Deux heures calendaires avant le pic quotidien, il ajoute les copies dont le pic aura besoin, pour qu’elles soient chaudes à son arrivée.',
  itReactsToTheLoadIt:
    'Il réagit à la charge qu’il voit. Recherchez Mise à l’échelle planifiée pour anticiper le pic.',
}
