import { Schema } from 'effect'
import type { KeyedFeature } from '@quorum/rpc'
import type { Messages } from '@/i18n/messages.ts'
import { Access, type Model, type Tone } from './model.ts'
import { KeyPhase } from './key-machine.ts'

/* ==========================================================================
   Feature keys: what a key unlocks on this browser, and how Settings says it.
   The API Worker decides what a key is worth; this file only reads the answer.
   ========================================================================== */

/** A key is 19 characters of four groups; the field takes a pasted key and a little slack. */
export const KEY_FIELD_MAX = 40

/** The features this build gates, in the order Settings names them. */
export const KEYED_FEATURES = ['multiplayer'] as const satisfies ReadonlyArray<KeyedFeature>

/** Whether this browser holds a key that unlocks `feature`. */
export const unlocked = (access: Access, feature: KeyedFeature): boolean =>
  access.features.includes(feature)

/** Online Rooms are the one feature behind a key today. */
export const canPlayOnline = (model: Model): boolean => unlocked(model.access, 'multiplayer')

/** The names of features, in the language of the copy the caller holds. */
const namesOf = (features: ReadonlyArray<KeyedFeature>, t: Messages): string =>
  features.map((id) => t.panels.featureNames[id]).join(', ')

/** What the Settings field says under the key: the state, or why the check failed. */
export const keyNote = (model: Model, t: Messages): Readonly<{ text: string; tone: Tone }> => {
  if (KeyPhase.guards.Checking(model.keyPhase))
    return { text: t.panels.featureKeyChecking, tone: 'plain' }
  if (KeyPhase.guards.Refused(model.keyPhase)) return { text: model.keyPhase.note, tone: 'warn' }
  if (model.access.key === null)
    return { text: t.panels.featuresLocked(namesOf(KEYED_FEATURES, t)), tone: 'plain' }
  const unlockedNames = namesOf(
    KEYED_FEATURES.filter((id) => unlocked(model.access, id)),
    t,
  )
  const until =
    model.access.expiresAt === null
      ? ''
      : ` ${t.panels.featureKeyActiveUntil(
          new Date(model.access.expiresAt).toLocaleDateString(model.prefs.locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        )}`
  return { text: `${t.panels.featuresUnlocked(unlockedNames)}${until}`, tone: 'ok' }
}

/** A stored key read back from the browser, or none when it does not decode. */
export const parseAccess = Schema.decodeOption(Schema.fromJsonString(Access))
