import { def } from './define.ts'
import { REQUEST_KINDS } from '../catalog/kinds.ts'
import type { LanguageId } from '../catalog/runtimes.ts'

/**
 * A Serverless Function's bill (09 "The cloud bill"): dollars per request, and dollars per
 * GB-second, × cost index, on the Requests line. AWS Lambda lists $0.20 per million requests and
 * $0.0000166667 per GB-second. At those straight rates a per-use bill is about 3,600× cheaper than
 * the time-billed compute beside it (09 "How prices map to real prices"), so a function would never
 * cost as much as the VM it replaces and 05's cost curve could not cross. Both are multiplied by
 * 1,200, which puts the crossover at about 30% of an equal VM's steady load.
 */
export const SERVERLESS_REQUEST_PRICE = 0.00024
export const SERVERLESS_GB_SECOND = 0.02
/** GB one execution bills for each second it runs: Lambda's common 1,024 MB (05).  */
export const SERVERLESS_MEMORY_GB = 1
/** Executions one Serverless Function runs at once, per region (05 "Concurrency cap"). */
export const SERVERLESS_CONCURRENCY = 1_000
/**
 * Sim seconds an execution environment stays warm after its last invocation (05 "Cold starts").
 * AWS reaps an idle environment after 5 to 15 minutes; one sim second is one calendar minute, so
 * 5 s.
 */
export const SERVERLESS_IDLE_SECONDS = 5
/**
 * Milliseconds a cold start costs by language (05 "Cold starts"): Rust and Go 50, Node and Python
 * 200, .NET 500, JVM 2,000. PHP, Ruby, Elixir, Zig and Haskell follow in the same order.
 */
export const COLD_START_MS: Record<LanguageId, number> = {
  go: 50,
  rust: 50,
  zig: 50,
  haskell: 100,
  node: 200,
  python: 200,
  php: 200,
  ruby: 300,
  csharp: 500,
  elixir: 500,
  java: 2_000,
}
/** Milliseconds a cold start costs an ahead-of-time binary: the design's GraalVM native image. */
export const NATIVE_COLD_MS = 100
/**
 * A Serverless Function stops an execution after 15 minutes (05 \"Serverless Function\"). An export
 * (`job`) reads the rows the Databases hold, so its run time grows with them: `EXPORT_MS_PER_GB`
 * milliseconds for each GB. A Function that has to export more than the limit allows fails it
 * as `timeout`; a Worker behind a Queue has no limit.
 */
export const FUNCTION_LIMIT_MS = 900_000
export const EXPORT_MS_PER_GB = 4_000

/** Milliseconds an invocation spends on its own bookkeeping before its code runs.  */
export const SERVERLESS_MS = 1

// It runs the Service's code per request and owns no box: idle costs nothing, a use bills
// (09 "The cloud bill"), and an environment that went away starts cold.
export const fnDef = def({
  id: 'fn',
  code: 'fn',
  name: 'Serverless Function',
  product: 'AWS Lambda',
  group: 'compute',
  blurb:
    'Runs your code per request with no box to pay for: nothing while it idles, a cold start when it has, and 1,000 executions at once.',
  cost: 0,
  latency: SERVERLESS_MS,
  accepts: REQUEST_KINDS.filter((kind) => kind !== 'rt'),
  sends: [
    'q-read',
    'q-write',
    'auth',
    'q-search',
    'q-vector',
    'blob-put',
    'blob-get',
    'q-tx',
    'charge',
    'q-scan',
    'infer',
    'notify',
    'callout',
    'k-write',
  ],
  unlock: 'serverless',
  stack: true,
  limiting: true,
  coldStart: true,
})
