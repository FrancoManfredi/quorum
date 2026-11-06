import type { Locale } from './index.ts'
import { speak } from './messages.ts'

/* ==========================================================================
   Foldkit's view-identity transform stamps each vnode with the first function
   that returns it, so this module is left out of that transform in
   vite.config.ts. It builds no elements itself, but keep it free of anything else.
   ========================================================================== */

const builders = new WeakMap<object, Map<Locale, object>>()

/**
 * The builder views write with, for a language. It is the same builder under another identity that
 * carries its language, so `copy(h)` finds the typed copy; English is the builder itself. The result
 * for a locale is cached, so a memoized view that takes `h` as an argument still sees one builder.
 */
export const localizeBuilder = <H extends object>(locale: Locale, h: H): H => {
  if (locale === 'en') return h
  const known = builders.get(h) ?? new Map<Locale, object>()
  builders.set(h, known)
  const cached = known.get(locale)
  if (cached) return cached as H
  const localized = speak(locale, new Proxy(h, {}))
  known.set(locale, localized)
  return localized
}
