import { report } from './report.ts'

/* A Worker for `engines/workerd.mjs`: it answers with the hashes workerd computes. */

export default { fetch: (): Response => Response.json(report()) }
