import type { MailMessage, MailVars, Snippet } from '../game/mail-text.ts'
import { StudyStall } from '@quorum/simulation/studies'
import type { FeatureId, InsightPool, StudyShapeKind } from '@quorum/simulation/catalog'
import { stallReasonIn } from './format.ts'
import { copyIn, type Messages } from './messages.ts'

type Name = (t: Messages) => string

/** Every catalog name and label, from its English text to the same entry in another language. */
const names = (() => {
  const index = new Map<string, Name>()
  const catalog = copyIn('en').catalog as unknown as Readonly<
    Record<string, Readonly<Record<string, Readonly<Record<string, unknown>>>>>
  >
  for (const [table, entries] of Object.entries(catalog))
    for (const [id, fields] of Object.entries(entries))
      for (const field of ['name', 'label'])
        if (typeof fields?.[field] === 'string' && !index.has(fields[field] as string))
          index.set(fields[field] as string, (t) => {
            const entry = (
              t.catalog as unknown as Record<string, Record<string, Record<string, string>>>
            )[table]?.[id]
            return entry?.[field] ?? (fields[field] as string)
          })
  const words = copyIn('en').mailWords as unknown as Readonly<Record<string, unknown>>
  for (const group of ['causes', 'blocked', 'severities', 'phrases'] as const) {
    const entries = words[group] as Readonly<Record<string, string>>
    for (const [key, english] of Object.entries(entries))
      if (!index.has(english))
        index.set(
          english,
          (t) => (t.mailWords[group] as Readonly<Record<string, string>>)[key] ?? english,
        )
  }
  return index
})()

const UNIT = /^(\d+(?:\.\d+)?) (ms|s|min|h|d|DH)$/
const ORDINAL = /^(.+?) (\d+)$/
const SEVERITY = /^SEV(\d)$/

/** One value in the player's language: a catalog name, a number with a unit, or text as it is. */
const localizeText = (t: Messages, text: string): string => {
  const known = names.get(text)
  if (known) return known(t)
  // The causes in a churn letter: one "- Page view: slow from far away" paragraph each.
  if (text.startsWith('- ')) {
    const own = text.slice(2)
    if (own === 'nothing one cause explains')
      return `- ${t.mailWords.phrases.nothingOneCause.replace(/^- /, '')}`
    return text
      .split('\n\n')
      .map((line) => {
        const at = line.indexOf(': ')
        return at < 0
          ? line
          : `- ${localizeText(t, line.slice(2, at))}: ${localizeText(t, line.slice(at + 2))}`
      })
      .join('\n\n')
  }
  // "Patch App Server": a patch ticket's name.
  if (text.startsWith('Patch ') && names.has(text.slice(6)))
    return `${t.mailWords.phrases.patch} ${localizeText(t, text.slice(6))}`
  const unit = UNIT.exec(text)
  if (unit) {
    const amount = unit[1] as string
    switch (unit[2]) {
      case 'ms':
        return t.units.ms(amount)
      case 's':
        return t.units.s(amount)
      case 'min':
        return t.units.min(amount)
      case 'h':
        return t.units.h(amount)
      case 'd':
        return t.units.d(amount)
      default:
        return t.units.devHours(amount)
    }
  }
  // "App Server 2": a Node's name and its number.
  const numbered = ORDINAL.exec(text)
  const base = numbered && names.get(numbered[1] as string)
  if (base) return `${base(t)} ${numbered[2]}`
  if (SEVERITY.test(text)) return text
  // "Search, Uploads" and "- Page view: slow": lists of names.
  if (text.includes(', ')) {
    const parts = text.split(', ')
    if (parts.every((part) => names.has(part)))
      return parts.map((part) => localizeText(t, part)).join(', ')
  }
  return text
}

const localizeVars = (t: Messages, vars: MailVars): MailVars =>
  Object.fromEntries(
    Object.entries(vars).map(([name, value]) => [
      name,
      typeof value === 'string' && name !== 'from' ? localizeText(t, value) : value,
    ]),
  )

/** A Mail's subject and body in the language of `t`, or null when this build has no such letter. */
export const writtenIn = (
  t: Messages,
  message: MailMessage,
): Readonly<{ subject: string; body: string }> | null => {
  const letter = t.mail.letters[message.letter.id]?.[message.letter.variant]
  if (!letter) return null
  const vars = { ...localizeVars(t, message.letter.vars) }
  const own =
    message.letter.id === 'cve' && typeof vars['id'] === 'string'
      ? t.mailWords.cves[vars['id']]
      : undefined
  if (own) Object.assign(vars, own)
  if (message.letter.id === 'stall')
    vars['reason'] = stallReasonIn(
      t,
      message.letter.vars['stall'] === 'Breadth'
        ? StudyStall.cases.Breadth.make({
            unit: message.letter.vars['unit'] === 'regions' ? 'regions' : 'components',
            target: Number(message.letter.vars['target'] ?? message.letter.vars['types'] ?? 0),
            current: Number(message.letter.vars['current'] ?? 0),
          })
        : message.letter.vars['stall'] === 'Shape'
          ? StudyStall.cases.Shape.make({
              shape: message.letter.vars['shape'] as StudyShapeKind,
              value: Number(message.letter.vars['value']),
              current: Number(message.letter.vars['shapeCurrent'] ?? 0),
            })
          : StudyStall.cases.Pool.make({
              pool: message.letter.vars['pool'] as InsightPool,
              feature: (message.letter.vars['feature'] as FeatureId | null) ?? null,
            }),
    )
  const written = letter(vars)
  const snippet = (part: MailMessage['before'][number]): string =>
    (t.mail.snippets as Readonly<Record<string, ((vars: MailVars) => string) | undefined>>)[
      part.id
    ]?.(localizeVars(t, part.vars)) ?? ''
  return {
    subject: written.subject,
    body: [...message.before.map(snippet), written.body, ...message.after.map(snippet)].join(
      '\n\n',
    ),
  }
}

const ACTION_KEY: Readonly<Record<string, keyof Messages['mailWords']['actions']>> = {
  'postmortem-take': 'postmortemTake',
  defer: 'later',
  patch: 'first',
  patcher: 'first',
}

/** A Mail button's label in the language of `t`; `fallback` is the English the Model kept. */
export const actionLabelIn = (
  t: Messages,
  action: Readonly<{ id: string; label: string }>,
): string => {
  const [kind = '', target = ''] = action.id.split(':')
  if (kind === 'rewrite') return t.mailWords.reviewMigration(target)
  const key = ACTION_KEY[kind === 'trap' ? target : kind] ?? (kind === 'trap' ? target : kind)
  const words = t.mailWords.actions as Readonly<Record<string, string | undefined>>
  return words[key] ?? action.label
}

/** What a Mail says after the player answered it, in the language of `t`; `english` is what the Model kept. */
export const answerIn = (
  t: Messages,
  answer: Readonly<{ id?: string | undefined; text: string }>,
): string => {
  const words = t.mailWords.answers as Readonly<Record<string, string | undefined>>
  return (answer.id ? words[answer.id] : undefined) ?? answer.text
}

/** A Thread's last word in the language of `t`, or null when this build has no such closing. */
export const closingIn = (t: Messages, closing: Snippet): string | null => {
  const words = t.mailWords.closings as Readonly<
    Record<string, string | ((name: string) => string) | undefined>
  >
  const word = words[closing.id]
  if (typeof word === 'string') return word
  const name = closing.vars['name']
  return word && typeof name === 'string' ? word(localizeText(t, name)) : null
}

/** A teammate's or a company's signature in the language of `t`. */
export const signOf = (
  t: Messages,
  id: string,
  sender: Readonly<{ sign: string; signIndex?: number | undefined }>,
): string =>
  (sender.signIndex === undefined
    ? t.senders[id]?.sign
    : t.mailWords.teammateSigns[sender.signIndex]) ?? sender.sign
