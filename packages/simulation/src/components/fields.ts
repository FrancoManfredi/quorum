import { analyticsFields } from './analytics.ts'
import { serverFields } from './server.ts'
import { lbFields } from './lb.ts'
import { pspFields } from './psp.ts'
import { cdnFields } from './cdn.ts'
import { cacheFields } from './cache.ts'
import { databaseFields } from './database.ts'
import { replicaFields } from './replica.ts'
import { searchFields } from './search.ts'
import { storageFields } from './storage.ts'
import { gwFields } from './gw.ts'
import { queueFields } from './queue.ts'
import { clusterFields } from './cluster.ts'
import { wafFields } from './waf.ts'
import { ciFields } from './ci.ts'
import { wsFields } from './ws.ts'
import { autoscalerFields } from './autoscaler.ts'
import { gpuFields } from './gpu.ts'
import { wideFields } from './wide.ts'
import { docFields } from './doc.ts'
import { vecFields } from './vec.ts'
import { logFields } from './log.ts'
import { poolerFields } from './pooler.ts'

/** Every Component's saved properties, merged. The wire order lives in state.ts. */
export const COMPONENT_FIELDS = {
  ...analyticsFields,
  ...serverFields,
  ...lbFields,
  ...pspFields,
  ...cdnFields,
  ...cacheFields,
  ...databaseFields,
  ...replicaFields,
  ...searchFields,
  ...storageFields,
  ...gwFields,
  ...queueFields,
  ...clusterFields,
  ...wafFields,
  ...ciFields,
  ...wsFields,
  ...autoscalerFields,
  ...gpuFields,
  ...wideFields,
  ...docFields,
  ...vecFields,
  ...logFields,
  ...poolerFields,
} as const
