import { en } from './en/index.ts'
import { fr } from './fr/index.ts'
import { zhCN } from './zh-CN/index.ts'
import { nodeLabelOf } from '@quorum/simulation/labels'
import type { Game, GameNode } from '@quorum/simulation/state'
import type { Locale } from './index.ts'

/** A message is a string, or a function that fills values into one. */
type Widen<T> = T extends string
  ? string
  : T extends (...args: infer Args) => infer Result
    ? Result extends string
      ? (...args: Args) => string
      : T
    : { [Key in keyof T]: Widen<T[Key]> }

/** The shape every language must have: English is the source, so a missing or extra key fails typecheck. */
export type Messages = Widen<typeof en>

const messages: Readonly<Record<Locale, Messages>> = { en, fr, 'zh-CN': zhCN }

const languageOf = new WeakMap<object, Locale>()

/** Tags a builder with its language, so every view that holds the builder can read its copy. */
export const speak = <H extends object>(locale: Locale, h: H): H => {
  languageOf.set(h, locale)
  return h
}

/** The language of this view's builder. */
export const localeOf = (h: object): Locale => languageOf.get(h) ?? 'en'

/** The copy in a language, for code that has the locale but no builder. */
export const copyIn = (locale: Locale): Messages => messages[locale]

/** The copy in the language of this view's builder. A builder nobody tagged speaks English. */
export const copy = (h: object): Messages => messages[languageOf.get(h) ?? 'en']

/** The entry with its words in the builder's language laid over it, for views that read `entry.name`. */
export const localized = <Entry extends object, Words extends object>(
  entry: Entry,
  words: Words,
): Entry & Words => ({ ...entry, ...words })

/** The words of the Era this Game is in. */
export const eraWords = (t: Messages, game: Game): Messages['catalog']['eras'][number] =>
  t.catalog.eras[Math.min(game.stage, t.catalog.eras.length - 1)]!

/** A Node's Component name in the builder's language, and its ordinal: the Simulation's `nodeLabelOf` in words. */
export const nodeLabelIn = (
  t: Messages,
  game: Game,
  node: GameNode,
): Readonly<{ name: string; ordinal: number }> => ({
  name: t.catalog.components[node.type].name,
  ordinal: nodeLabelOf(game, node).ordinal,
})

/** A Node's label, such as "App Server 3", or just its Component name when it is alone. */
export const nodeTitle = (t: Messages, game: Game, node: GameNode): string => {
  const label = nodeLabelIn(t, game, node)
  return label.ordinal > 0 ? `${label.name} ${label.ordinal}` : label.name
}

/** An Insight pool's name in the builder's language, such as "Page view Insight". */
export const insightName = (t: Messages, pool: keyof Messages['catalog']['pools']): string =>
  t.pools.insightName(t.catalog.pools[pool].label)
