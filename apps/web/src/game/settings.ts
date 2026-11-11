import { UrlRequest } from 'foldkit/navigation'
import { ArrowUpRight, ClipboardPaste, Copy, Download, Upload, type IconNode } from 'lucide'
import type { Messages } from '@/i18n/messages.ts'
import { PRIVACY_URL } from '@/platform/analytics.ts'
import { Message } from './message.ts'
import type { Prefs, SettingsSection } from './model.ts'
import { PrefsMessage } from './prefs.ts'

/** One Settings row. The title screen's page and the board's panel render the same list. */
export type Setting =
  | Readonly<{ kind: 'volume'; label: string; value: number }>
  | Readonly<{ kind: 'toggle'; id: string; label: string; isOn: boolean; message: Message }>
  | Readonly<{ kind: 'language'; label: string }>
  | Readonly<{ kind: 'action'; id: string; label: string; glyph: IconNode; message: Message }>

export type SettingSection = Readonly<{
  id: SettingsSection
  label: string
  rows: ReadonlyArray<Setting>
}>

/**
 * Settings grouped once, so the title screen and the board cannot drift apart. Each
 * surface renders the rows with its own control: a booth row on the title, a switch
 * in the panel.
 */
export const settingsSections = (prefs: Prefs, t: Messages): ReadonlyArray<SettingSection> => {
  const changed = (message: PrefsMessage): Message => Message.PrefsChanged({ message })
  const toggle = (id: string, label: string, isOn: boolean, message: PrefsMessage): Setting => ({
    kind: 'toggle',
    id,
    label,
    isOn,
    message: changed(message),
  })
  return [
    {
      id: 'sound',
      label: t.panels.sound,
      rows: [
        { kind: 'volume', label: t.panels.volume, value: prefs.volume },
        toggle('mute', t.panels.muteSoundM, prefs.muted, PrefsMessage.MuteToggled()),
      ],
    },
    {
      id: 'play',
      label: t.panels.play,
      rows: [
        toggle('easy-mode', t.panels.easyMode, prefs.easyMode, PrefsMessage.EasyModeToggled()),
        ...(prefs.easyMode
          ? [
              toggle(
                'auto-pause',
                t.panels.pauseOnSEV1AndSEV2,
                prefs.autoPause,
                PrefsMessage.AutoPauseToggled(),
              ),
            ]
          : []),
        toggle(
          'blur-pause',
          t.panels.pauseOnBlur,
          prefs.blurPause,
          PrefsMessage.BlurPauseToggled(),
        ),
      ],
    },
    {
      id: 'display',
      label: t.panels.display,
      rows: [
        toggle(
          'motion',
          t.panels.reduceMotion,
          prefs.motion === 'reduce',
          PrefsMessage.MotionToggled(),
        ),
        toggle('text', t.panels.textAt150, prefs.text === 'large', PrefsMessage.TextToggled()),
        toggle('theme', t.panels.darkMode, prefs.theme === 'dark', PrefsMessage.ThemeToggled()),
        { kind: 'language', label: t.panels.language },
      ],
    },
    {
      id: 'privacy',
      label: t.panels.privacy,
      rows: [
        toggle(
          'agent-access',
          t.panels.agentAccess,
          prefs.agentAccess,
          PrefsMessage.AgentAccessToggled(),
        ),
        toggle(
          'analytics',
          t.panels.shareAnonymousUsageData,
          prefs.analytics,
          PrefsMessage.AnalyticsToggled(),
        ),
        {
          kind: 'action',
          id: 'privacy-policy',
          label: t.panels.privacyPolicy,
          glyph: ArrowUpRight,
          message: Message.ClickedLink({ request: UrlRequest.External({ href: PRIVACY_URL }) }),
        },
      ],
    },
    {
      id: 'save',
      label: t.panels.save,
      rows: [
        {
          kind: 'action',
          id: 'save-export',
          label: t.panels.copySaveAsText,
          glyph: Copy,
          message: Message.SaveExported(),
        },
        {
          kind: 'action',
          id: 'save-download',
          label: t.panels.downloadSaveFile,
          glyph: Download,
          message: Message.SaveDownloaded(),
        },
        {
          kind: 'action',
          id: 'save-file',
          label: t.panels.importSaveFile,
          glyph: Upload,
          message: Message.SaveFileAsked(),
        },
        {
          kind: 'action',
          id: 'save-paste',
          label: t.panels.pasteASave,
          glyph: ClipboardPaste,
          message: Message.SaveImportAsked(),
        },
        {
          kind: 'action',
          id: 'copy-state',
          label: t.panels.copyStateAsJSON,
          glyph: Copy,
          message: Message.StateCopied(),
        },
      ],
    },
  ]
}
