import { type Locale, translate } from './index.ts'

/* ==========================================================================
   Foldkit's view-identity transform stamps each vnode with the first function
   that returns it, so this module is left out of that transform in
   vite.config.ts: the elements built here belong to the view that called them,
   in every locale. Keep it free of anything else.
   ========================================================================== */

const attributesToTranslate = new Set(['Title', 'Alt', 'Placeholder', 'AriaLabel'])
const builders = new WeakMap<object, Map<Locale, unknown>>()

/**
 * The builder views write with, translating as it builds: a string child or a Title, Alt,
 * Placeholder or AriaLabel attribute passes through `translate` when its element is made. English
 * is the builder itself, so the common case copies nothing, and the result for a locale is
 * cached so a memoized view still sees one builder.
 */
export const localizeBuilder = <H extends object>(locale: Locale, h: H): H => {
  if (locale === 'en') return h
  const known = builders.get(h) ?? new Map<Locale, unknown>()
  builders.set(h, known)
  const cached = known.get(locale)
  if (cached) return cached as H
  const wrapped = new Map<PropertyKey, unknown>()
  const localizeChildren = (args: ReadonlyArray<unknown>): ReadonlyArray<unknown> =>
    args.map((arg, index) =>
      index > 0 && Array.isArray(arg) && arg.some((child) => typeof child === 'string')
        ? arg.map((child) => (typeof child === 'string' ? translate(locale, child) : child))
        : arg,
    )
  const localizeBuilt = (key: PropertyKey, value: unknown): unknown => {
    if (typeof value !== 'function') return value
    const cachedValue = wrapped.get(key)
    if (cachedValue) return cachedValue
    const fn = value as (...args: ReadonlyArray<unknown>) => unknown
    const next =
      key === 'keyed'
        ? (tag: unknown) => {
            const element = fn(tag) as (...args: ReadonlyArray<unknown>) => unknown
            return (...args: ReadonlyArray<unknown>) => element(...localizeChildren(args))
          }
        : typeof key === 'string' && attributesToTranslate.has(key)
          ? (text: string) => fn(translate(locale, text))
          : typeof key === 'string' && /^[a-z]/.test(key) && key !== 'empty' && key !== 'submodel'
            ? (...args: ReadonlyArray<unknown>) => fn(...localizeChildren(args))
            : value
    wrapped.set(key, next)
    return next
  }
  const localized = new Proxy(h, {
    get: (target, key) => localizeBuilt(key, Reflect.get(target, key)),
  }) as H
  known.set(locale, localized)
  return localized
}
