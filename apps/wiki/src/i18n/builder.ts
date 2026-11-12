import type { Locale } from './locale.ts'
import { isWikiHref, withLocale } from './locale.ts'

/* A view writes `h.Href('/components/lb')` and never names a language. The builder of a Spanish
   page is the same builder under another identity whose `Href` points a wiki link into `/es`,
   so every link a page renders, whether authored, generated or drawn by a component, follows
   the page's language. The identity also carries the language, so a component that holds only
   the builder can read it with `localeOf(h)`. English is the builder itself.

   Foldkit's views for a submodel receive the unwrapped singleton, so a submodel that renders
   links or copy takes its language from its Model or its view inputs instead. */

const languages = new WeakMap<object, Locale>()
const roots = new WeakMap<object, object>()
const cache = new WeakMap<object, Map<Locale, object>>()

export const builderFor = <H extends object>(locale: Locale, h: H): H => {
  if (locale === 'en') return h
  const known = cache.get(h) ?? new Map<Locale, object>()
  cache.set(h, known)
  const cached = known.get(locale)
  if (cached) return cached as H
  const href = (h as unknown as { Href: (value: string) => unknown }).Href
  const wrapped = new Proxy(h, {
    get: (target, key) =>
      key === 'Href'
        ? (value: string) => href(isWikiHref(value) ? withLocale(locale, value) : value)
        : Reflect.get(target, key),
  })
  languages.set(wrapped, locale)
  roots.set(wrapped, h)
  known.set(locale, wrapped)
  return wrapped
}

/** The language of the page this builder draws; a builder nobody wrapped draws English. */
export const localeOf = (h: object): Locale => languages.get(h) ?? 'en'

/** The builder before its links were pointed into a language, for a link that names its own. */
export const rootBuilder = <H extends object>(h: H): H => (roots.get(h) as H | undefined) ?? h
