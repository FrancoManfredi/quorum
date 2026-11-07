import type { Messages } from '../messages.ts'

export const inspectorQueue: Messages['inspectorQueue'] = {
  failedTasks: '失敗タスク',
  retryForever: '永久にリトライ',
  deadLetterQueue: 'デッドレターキュー',
  maxLength: '最大長',
  none: 'なし',
}
