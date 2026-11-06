export const inspectorMesh = {
  sidecars: 'Sidecars',
  linkAppServersOrWorkersInto:
    'Link App Servers or Workers into it. Nothing is under the mesh yet.',
  mutualTLSSitsOnEveryMember:
    'Mutual TLS sits on every member-to-member call. It is a property, not a figure.',
  perHop: 'Per hop',
  memberCPU: 'Member CPU',
  insight: 'Insight',
  onItsLinks: (p0: string | number | null) => `+${p0} on its Links`,
  platform: 'Platform',
  engineers: (p0: string | number | null) => `${p0} engineers`,
  burn: 'Burn',
  s: (p0: string | number | null) => `${p0}/s`,
  eachSidecarRetries: (insight: string | number, hop: string | number, overhead: string | number) =>
    `Each sidecar retries and breaks the Links out of its Node, watches them for Insight (+${insight}%), adds ${hop} to each hop, and takes ${overhead}% of the box's CPU. Every member's Burn pays for its sidecar, and each mesh takes Platform Dev Hours.`,
}
