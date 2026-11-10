import { isOne } from '../plural.ts'
import type { Messages } from '../messages.ts'

export const incidents: Messages['incidents'] = {
  ignored: 'Ignorado',
  sev: (level: number) => `SEV${level}`,
  alertsFiring: (n: number) => `${n} ${isOne('es', n) ? 'alerta activa' : 'alertas activas'}`,
  ruleIgnored: (n: number) => `${n} ${isOne('es', n) ? 'regla ignorada' : 'reglas ignoradas'}`,
  andMore: (n: number) => `y ${n} más`,
  alerts: 'Alertas',
  openAlerts: 'Abre la fila de Alertas del Cuadro de mando',
  acknowledge: 'Confirmar',
  showOnBoard: 'Mostrar en el tablero',
  rollBack: 'Revertir',
  researchToRollBack: (p0: string | number | null) => `Investigación ${p0} para revertir`,
  followedLeftAlone: (incident: string | number) =>
    `Vino después de ${incident}, que quedó sin atender.`,
  renew: 'Renovar',
  fenceLeader: 'Aislar al líder',
  cancelMigration: 'Cancelar migración',
  pinAndRedeploy: 'Fijar y volver a desplegar',
  restore: 'Restaurar',
  restartNodes: 'Reiniciar nodos',
  moveLogin: 'Mover el inicio de sesión',
  failOver: 'Hacer failover',
  restart: 'Reiniciar',
  restartHub: 'Reiniciar Hub',
  throttleConnects: 'Limitar conexiones',
}
