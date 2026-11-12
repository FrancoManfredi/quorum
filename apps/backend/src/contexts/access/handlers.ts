import { Effect } from 'effect'
import { AccessRpc } from '@quorum/rpc'
import { FeatureGate } from './gate.ts'

/* One key, checked against the whitelist. The browser keeps the key; the API keeps a hash of it. */

export const AccessHandlers = AccessRpc.toLayer(
  Effect.gen(function* () {
    const gate = yield* FeatureGate
    return AccessRpc.of({
      featureKeyCheck: ({ key }) => gate.check(key).pipe(Effect.withSpan('access.check')),
    })
  }),
)
