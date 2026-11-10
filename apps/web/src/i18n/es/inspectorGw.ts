import type { Messages } from '../messages.ts'

export const inspectorGw: Messages['inspectorGw'] = {
  routes: 'Rutas',
  rateLimit: 'Límite de tasa',
  off: 'Desactivado',
  s: (p0: string | number | null) => `${p0}/s`,
  pastRequestsASecondTheyFail: (p0: string | number | null) =>
    `Por encima de ${p0} peticiones por segundo, fallan como limitadas.`,
  noLimitEveryRequestGoesOn: 'Sin límite: cada petición pasa a los servicios.',
  flatCap: 'Tope fijo',
  tokenBucket: 'Token bucket',
  aBurstOfUpToRequests: (p0: string | number | null) =>
    `Una ráfaga de hasta ${p0} peticiones pasa entera, y la media se mantiene en el límite.`,
  everyStepOverTheLimitIs:
    'Cada Paso por encima del límite se limita al instante. Investiga Limitación de tasa para tener un token bucket.',
  servicesCheck: 'La comprueban los servicios',
  authAtTheEdge: 'Autenticación en el edge',
  everyReadGoesOn: 'Cada lectura pasa',
  requestCoalescing: 'Coalescencia de peticiones',
  identicalReadsInFlightAtOnce:
    'Las lecturas idénticas en vuelo se convierten en una sola llamada. Cuanto más ocupado está el Gateway, más fusiona, así que un pico envía menos.',
  theGatewayValidatesEachToken: (validation: string | number, check: string | number) =>
    `El Gateway valida cada token una vez, por ${validation}, y los servicios se ahorran la comprobación de ${check}.`,
  everyServiceValidatesTheToken: (check: string | number) =>
    `Cada servicio valida el token por su cuenta: ${check} de CPU en cada petición autenticada.`,
}
