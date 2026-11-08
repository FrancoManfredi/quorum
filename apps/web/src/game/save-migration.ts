import { migrateSave } from '@quorum/simulation/save-migration'

const objectOf = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

/** Old Mail kept its answer and resolve time as fields; the live schema keeps one phase. */
const migrateInbox = (save: Record<string, unknown>): Record<string, unknown> => {
  const inbox = objectOf(save.inbox)
  if (!inbox || !Array.isArray(inbox.mail)) return save
  return {
    ...save,
    inbox: {
      ...inbox,
      mail: inbox.mail.map((raw) => {
        const mail = objectOf(raw)
        if (!mail || mail.phase !== undefined) return raw
        const next = { ...mail }
        if (typeof next.resolved === 'number') next.phase = { _tag: 'Resolved', at: next.resolved }
        else if (typeof next.answer === 'string')
          next.phase = {
            _tag: 'Answered',
            answer: next.answer,
            answerId: typeof next.answerId === 'string' ? next.answerId : '',
          }
        else next.phase = { _tag: 'Active' }
        delete next.answer
        delete next.answerId
        delete next.resolved
        return next
      }),
    },
  }
}

/** Upgrades the raw JSON of a saved Company before the live Model decodes it. */
export const migrateSaveFile = (save: Record<string, unknown>): Record<string, unknown> =>
  migrateInbox(migrateSave(save))
