import type { Messages } from '../messages.ts'

export const inspectorQueue: Messages['inspectorQueue'] = {
  failedTasks: 'Tareas fallidas',
  retryForever: 'Reintentar siempre',
  deadLetterQueue: 'Cola de mensajes muertos',
  maxLength: 'Longitud máxima',
  none: 'Ninguna',
}
