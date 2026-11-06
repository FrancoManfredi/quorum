import type { Messages } from '../messages.ts'

export const inspectorQueue: Messages['inspectorQueue'] = {
  failedTasks: '失败任务',
  retryForever: '无限重试',
  deadLetterQueue: '死信队列',
  maxLength: '最大长度',
  none: '无',
}
