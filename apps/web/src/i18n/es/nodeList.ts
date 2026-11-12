import type { SIZES } from '@quorum/simulation/catalog'
import type { Messages } from '../messages.ts'

export const nodeList: Messages['nodeList'] = {
  nodes: 'Nodos',
  s: (p0: string | number | null) => `${p0}/s`,
  sizes: {
    nano: 'nano',
    micro: 'micro',
    small: 'pequeño',
    medium: 'mediano',
    large: 'grande',
    xlarge: 'muy grande',
    '2xlarge': '2xlarge',
    '4xlarge': '4xlarge',
    metal: 'metal',
    custom: 'personalizado',
  } satisfies Record<(typeof SIZES)[number]['name'] | 'custom', string>,
  sizeStep: (step: string | number) => `tamaño ${step}`,
  noLoad: 'sin carga',
  down: 'caído',
}
