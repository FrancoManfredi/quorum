import { Schema } from 'effect'

/* The wiki's languages. English lives at the root and Spanish under `/es`, with the same slugs.
   A page's logical path (`/glossary/latency`) never carries the prefix; only a URL does. */

export const LOCALES = ['en', 'es'] as const
export const Locale = Schema.Literals(LOCALES)
export type Locale = typeof Locale.Type

export const DEFAULT_LOCALE: Locale = 'en'

/** What each language calls itself, so the switcher reads the same on every page. */
export const LOCALE_NAMES: Readonly<Record<Locale, string>> = { en: 'English', es: 'Español' }

/** The value of `og:locale` and the language tag of `<html lang>`, `hreflang` and JSON-LD. */
export const LOCALE_TAGS: Readonly<Record<Locale, Readonly<{ lang: string; og: string }>>> = {
  en: { lang: 'en', og: 'en_US' },
  es: { lang: 'es', og: 'es_ES' },
}

const PREFIX: Readonly<Record<Locale, string>> = { en: '', es: '/es' }

/** The language a URL path is in: `/es` and everything under it is Spanish. */
export const localeOfPath = (pathname: string): Locale =>
  pathname === '/es' || pathname.startsWith('/es/') || pathname.startsWith('/es#') ? 'es' : 'en'

/** The logical path of a URL path: `/es/glossary/latency` is `/glossary/latency`, `/es` is `/`. */
export const stripLocale = (pathname: string): string => {
  if (localeOfPath(pathname) === 'en') return pathname
  const rest = pathname.slice(PREFIX.es.length)
  return rest === '' || rest.startsWith('#') ? `/${rest}` : rest
}

/** The URL path of a logical path in a language. A `#fragment` stays at the end. */
export const withLocale = (locale: Locale, path: string): string => {
  const prefix = PREFIX[locale]
  if (prefix === '') return path
  if (path === '/') return prefix
  if (path.startsWith('/#')) return `${prefix}${path.slice(1)}`
  return `${prefix}${path}`
}

/** An internal link to a wiki page, which a Spanish page points into `/es`. A link that already
    names a language, a file such as `/og.png`, and every other kind of URL stay as written. */
export const isWikiHref = (href: string): boolean => {
  if (!href.startsWith('/') || href.startsWith('//')) return false
  if (localeOfPath(href) === 'es') return false
  const path = href.split('#')[0] ?? href
  return !/\.[a-z0-9]+$/i.test(path.split('/').pop() ?? '')
}
