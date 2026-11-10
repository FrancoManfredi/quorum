import type { Messages } from '../messages.ts'

export const inspectorLb: Messages['inspectorLb'] = {
  variant: 'Variante',
  forwardsTCPTenTimesTheThroughput:
    'Reenvía TCP: diez veces el rendimiento, 0.2 ms y más barato. No lee HTTP, así que no puede reintentar una llamada.',
  readsHTTPRetriesAndChecksHealth:
    'Lee HTTP: reintenta y comprueba la salud. Menos rendimiento y un salto más largo.',
  policy: 'Política',
  sessions: 'Sesiones',
  balanced: 'Equilibrado',
  sticky: 'Persistente',
  everyRequestGoesWhereTheAlgorithm: 'Cada petición va donde la manda el algoritmo.',
  off: 'Desactivado',
  on: 'Activado',
  healthChecks: 'Comprobaciones de salud',
  s: (p0: string | number | null) => `${p0} s`,
  shallow: 'Superficial',
  deep: 'Profunda',
  stickyHolds:
    'Un usuario se queda en el destino al que llegó primero. La copia más antigua retiene a más usuarios, un destino que muere se lleva sus sesiones, y las cachés en proceso y los clientes en tiempo real se mantienen calientes.',
  slowStart: 'Arranque lento',
  slowStartOn:
    'Una copia nueva recibe tráfico poco a poco, así una copia Java fría nunca responde a su velocidad en frío.',
  slowStartOff: 'Una copia nueva recibe su parte completa de golpe.',
}
