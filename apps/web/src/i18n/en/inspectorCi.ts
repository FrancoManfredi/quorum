export const inspectorCi = {
  deployStrategy: 'Deploy strategy',
  deploysInMinABadDeploy: (p0: string | number | null, p1: string | number | null) =>
    `Deploys in ${p0} min; a bad deploy breaks up to ${p1} of requests.`,
  deploysADayAtThisBuild: (p0: string | number | null) =>
    `${p0} deploys a day at this build and strategy.`,
  deploys: 'Deploys',
  deployTime: 'Deploy time',
  min: (p0: string | number | null) => `${p0} min`,
  blastRadius: 'Blast radius',
  upTo: (p0: string | number | null) => `up to ${p0}`,
  burn: 'Burn',
  s: (p0: string | number | null) => `${p0}/s`,
  perDay: (count: string | number) => `${count}/day`,
}
