import type { Messages } from '../messages.ts'
import { isOne } from '../plural.ts'

export const inspectorFf: Messages['inspectorFf'] = {
  rollout: 'Despliegue progresivo',
  shipAFeatureFirstAFlag:
    'Lanza primero una funcionalidad: un flag aún no tiene nada que desplegar.',
  off: 'Desactivada',
  offNoUserHasTheFeature:
    'Desactivada: ningún usuario tiene la funcionalidad, así que un mal despliegue de ella no rompe a nadie',
  aBadDeployOfItReaches: (p0: string | number | null) =>
    `Un mal despliegue de ella llega como mucho al ${p0}% de los usuarios`,
  flagsAreAShield: 'Los flags son un escudo',
  aFeatureAt5OfUsers:
    'Una funcionalidad al 5% de los usuarios puede romper como mucho el 5% del tráfico que habría tenido, sea cual sea la estrategia de despliegue. Desactívala y el siguiente mal despliegue de ella no rompe a nadie: ese es el clic que necesita un incidente.',
  notBuiltTheHoldoutGroupThat:
    'No implementado: el grupo de control que mide el efecto de una funcionalidad, y la carga que una funcionalidad oscura ya no añade.',
  service: 'Servicio',
  inTheBatch: 'En el lote',
  behindAFlag: 'Tras un flag',
  badDeploy: 'Mal despliegue',
  burn: 'Gasto',
  s: (p0: string | number | null) => `${p0}/s`,
  aBadDeployFails: (
    failing: string | number,
    service: string,
    features: number,
    ceiling: string | number,
  ) =>
    `Un mal despliegue hace fallar el ${failing}% de las peticiones por cada funcionalidad que desplegó su lote, y un flag lo reduce a la proporción de usuarios que alcanzó. El último despliegue de ${service} incluyó ${features} ${isOne('es', features) ? 'funcionalidad' : 'funcionalidades'}, así que su techo es del ${ceiling}%. Solo se rompe el tráfico de ese servicio.`,
  upToOfItsTraffic: (share: string | number) => `hasta el ${share}% de su tráfico`,
}
