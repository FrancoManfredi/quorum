import type { Messages } from '../messages.ts'

export const inspectorPki: Messages['inspectorPki'] = {
  certificate: 'Certificado',
  aCertificateLastsCalendarDaysAnd: (p0: string | number | null, p1: string | number | null) =>
    `Un certificado dura ${p0} días de calendario, y el sidecar lo renueva a los ${p1}. La renovación es automática mientras este nodo esté en marcha.`,
  theFirstStepWithAManager: 'El primer Paso con un gestor lo emite.',
  expiredEveryBrowserRefusesTheSite:
    'Caducado: todos los navegadores rechazan el sitio hasta que haya uno activo, o hasta que pulses Renovar.',
  daysLeft: (p0: string | number | null) => `Quedan ${p0} días.`,
  sellItOrLeaveItDown:
    'Véndelo o déjalo caído más allá de la fecha de caducidad y el certificado se pierde: todos los nodos que terminan TLS fallan hasta que uno vuelva a funcionar. A partir de la Serie C los certificados duran 45 días, así que la renovación manual se vuelve más difícil.',
  secrets: 'Secretos',
  theKeysLiveHereNotIn:
    'Las claves viven aquí, no en el código. La investigación de Gestión de secretos también las mantiene fuera de una página de phishing.',
  lifetime: 'Vida útil',
  d: (p0: string | number | null) => `${p0} d`,
  expires: 'Caduca',
  notIssuedYet: 'aún no emitido',
  expired: 'caducado',
  inD: (p0: string | number | null) => `en ${p0} d`,
  renewsAt: 'Renueva a los',
  burn: 'Gasto',
  s: (p0: string | number | null) => `${p0}/s`,
}
