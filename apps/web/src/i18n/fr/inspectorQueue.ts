import type { Messages } from '../messages.ts'

export const inspectorQueue: Messages['inspectorQueue'] = {
  failedTasks: 'Tâches en échec',
  retryForever: 'Réessayer sans limite',
  deadLetterQueue: 'File des messages non traités',
  maxLength: 'Longueur max.',
  none: 'Aucun',
}
