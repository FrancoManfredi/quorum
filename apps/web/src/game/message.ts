import { defineMessageUnion } from 'foldkit/message'

import { canvasCases } from './message/canvas.ts'
import { clockCases } from './message/clock.ts'
import { companiesCases } from './message/companies.ts'
import { exitCases } from './message/exit.ts'
import { incidentsCases } from './message/incidents.ts'
import { keysCases } from './message/keys.ts'
import { mirrorsCases } from './message/mirrors.ts'
import { optionsCases } from './message/options.ts'
import { panelsCases } from './message/panels.ts'
import { saveCases } from './message/save.ts'
import { sessionCases } from './message/session.ts'
import { shellCases } from './message/shell.ts'
import { teamCases } from './message/team.ts'
import { tradeoffCases } from './message/tradeoff.ts'

/* ==========================================================================
   Every gesture in Quorum becomes one of these. The cases live in ./message,
   one file per subject; this file composes the union.
   ========================================================================== */

export const Message = defineMessageUnion({
  ...canvasCases,
  ...clockCases,
  ...companiesCases,
  ...exitCases,
  ...incidentsCases,
  ...keysCases,
  ...mirrorsCases,
  ...optionsCases,
  ...panelsCases,
  ...saveCases,
  ...sessionCases,
  ...shellCases,
  ...teamCases,
  ...tradeoffCases,
})

export type Message = typeof Message.Type
