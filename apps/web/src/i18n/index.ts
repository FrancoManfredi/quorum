import { Schema } from 'effect'
import { zhCN } from './zh-CN.ts'
import { fr } from './fr.ts'

export const supportedLocales = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'zh-CN', label: '简体中文' },
] as const

export const Locale = Schema.Literals(supportedLocales.map(({ value }) => value))
export type Locale = typeof Locale.Type

const dictionaries = { fr, 'zh-CN': zhCN }

const compile = (dictionary: Readonly<Record<string, string>>) =>
  Object.entries(dictionary)
    .filter(([key]) => /\{\d+\}/.test(key))
    .map(([key, value]) => {
      const parts = key.split(/\{\d+\}/)
      const slots = Array.from(key.matchAll(/\{(\d+)\}/g), (match) => match[1]!)
      // Compact durations such as "{0}h" contain numbers, not arbitrary words
      // ending in h (including the language name "English").
      // A key with one or two letters of its own ("D{0}", "R{0}") would match any text that starts or ends with them.
      const short = parts.join('').length <= 2
      const capture = /^\{\d+\}[dhms]$/.test(key) || short ? '([\\d.,:+−\\s-]+)' : '(.*?)'
      const expression = parts
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join(capture)
      return {
        pattern: new RegExp(`^${expression}$`, 's'),
        prefix: parts[0]!,
        suffix: parts[parts.length - 1]!,
        specificity: parts.join('').length,
        slots,
        value,
      }
    })
    // A broad message such as "{0} users" must not shadow a whole explanation.
    .filter(({ specificity }) => specificity > 0)
    .sort((a, b) => b.specificity - a.specificity)

const patterns = { fr: compile(fr), 'zh-CN': compile(zhCN) }

/** Translations already worked out, so a repeated string skips the pattern scan. */
const remembered = { fr: new Map<string, string>(), 'zh-CN': new Map<string, string>() }
const REMEMBER_LIMIT = 5_000

/** Translate complete presentation messages; never replace words inside unknown prose. */
export const translate = (locale: Locale, text: string): string => {
  if (locale === 'en') return text
  const memo = remembered[locale]
  const known = memo.get(text)
  if (known !== undefined) return known
  const result = translateUncached(locale, text)
  // Dynamic strings such as "1.2k users" are unbounded, so the memo starts over when it fills.
  if (memo.size >= REMEMBER_LIMIT) memo.clear()
  memo.set(text, result)
  return result
}

const translateUncached = (locale: Exclude<Locale, 'en'>, text: string): string => {
  const dictionary = dictionaries[locale]
  const direct = Object.hasOwn(dictionary, text) ? dictionary[text] : undefined
  if (direct !== undefined) return direct
  // Lists are assembled from catalog labels (for example newly shipped Features).
  // Only translate a list when every item is known; unknown prose keeps its fallback.
  const list = text.split(/(, | · )/)
  if (
    list.length > 1 &&
    list.every((part, index) => index % 2 === 1 || Object.hasOwn(dictionary, part))
  )
    return list.map((part, index) => (index % 2 === 1 ? part : dictionary[part])).join('')
  for (const { pattern, prefix, suffix, slots, value } of patterns[locale]) {
    if (!text.startsWith(prefix) || !text.endsWith(suffix)) continue
    const match = pattern.exec(text)
    if (match) {
      const values = new Map(slots.map((slot, index) => [slot, match[index + 1] ?? '']))
      return value.replace(/\{(\d+)\}/g, (_, index: string) =>
        translate(locale, values.get(index) ?? ''),
      )
    }
  }
  return text
}

/** Fills a value into a message in this language: values from the Simulation are English text. */
export const inLanguage =
  (locale: Locale) =>
  (value: unknown): string =>
    translate(locale, String(value))
