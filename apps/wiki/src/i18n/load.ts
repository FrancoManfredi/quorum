import type { Locale } from './locale.ts'

/** Brings a language's bundle in: its copy, its catalog words and its prose. English ships in the
    main chunk. The others are separate chunks, so a reader of English never downloads them. The
    bundle registers itself when it loads, and loading it twice is free. */
export const loadLocale = async (locale: Locale): Promise<void> => {
  if (locale === 'es') await import('../locales/es.ts')
}
