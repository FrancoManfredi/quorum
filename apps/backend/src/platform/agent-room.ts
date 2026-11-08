import { DurableObject } from 'cloudflare:workers'
import type { NodeSample } from '@quorum/agent/node-metrics'
import type { AgentMail, AgentHead, Ack, Status, Upload } from '@quorum/agent/snapshot'
import { roomIdOf } from '@quorum/agent/room-id'
import {
  applyUpload,
  EMPTY_META,
  emptyStore,
  snapshotOfStore,
  statusOfStore,
  type AgentMeta,
  type AgentStore,
} from '@quorum/agent/store'
import { readTool } from '@quorum/agent/view'
import type { Sample } from '@quorum/simulation/state'
import type { AgentRoomStub } from '../contexts/agent/room.ts'

/* ==========================================================================
   One exposed Company. It stores the snapshot the browser uploads and runs the
   shared read tools on it. The MCP protocol stays in the Worker; this object
   only knows the store and the view.
   ========================================================================== */

const TTL_MS = 24 * 60 * 60 * 1000
const SAMPLE_CHUNK = 200

export type AgentRoomEnv = Readonly<Record<string, never>>

const nodeKey = (id: string): string => `node:${id}`
const chunkKey = (index: number): string => `samples:${index}`

export class AgentRoom extends DurableObject<AgentRoomEnv> implements AgentRoomStub {
  private store: AgentStore | null = null

  /** Loads the store from storage, or returns the one this instance already has. */
  private async load(): Promise<AgentStore> {
    if (this.store !== null) return this.store

    const [meta, head, inbox, chunks, nodes] = await Promise.all([
      this.ctx.storage.get<AgentMeta>('meta'),
      this.ctx.storage.get<AgentHead | null>('head'),
      this.ctx.storage.get<ReadonlyArray<AgentMail>>('inbox'),
      this.ctx.storage.list<ReadonlyArray<Sample>>({ prefix: 'samples:' }),
      this.ctx.storage.list<ReadonlyArray<NodeSample>>({ prefix: 'node:' }),
    ])

    const samples = [...chunks.entries()]
      .sort(
        ([left], [right]) =>
          Number(left.slice('samples:'.length)) - Number(right.slice('samples:'.length)),
      )
      .flatMap(([, items]) => items)

    const store: AgentStore = {
      meta: meta ?? EMPTY_META,
      head: head ?? null,
      samples,
      nodes: Object.fromEntries(
        [...nodes.entries()].map(([key, items]) => [key.slice('node:'.length), items]),
      ),
      inbox: inbox ?? [],
    }
    this.store = store
    return store
  }

  private async save(next: AgentStore, previous: AgentStore): Promise<void> {
    await this.ctx.storage.put('meta', next.meta)
    await this.ctx.storage.put('head', next.head)
    await this.ctx.storage.put('inbox', next.inbox)

    const count = Math.ceil(next.samples.length / SAMPLE_CHUNK)
    for (let index = 0; index < count; index += 1)
      await this.ctx.storage.put(
        chunkKey(index),
        next.samples.slice(index * SAMPLE_CHUNK, (index + 1) * SAMPLE_CHUNK),
      )
    const previousCount = Math.ceil(previous.samples.length / SAMPLE_CHUNK)
    for (let index = count; index < previousCount; index += 1)
      await this.ctx.storage.delete(chunkKey(index))

    for (const [id, samples] of Object.entries(next.nodes))
      await this.ctx.storage.put(nodeKey(id), samples)
    for (const id of Object.keys(previous.nodes)) {
      if (next.nodes[id] === undefined) await this.ctx.storage.delete(nodeKey(id))
    }
  }

  private async verify(key: string): Promise<void> {
    if ((await roomIdOf(key)) !== this.ctx.id.name)
      throw new Error('The write key does not match this Room.')
  }

  async write(upload: Upload, key: string): Promise<Ack> {
    await this.verify(key)
    const previous = await this.load()
    const { store, ack } = applyUpload(previous, upload, Date.now())
    await this.save(store, previous)
    this.store = store
    await this.ctx.storage.setAlarm(Date.now() + TTL_MS)
    return ack
  }

  async clear(key: string): Promise<void> {
    await this.verify(key)
    await this.ctx.storage.deleteAlarm()
    await this.ctx.storage.deleteAll()
    this.store = emptyStore()
  }

  async read(name: string, input: Record<string, unknown>): Promise<string> {
    const snapshot = snapshotOfStore(await this.load())
    if (snapshot === null)
      throw new Error(
        'This Room has no snapshot yet. Ask the player to open the Company and turn on Agent access.',
      )
    return readTool(snapshot, name, input)
  }

  async status(): Promise<Status | null> {
    return statusOfStore(await this.load())
  }

  async alarm(): Promise<void> {
    await this.ctx.storage.deleteAll()
    this.store = emptyStore()
  }
}

/** The instance type the namespace stub carries. */
export type AgentRoomInstance = AgentRoom
