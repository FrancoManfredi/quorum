import { Refusal } from '@quorum/simulation/actions'
import { copyIn, type Messages } from './messages.ts'

type Name = (t: Messages) => string

/** Every catalog name and label, and the phrases of a refusal, from English text to the same entry in another language. */
const names = (() => {
  const index = new Map<string, Name>()
  const english = copyIn('en')
  const catalog = english.catalog as unknown as Readonly<
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
  for (const [key, text] of Object.entries(english.toasts.whats))
    if (!index.has(text))
      index.set(
        text,
        (t) => (t.toasts.whats as unknown as Readonly<Record<string, string>>)[key] ?? text,
      )
  return index
})()

/** The reasons with typed copy, from their English text to their id. */
const reasonIds = new Map(
  Object.entries(copyIn('en').toasts.reasons).map(([id, text]) => [text, id] as const),
)

export const nameIn = (t: Messages, text: string): string => names.get(text)?.(t) ?? text

const patterns: ReadonlyArray<
  readonly [RegExp, (t: Messages, found: ReadonlyArray<string>) => string]
> = [
  [
    /^Every (.+) is at its largest size\.$/,
    (t, [a]) => t.toasts.reason.everyLargestSize(nameIn(t, a!)),
  ],
  [/^(.+) is at its largest size\.$/, (t, [a]) => t.toasts.reason.largestSize(nameIn(t, a!))],
  [/^(.+) is at its smallest size\.$/, (t, [a]) => t.toasts.reason.smallestSize(nameIn(t, a!))],
  [/^(.+) cannot be placed\.$/, (t, [a]) => t.toasts.reason.cannotBePlaced(nameIn(t, a!))],
  [/^(.+) has not failed\.$/, (t, [a]) => t.toasts.reason.notFailed(nameIn(t, a!))],
  [/^(.+) needs (\d+) Legacy\.$/, (t, [a, b]) => t.toasts.reason.needsLegacy(nameIn(t, a!), b!)],
  [/^(.+) is at its top level\.$/, (t, [a]) => t.toasts.reason.topLevel(nameIn(t, a!))],
  [/^(.+) is already on the Board\.$/, (t, [a]) => t.toasts.reason.onTheBoard(nameIn(t, a!))],
  [/^(.+) is not Postgres\.$/, (t, [a]) => t.toasts.reason.notPostgres(nameIn(t, a!))],
  [/^Every Playbook slot is full \((\d+)\)\. .*$/, (t, [a]) => t.toasts.reason.slotsFull(a!)],
  [
    /^That save is from another version \((.+); this build reads (.+)\)\.$/,
    (t, [a, b]) => t.toasts.reason.otherBuild(a!, b!),
  ],
  [
    /^The Design needs (.+) Dev Hours; the budget is (.+)\.$/,
    (t, [a, b]) => t.toasts.reason.devHours(a!, b!),
  ],
  [
    /^(.+) needs (.+) first\.$/,
    (t, [a, b]) => t.toasts.reason.needsFirst(nameIn(t, a!), nameIn(t, b!)),
  ],
  [
    /^The queue holds (\d+) Studies, and (.+) needs (\d+) of them\.$/,
    (t, [a, b, c]) => t.toasts.reason.queueTooShort(a!, nameIn(t, b!), c!),
  ],
  [/^(.+) has no Product lever\.$/, (t, [a]) => t.levers.noLever(nameIn(t, a!))],
  [/^A Challenge pins its mix\.$/, (t) => t.levers.pinned],
  [/^The (.+) lever is at its last step\.$/, (t, [a]) => t.levers.lastStep(nameIn(t, a!))],
  [/^The Company does not serve (.+)\.$/, (t, [a]) => t.levers.notServed(nameIn(t, a!))],
  [
    /^A (.+) lever step is already on the backlog\.$/,
    (t, [a]) => t.levers.onBacklog(nameIn(t, a!)),
  ],
  [
    /^The (.+) lever step (\d+) opens in (.+)\.$/,
    (t, [a, b, c]) => t.levers.opens(nameIn(t, a!), Number(b), nameIn(t, c!)),
  ],
  [
    /^(.+) caps the (.+) lever at its first step\.$/,
    (t, [a, b]) => t.levers.capped(nameIn(t, a!), nameIn(t, b!)),
  ],
  [/^The (.+) lever is already off\.$/, (t, [a]) => t.levers.alreadyOff(nameIn(t, a!))],
  [/^A (.+) lever step is on the backlog\.$/, (t, [a]) => t.levers.onBacklogRemove(nameIn(t, a!))],
]

/** A sentence the Simulation or the game wrote in English, in the language of `t`; unknown text stays. */
export const reasonIn = (t: Messages, text: string): string => {
  const id = reasonIds.get(text)
  if (id !== undefined) return (t.toasts.reasons as Readonly<Record<string, string>>)[id] ?? text
  for (const [pattern, write] of patterns) {
    const found = pattern.exec(text)
    if (found) return write(t, found.slice(1))
  }
  return text
}

export const refusalIn = (t: Messages, refusal: Refusal): string =>
  Refusal.$match(refusal, {
    Locked: ({ what, research }) => t.team.refusal.locked(nameIn(t, what), nameIn(t, research)),
    TooEarly: ({ what, era }) => t.team.refusal.tooEarly(nameIn(t, what), nameIn(t, era)),
    Unaffordable: ({ what, price }) =>
      t.toasts.costs(nameIn(t, what), `$${Math.round(price).toLocaleString('en-US')}`),
    NotAllowed: ({ reason }) => reasonIn(t, reason),
    Missing: () => t.toasts.missing,
  })
