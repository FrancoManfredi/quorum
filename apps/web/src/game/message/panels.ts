import { DashboardMessage } from '../dashboard.ts'
import { GlossaryMessage } from '../glossary.ts'
import { InboxMessage } from '../inbox.ts'
import { Combobox, Listbox, Menu as UiMenu } from '@foldkit/ui'
import { Panel, Tone } from '../model.ts'
import { PrefsMessage } from '../prefs.ts'
import { SurveyMessage } from '../survey.ts'
import { Schema } from 'effect'

/** The panels Messages, as cases for the root union. */
export const panelsCases = {
  PanelOpened: { panel: Panel },
  /** A fix in the Churn breakdown: open or show a region, a research item, or a Node. */
  ChurnFixTaken: {
    fix: Schema.Literals(['region', 'research', 'node']),
    target: Schema.String,
  },
  PanelClosed: {},

  /** Settings and the Glossary (15). Each panel is a Submodel with its own Messages. */
  PrefsLoaded: { json: Schema.NullOr(Schema.String) },
  PrefsChanged: { message: PrefsMessage },
  /** The Exit survey's two fields; the parent sends the answers. */
  SurveyChanged: { message: SurveyMessage },
  /** The window lost focus. */
  WindowBlurred: {},
  /** The window got focus back. */
  WindowFocused: {},
  InsightHelpToggled: {},
  GlossaryOpened: { id: Schema.NullOr(Schema.String) },
  GlossaryChanged: { message: GlossaryMessage },
  InboxChanged: { message: InboxMessage },

  /** The save as text (15 "Save"): copied out, or asked for and pasted back. */
  DashboardChanged: { message: DashboardMessage },
  LanguagePickerChanged: { message: Listbox.Message },
  /** The searchable Stack pickers on the Inspector. */
  RuntimePickerChanged: { message: Combobox.Message },
  FrameworkPickerChanged: { message: Combobox.Message },
  MoreMenuChanged: { message: UiMenu.Message },
  ToastRaised: { message: Schema.String, tone: Tone },
  ToastCleared: { id: Schema.Finite },
  /** A Command finished applying something to the DOM. Nothing reads it. */
  Synced: {},
}
