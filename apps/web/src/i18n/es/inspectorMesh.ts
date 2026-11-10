import type { Messages } from '../messages.ts'

export const inspectorMesh: Messages['inspectorMesh'] = {
  sidecars: 'Sidecars',
  linkAppServersOrWorkersInto:
    'Enlaza servidores de aplicaciones o workers a él. Todavía no hay nada bajo el service mesh.',
  mutualTLSSitsOnEveryMember:
    'Mutual TLS está en cada llamada entre miembros. Es una propiedad, no una cifra.',
  perHop: 'Por salto',
  memberCPU: 'CPU por miembro',
  insight: 'Conocimiento',
  onItsLinks: (p0: string | number | null) => `+${p0} en sus enlaces`,
  platform: 'Plataforma',
  engineers: (p0: string | number | null) => `${p0} ingenieros`,
  burn: 'Gasto',
  s: (p0: string | number | null) => `${p0}/s`,
  eachSidecarRetries: (insight: string | number, hop: string | number, overhead: string | number) =>
    `Cada sidecar reintenta y corta los enlaces que salen de su nodo, los vigila para conseguir conocimiento (+${insight}%), añade ${hop} a cada salto y se queda con el ${overhead}% de la CPU de la máquina. El gasto de cada miembro paga su sidecar, y cada malla consume horas de desarrollo de Plataforma.`,
}
