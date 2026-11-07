import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { Schema } from 'effect'
import { Locale } from '../i18n/index.ts'
import type { Prefs } from './model.ts'

/* The Settings panel's toggles, folded into the parent with foldChild. The parent saves and applies the result. */

export const PrefsMessage = defineMessageUnion({
  LocaleChosen: { locale: Locale },
  MuteToggled: {},
  VolumeChanged: { volume: Schema.Finite },
  AutoPauseToggled: {},
  BlurPauseToggled: {},
  EasyModeToggled: {},
  AgentAccessToggled: {},
  MotionToggled: {},
  AnalyticsToggled: {},
  TextToggled: {},
  ThemeToggled: {},
})
export type PrefsMessage = typeof PrefsMessage.Type

/** The sound level, kept between silent and the mastered mix. */
export const volumeIn = (volume: number): number => Math.min(100, Math.max(0, volume))

export const updatePrefs = (
  prefs: Prefs,
  message: PrefsMessage,
): Update.Return<Prefs, PrefsMessage> =>
  PrefsMessage.match<Update.Return<Prefs, PrefsMessage>>(message, {
    LocaleChosen: ({ locale }) => ({ model: { ...prefs, locale } }),
    MuteToggled: () => ({ model: { ...prefs, muted: !prefs.muted } }),
    VolumeChanged: ({ volume }) => ({ model: { ...prefs, volume: volumeIn(volume) } }),
    AutoPauseToggled: () => ({ model: { ...prefs, autoPause: !prefs.autoPause } }),
    BlurPauseToggled: () => ({ model: { ...prefs, blurPause: !prefs.blurPause } }),
    EasyModeToggled: () => ({ model: { ...prefs, easyMode: !prefs.easyMode } }),
    AgentAccessToggled: () => ({ model: { ...prefs, agentAccess: !prefs.agentAccess } }),
    MotionToggled: () => ({
      model: { ...prefs, motion: prefs.motion === 'reduce' ? 'system' : 'reduce' },
    }),
    AnalyticsToggled: () => ({ model: { ...prefs, analytics: !prefs.analytics } }),
    TextToggled: () => ({
      model: { ...prefs, text: prefs.text === 'large' ? 'normal' : 'large' },
    }),
    ThemeToggled: () => ({
      model: { ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' },
    }),
  })
