import { Option } from 'effect'
import { KEY_FIELD_MAX, parseAccess } from '../access.ts'
import { CheckFeatureKey, WriteAccess } from '../commands.ts'
import { KeyPhase, keyStep } from '../key-machine.ts'
import { EMPTY_ACCESS, type Access, type Model } from '../model.ts'
import { say, withToast, type MessageCases, type UpdateResult } from './shared.ts'

/* ==========================================================================
   The feature key this browser holds. Settings types it, the API Worker says
   what it unlocks, and the browser keeps the answer next to its settings.
   ========================================================================== */

type AccessTag =
  | 'AccessLoaded'
  | 'FeatureKeyAsked'
  | 'KeyTyped'
  | 'KeySubmitted'
  | 'KeyAccepted'
  | 'KeyRefused'
  | 'KeyCleared'

/** Writes the key this browser keeps, so the next load opens what it unlocks. */
const kept = (model: Model, access: Access): UpdateResult => ({
  model,
  commands: [WriteAccess({ access })],
})

export const accessHandlers = (model: Model): MessageCases<UpdateResult, AccessTag> => ({
  AccessLoaded: ({ json }) =>
    Option.match(json === null ? Option.none() : parseAccess(json), {
      onNone: () => ({ model }),
      onSome: (access) => ({ model: { ...model, access, keyDraft: access.key ?? '' } }),
    }),

  // Settings opens on the section that takes a key, so a locked feature leads straight to it.
  FeatureKeyAsked: () => ({
    model: { ...model, panel: 'settings', settingsSection: 'access' },
  }),

  KeyTyped: ({ value }) => ({
    model: {
      ...model,
      keyDraft: value.slice(0, KEY_FIELD_MAX),
      keyPhase: keyStep(model.keyPhase, { _tag: 'Edited' }),
    },
  }),

  KeySubmitted: () => {
    const key = model.keyDraft.trim()
    // A second press while the check is in flight would ask twice for one key.
    if (key === '' || KeyPhase.guards.Checking(model.keyPhase)) return { model }
    const phase = keyStep(model.keyPhase, { _tag: 'Submitted' })
    return {
      model: { ...model, keyPhase: phase, keyDraft: key },
      commands: [CheckFeatureKey({ key, unreachable: say(model).panels.featureKeyUnreachable })],
    }
  },

  KeyAccepted: ({ key, features, expiresAt }) => {
    const access: Access = { key, features, expiresAt }
    const next: Model = {
      ...model,
      access,
      keyDraft: key,
      keyPhase: keyStep(model.keyPhase, { _tag: 'Accepted' }),
    }
    return withToast(next, say(model).panels.featureKeyAccepted, 'ok', [WriteAccess({ access })])
  },

  KeyRefused: ({ note }) => ({
    model: { ...model, keyPhase: keyStep(model.keyPhase, { _tag: 'Refused', note }) },
  }),

  KeyCleared: () => {
    const next: Model = {
      ...model,
      access: EMPTY_ACCESS,
      keyDraft: '',
      keyPhase: keyStep(model.keyPhase, { _tag: 'Cleared' }),
    }
    return kept(next, EMPTY_ACCESS)
  },
})
