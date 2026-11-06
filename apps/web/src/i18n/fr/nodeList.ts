import type { Messages } from '../messages.ts'

export const nodeList: Messages['nodeList'] = {
  nodes: 'Nœuds',
  s: (p0) => `${p0}/s`,
  sizes: {
    nano: 'nano',
    micro: 'micro',
    small: 'petite',
    medium: 'moyenne',
    large: 'grande',
    xlarge: 'très grande',
    '2xlarge': '2xlarge',
    '4xlarge': '4xlarge',
    metal: 'metal',
    custom: 'personnalisée',
  },
  sizeStep: (step) => `taille ${step}`,
  noLoad: 'aucune charge',
  down: 'en panne',
}
