export { ApiError } from './errors.ts'
export { API_PREFIX, INGEST_PREFIX, RPC_PATH } from './paths.ts'
export { SurveyExit, SurveyReceipt, SurveyRpc, SurveySubmission } from './survey.ts'
export { SystemRpc, SystemStatus } from './system.ts'

import { SurveyRpc } from './survey.ts'
import { SystemRpc } from './system.ts'

/** The complete wire contract served by the API Worker. */
export class Api extends SystemRpc.merge(SurveyRpc) {}
