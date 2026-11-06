import { Schema } from 'effect'

export const supportedLocales = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'zh-CN', label: '简体中文' },
] as const

export const Locale = Schema.Literals(supportedLocales.map(({ value }) => value))
export type Locale = typeof Locale.Type
