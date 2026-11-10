import { en } from './en/index.ts'
import { supportedLocales } from './index.ts'
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

/**
 * English ships in the main chunk. The other four catalogs are large, so they
 * load in the background after the title is interactive, or before boot when
 * the player's saved language is not English.
 */
const messages: Partial<Record<Locale, Messages>> = { en }

/** Loads one language's catalog into the map. Calling it twice is free. */
export const loadLocale = async (locale: Locale): Promise<void> => {
  if (messages[locale] !== undefined) return
  switch (locale) {
    case 'en':
      return
    case 'es':
      messages.es = (await import('./es/index.ts')).es
      return
    case 'fr':
      messages.fr = (await import('./fr/index.ts')).fr
      return
    case 'ja':
      messages.ja = (await import('./ja/index.ts')).ja
      return
    case 'zh-CN':
      messages['zh-CN'] = (await import('./zh-CN/index.ts')).zhCN
      return
  }
}

/** Fetches every other language once the browser is idle, so the picker switches at once. */
export const preloadLocales = (): void => {
  for (const { value } of supportedLocales) void loadLocale(value)
}

const languageOf = new WeakMap<object, Locale>()

/** Tags a builder with its language, so every view that holds the builder can read its copy. */
export const speak = <H extends object>(locale: Locale, h: H): H => {
  languageOf.set(h, locale)
  return h
}

export const localeOf = (h: object): Locale => languageOf.get(h) ?? 'en'

/** The copy in a language, for code that has the locale but no builder. English covers a catalog
 *  that has not finished loading, so a view never waits on the network to render. */
export const copyIn = (locale: Locale): Messages => messages[locale] ?? en

/** The copy in the language of this view's builder. A builder nobody tagged speaks English. */
export const copy = (h: object): Messages => copyIn(languageOf.get(h) ?? 'en')

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
