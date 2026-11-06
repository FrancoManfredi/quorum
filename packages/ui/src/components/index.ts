import type { ComponentId } from '@quorum/simulation/catalog'
import { users } from './users.ts'
import { payments } from './payments.ts'
import { analytics } from './analytics.ts'
import { server } from './server.ts'
import { database } from './database.ts'
import { dns } from './dns.ts'
import { lb } from './lb.ts'
import { pooler } from './pooler.ts'
import { cache } from './cache.ts'
import { replica } from './replica.ts'
import { auth } from './auth.ts'
import { search } from './search.ts'
import { storage } from './storage.ts'
import { doc } from './doc.ts'
import { queue } from './queue.ts'
import { worker } from './worker.ts'
import { log } from './log.ts'
import { fn } from './fn.ts'
import { cdn } from './cdn.ts'
import { waf } from './waf.ts'
import { gw } from './gw.ts'
import { ws } from './ws.ts'
import { psp } from './psp.ts'
import { autoscaler } from './autoscaler.ts'
import { ci } from './ci.ts'
import { cluster } from './cluster.ts'
import { warehouse } from './warehouse.ts'
import { vec } from './vec.ts'
import { gpu } from './gpu.ts'
import { edge } from './edge.ts'
import { llm } from './llm.ts'
import { msgp } from './msgp.ts'
import { wide } from './wide.ts'
import { dsql } from './dsql.ts'
import { cdc } from './cdc.ts'
import { mesh } from './mesh.ts'
import { ff } from './ff.ts'
import { pki } from './pki.ts'
import type { ComponentView } from './shared.ts'

/** Every Component's board appearance, one module each. */
export const COMPONENT_VIEWS: Record<ComponentId, ComponentView> = {
  users,
  payments,
  analytics,
  server,
  database,
  dns,
  lb,
  pooler,
  cache,
  replica,
  auth,
  search,
  storage,
  doc,
  queue,
  worker,
  log,
  fn,
  cdn,
  waf,
  gw,
  ws,
  psp,
  autoscaler,
  ci,
  cluster,
  warehouse,
  vec,
  gpu,
  edge,
  llm,
  msgp,
  wide,
  dsql,
  cdc,
  mesh,
  ff,
  pki,
}
