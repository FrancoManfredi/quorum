import type { Messages } from '../messages.ts'

export const presence: Messages['presence'] = {
  opening: (what: string) => `Abriendo ${what}`,
  inspector: 'inspector',
  research: 'investigación',
  team: 'panel de equipo',
  dashboard: 'cuadro de mando',
  playbooks: 'playbooks',
  help: 'ayuda',
  dev: 'panel de pruebas',
  inbox: 'bandeja de entrada',
  cost: 'coste',
  churn: 'desglose de bajas',
  mirror: 'espejo',
  settings: 'ajustes',
  menu: 'menú',
  room: 'panel de sala',
  exit: 'pantalla de Exit',
  challenge: 'desafío',
}
