import type { Ack, Status, Upload } from '@quorum/agent/snapshot'

/* ==========================================================================
   The methods the API Worker calls on an agent Room, as its namespace stub
   exposes them. The rules and storage live in the platform adapter.
   ========================================================================== */

export type AgentRoomStub = Readonly<{
  write: (upload: Upload, key: string) => Promise<Ack>
  clear: (key: string) => Promise<void>
  read: (name: string, input: Record<string, unknown>) => Promise<string>
  status: () => Promise<Status | null>
}>

/** The namespace as the Worker sees it. One Room per id. */
export type AgentRooms = Readonly<{
  getByName: (id: string) => AgentRoomStub
}>
