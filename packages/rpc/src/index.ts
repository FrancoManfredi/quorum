export { ApiError } from './errors.ts'
export { API_PREFIX, INGEST_PREFIX, ROOM_PATH, ROOM_SOCKET_PATH, RPC_PATH } from './paths.ts'
export { RoomInfo, RoomOpened, RoomPublish, RoomQuery, RoomRpc } from './room.ts'
export { SurveyExit, SurveyReceipt, SurveyRpc, SurveySubmission } from './survey.ts'
export { SystemRpc, SystemStatus } from './system.ts'

import { RoomRpc } from './room.ts'
import { SurveyRpc } from './survey.ts'
import { SystemRpc } from './system.ts'

/** The complete wire contract served by the API Worker. */
export class Api extends SystemRpc.merge(SurveyRpc).merge(RoomRpc) {}
