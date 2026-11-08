import { LLM_FIRST_TOKEN_MS, LLM_RATE } from '../catalog.ts'

import { flatModel } from '../capacity.ts'
import { flatScale } from '../lookups.ts'
import { through } from '../distribution.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// A Managed Component with a rate limit: past it, prompts fail as `throttled` at once.
export const llmRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      LLM_RATE * flatScale(node),
      arriving,
      { fixedMs: LLM_FIRST_TOKEN_MS, variableMs: 0 },
      solver.boost(node),
    ),
  outcome: (answer, _, kind) => through({ ...answer.ownHop(kind), cause: 'throttled' }),
  ...terminal,
}
