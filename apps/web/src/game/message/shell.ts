import { Menu, SettingsSection } from '../model.ts'
import { Url } from 'foldkit/url'
import { UrlRequest } from 'foldkit/navigation'

/** The shell Messages, as cases for the root union. */
export const shellCases = {
  Continued: {},
  Connected: {},
  TitleOpened: {},
  /** The badge goes into the reader on the splash; the title follows. */
  ClockedIn: {},
  TitleRevealed: {},
  MenuChosen: { menu: Menu },
  /** The Settings section the title's page shows. */
  SettingsSectionChosen: { section: SettingsSection },
  /** URL routing: a link click, a new URL from any source, and a finished navigation. */
  ClickedLink: { request: UrlRequest },
  ChangedUrl: { url: Url },
  Navigated: {},

  /** Guided and free Sandboxes, and the Sandbox store read once at boot. */
}
