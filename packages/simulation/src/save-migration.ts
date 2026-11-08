import { MIGRATION_STEPS } from './catalog.ts'
import { lifeOf } from './life.ts'

const record = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

const list = (value: unknown): ReadonlyArray<unknown> => (Array.isArray(value) ? value : [])

const number = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const text = (value: unknown): string | null => (typeof value === 'string' ? value : null)

const nodeOf = (raw: unknown): unknown => {
  const node = record(raw)
  if (!node) return raw
  const next = { ...node }
  if (next.life === undefined)
    next.life = lifeOf(
      number(next.down, 0),
      number(next.warm, 1),
      (text(next.downCause) ?? 'restart') as never,
    )
  delete next.down
  delete next.downCause
  delete next.warm

  if (next.service === undefined) {
    next.service =
      next.shut === true
        ? { _tag: 'Shut' }
        : next.draining === true
          ? { _tag: 'Draining', since: number(next.drainAt, 0) }
          : { _tag: 'InService' }
  }
  delete next.shut
  delete next.draining
  delete next.drainAt

  if (next.scaler === undefined) {
    const pending = number(next.pending, 0)
    next.scaler =
      pending > 0
        ? { _tag: 'Scaling', pending, readyIn: number(next.readyIn, 0) }
        : { _tag: 'Steady' }
  }
  delete next.pending
  delete next.readyIn

  return next
}

const linkOf = (raw: unknown, time: number): unknown => {
  const link = record(raw)
  if (!link) return raw
  const next = { ...link }
  if (next.fuse === undefined) {
    const open = number(next.open, 0)
    next.fuse = open > 0 ? { _tag: 'Open', until: time + open } : { _tag: 'Closed' }
  }
  delete next.open
  return next
}

const migrationOf = (raw: unknown): unknown => {
  const migration = record(raw)
  if (!migration || migration._tag !== undefined) return raw
  const step = number(migration.step, 0)
  const ready = migration.ready === true
  const base = {
    runtime: migration.runtime,
    framework: migration.framework,
    fromRuntime: migration.fromRuntime,
    fromFramework: migration.fromFramework,
    total: migration.total,
    bugs: migration.bugs ?? false,
  }
  delete migration.step
  delete migration.ready
  delete migration.bugs
  if (step >= MIGRATION_STEPS.length) return { ...migration, ...base, _tag: 'Finishing' }
  return {
    ...migration,
    ...base,
    _tag: ready ? 'Ready' : 'Building',
    step,
  }
}

const hireOf = (raw: unknown): unknown => {
  const hire = record(raw)
  if (!hire || hire.phase !== undefined) return raw
  const next: Record<string, unknown> = {
    ...hire,
    phase: { _tag: 'Pending', readyAt: number(hire.readyAt, 0) },
  }
  delete next.readyAt
  return next
}

const studyOf = (raw: unknown, index: number): unknown => {
  const study = record(raw)
  if (!study || study.phase !== undefined) return raw
  const progress = number(study.progress, 0)
  const next: Record<string, unknown> = {
    ...study,
    phase: index === 0 ? { _tag: 'Running', progress } : { _tag: 'Queued', progress },
  }
  delete next.progress
  return next
}

const moveOf = (raw: unknown): unknown => {
  const move = record(raw)
  if (!move || move.phase !== undefined) return raw
  const until = number(move.until, 0)
  const next: Record<string, unknown> = {
    ...move,
    phase: until > 0 ? { _tag: 'Copying', until } : { _tag: 'Building' },
  }
  delete next.until
  return next
}

const workOf = (raw: unknown): unknown => {
  const item = record(raw)
  if (!item || item.block !== undefined) return raw
  const blocked = record(item.blockedBy)
  const next: Record<string, unknown> = {
    ...item,
    block: blocked
      ? blocked.cleared === true
        ? {
            _tag: 'Approved',
            reason: blocked.kind,
            owner: blocked.owner,
            at: blocked.at,
          }
        : {
            _tag: 'Blocked',
            reason: blocked.kind,
            owner: blocked.owner,
            at: blocked.at,
            remindAt: blocked.remindAt,
          }
      : { _tag: 'Free' },
  }
  delete next.blockedBy
  return next
}

const serviceOf = (raw: unknown): unknown => {
  const service = record(raw)
  if (!service) return raw
  const next = { ...service }
  if (Array.isArray(next.backlog)) next.backlog = next.backlog.map(workOf)
  if (Array.isArray(next.hires)) next.hires = next.hires.map(hireOf)
  if (next.reshard !== undefined && next.reshard !== null) next.reshard = moveOf(next.reshard)
  if (next.engineChange !== undefined && next.engineChange !== null)
    next.engineChange = moveOf(next.engineChange)
  if (next.migration !== undefined && next.migration !== null)
    next.migration = migrationOf(next.migration)
  delete next.rollouts
  return next
}

const incidentOf = (raw: unknown): unknown => {
  const incident = record(raw)
  if (!incident || incident.phase !== undefined) return raw
  const signalAt = typeof incident.signalAt === 'number' ? incident.signalAt : null
  const ackAt = typeof incident.ackAt === 'number' ? incident.ackAt : null
  const next: Record<string, unknown> = {
    ...incident,
    phase:
      signalAt !== null && ackAt !== null
        ? { _tag: 'Acknowledged', signalAt, ackAt }
        : signalAt !== null
          ? { _tag: 'Announced', signalAt }
          : ackAt !== null
            ? { _tag: 'Responded', ackAt }
            : { _tag: 'Quiet' },
  }
  delete next.signalAt
  delete next.ackAt
  return next
}

const mirrorOf = (raw: unknown): unknown => {
  const mirror = record(raw)
  if (!mirror || mirror.sync !== undefined) return raw
  const readyAt = typeof mirror.readyAt === 'number' ? mirror.readyAt : null
  const driftAt = typeof mirror.driftAt === 'number' ? mirror.driftAt : null
  const seen = mirror.seen ?? null
  const next: Record<string, unknown> = {
    ...mirror,
    sync:
      readyAt !== null
        ? { _tag: 'Applying', readyAt }
        : driftAt !== null
          ? { _tag: 'Drifted', since: driftAt, seen }
          : { _tag: 'InSync', seen },
  }
  delete next.seen
  delete next.readyAt
  delete next.driftAt
  return next
}

const strings = (value: unknown): ReadonlyArray<string> =>
  list(value).filter((entry): entry is string => typeof entry === 'string')

/**
 * Old saves kept the built Features as a list of live ones, a list waiting for a deploy, and their
 * rollout, adoption and lift in three records; the live save keeps one phase for each.
 */
const featuresOf = (save: Record<string, unknown>): Record<string, unknown> | null => {
  if (save.features !== undefined) return null
  const shipped = strings(save.shipped)
  const awaiting = strings(save.awaiting)
  const adoption = record(save.adoption) ?? {}
  const lifts = record(save.lifts) ?? {}
  const rollouts: Record<string, unknown> = {}
  for (const raw of list(save.services))
    Object.assign(rollouts, record(record(raw)?.rollouts) ?? {})
  const features: Record<string, unknown> = {}
  for (const id of awaiting) features[id] = { _tag: 'Awaiting' }
  for (const id of shipped)
    features[id] = {
      _tag: 'Live',
      // A Feature a save did not flag was live for every user, and fully adopted.
      rollout: number(rollouts[id], 1),
      adoption: number(adoption[id], 1),
      lift: record(lifts[id]) ?? null,
    }
  return features
}

/**
 * Upgrades the raw JSON of a save before the live Game schema decodes it.
 * Unknown fields stay as they are, so a newer build's save is not truncated.
 */
export const migrateSave = (raw: Record<string, unknown>): Record<string, unknown> => {
  const save = { ...raw }
  const time = number(save.time, 0)
  // The Features read the Services' old rollouts, so they go before the Services lose them.
  const features = featuresOf(save)
  if (features !== null) save.features = features
  delete save.shipped
  delete save.awaiting
  delete save.adoption
  delete save.lifts
  if (Array.isArray(save.nodes)) save.nodes = save.nodes.map(nodeOf)
  if (Array.isArray(save.links)) save.links = save.links.map((link) => linkOf(link, time))
  if (Array.isArray(save.hires)) save.hires = save.hires.map(hireOf)
  if (Array.isArray(save.studies)) save.studies = save.studies.map(studyOf)
  if (Array.isArray(save.backlog)) save.backlog = save.backlog.map(workOf)
  if (Array.isArray(save.services)) save.services = save.services.map(serviceOf)
  if (save.migration !== undefined && save.migration !== null)
    save.migration = migrationOf(save.migration)
  if (save.incident !== undefined && save.incident !== null)
    save.incident = incidentOf(save.incident)
  if (Array.isArray(save.mirrors)) save.mirrors = save.mirrors.map(mirrorOf)
  if (save.reshard !== undefined && save.reshard !== null) save.reshard = moveOf(save.reshard)
  if (save.engineChange !== undefined && save.engineChange !== null)
    save.engineChange = moveOf(save.engineChange)

  if (save.round === undefined)
    save.round = save.declined === true ? { _tag: 'Declined' } : { _tag: 'Waiting' }
  delete save.declined
  return save
}
