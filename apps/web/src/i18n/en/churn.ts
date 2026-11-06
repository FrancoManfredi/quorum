import type { ChurnCause } from '@quorum/simulation/churn'
import type { RegionId } from '@quorum/simulation/catalog/regions'

export const churn = {
  show: (p0: string | number | null) => `Show ${p0}`,
  node: 'Node',
  users: (p0: string | number | null) => `${p0} users`,
  n1Day: (p0: string | number | null) => `1 day: ${p0}`,
  whyUsersLeave: 'Why users leave',
  /** What takes Apdex in a row: far, slow, or a failure. */
  causes: {
    far: 'far',
    slow: 'slow',
    failed: 'failed',
    stranded: 'stranded',
    dropped: 'dropped',
    refused: 'refused',
    down: 'down',
    stale: 'stale',
    oom: 'oom',
    timeout: 'timeout',
    crash: 'crash',
    blocked: 'blocked',
    upstream: 'upstream',
    throttled: 'throttled',
    duplicate: 'duplicate',
  } satisfies Record<ChurnCause, string>,
  /** The fix a failure row advises. */
  fixes: {
    stranded: 'Link a Node that accepts this kind.',
    dropped: 'Add capacity: a Node is past its backlog.',
    refused: 'Add a Connection Pooler: a connection limit is full.',
    down: 'Replace or restore the Node that is down.',
    stale: 'Read this kind from the primary, or turn on read-your-writes.',
    oom: 'Give the Node more RAM, or fewer workers.',
    timeout: 'Add capacity behind the Link, or raise its timeout.',
    crash: 'Restart the Node, and give it more RAM or copies.',
    blocked: 'Lower the WAF paranoia level.',
    upstream: 'Wait out the provider, or add a fallback.',
    throttled: 'Raise the rate limit.',
    duplicate: 'Research Idempotency keys.',
    slow: 'Add capacity on the busiest Node.',
    failed: 'Research Structured logs to see why.',
  } satisfies Record<Exclude<ChurnCause, 'far'>, string>,
  openRegion: {
    na: 'Open North America',
    eu: 'Open Europe',
    apac: 'Open Asia-Pacific',
    sa: 'Open South America',
  } satisfies Record<RegionId, string>,
  buildIn: {
    na: 'Build in North America',
    eu: 'Build in Europe',
    apac: 'Build in Asia-Pacific',
    sa: 'Build in South America',
  } satisfies Record<RegionId, string>,
  mirrorInto: {
    na: 'Mirror into North America',
    eu: 'Mirror into Europe',
    apac: 'Mirror into Asia-Pacific',
    sa: 'Mirror into South America',
  } satisfies Record<RegionId, string>,
  research: (name: string | number) => `Research ${name}`,
  slowestHop: (node: string | number, time: string | number) => `Slowest hop: ${node} adds ${time}`,
  deviceAdds: (device: string | number, time: string | number) =>
    `${device} adds ${time} over the internet`,
  apdex: (now: string | number, target: string | number) => `Apdex ${now} / ${target}`,
}
