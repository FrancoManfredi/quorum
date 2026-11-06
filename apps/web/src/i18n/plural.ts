import type { Locale } from './index.ts'

const rules = new Map<Locale, Intl.PluralRules>()

/** Whether `count` takes the language's singular form, by CLDR rules: French counts 0 as one, Chinese has no plural. */
export const isOne = (locale: Locale, count: number): boolean => {
  const known = rules.get(locale) ?? new Intl.PluralRules(locale)
  rules.set(locale, known)
  return known.select(count) === 'one'
}
