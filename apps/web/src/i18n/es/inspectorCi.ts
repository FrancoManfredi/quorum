import type { Messages } from '../messages.ts'

export const inspectorCi: Messages['inspectorCi'] = {
  deployStrategy: 'Estrategia de despliegue',
  deploysInMinABadDeploy: (p0: string | number | null, p1: string | number | null) =>
    `Despliega en ${p0} min; un mal despliegue rompe hasta el ${p1} de las peticiones.`,
  deploysADayAtThisBuild: (p0: string | number | null) =>
    `${p0} despliegues al día con esta build y estrategia.`,
  deploys: 'Despliegues',
  deployTime: 'Tiempo de despliegue',
  min: (p0: string | number | null) => `${p0} min`,
  blastRadius: 'Radio de impacto',
  upTo: (p0: string | number | null) => `hasta ${p0}`,
  burn: 'Gasto',
  s: (p0: string | number | null) => `${p0}/s`,
  perDay: (count: string | number) => `${count}/día`,
}
