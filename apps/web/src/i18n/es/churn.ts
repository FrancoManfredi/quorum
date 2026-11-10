import type { ChurnCause } from '@quorum/simulation/churn'
import type { RegionId } from '@quorum/simulation/catalog/regions'
import type { Messages } from '../messages.ts'

export const churn: Messages['churn'] = {
  show: (p0: string | number | null) => `Ver ${p0}`,
  node: 'Nodo',
  users: (p0: string | number | null) => `${p0} usuarios`,
  n1Day: (p0: string | number | null) => `1 día: ${p0}`,
  whyUsersLeave: 'Por qué se van los usuarios',
  /** Qué quita Apdex seguido: lejos, lento o un fallo. */
  causes: {
    far: 'lejos',
    slow: 'lento',
    failed: 'fallido',
    stranded: 'varada',
    dropped: 'descartado',
    refused: 'rechazado',
    down: 'caído',
    stale: 'obsoleto',
    oom: 'sin memoria',
    timeout: 'timeout',
    crash: 'caída',
    blocked: 'bloqueado',
    upstream: 'proveedor',
    throttled: 'limitado',
    duplicate: 'duplicado',
  } satisfies Record<ChurnCause, string>,
  fixes: {
    stranded: 'Enlaza un Nodo que acepte este tipo.',
    dropped: 'Añade capacidad: un Nodo ha desbordado su cola.',
    refused: 'Añade un Pooler de conexiones: un límite de conexiones está lleno.',
    down: 'Sustituye o restaura el Nodo caído.',
    stale: 'Lee este tipo desde el primario, o activa la lectura de tus escrituras.',
    oom: 'Dale más RAM al Nodo, o menos workers.',
    timeout: 'Añade capacidad detrás del Enlace, o sube su timeout.',
    crash: 'Reinicia el Nodo y dale más RAM o más copias.',
    blocked: 'Baja el nivel de paranoia del WAF.',
    upstream: 'Espera a que el proveedor se recupere, o añade una alternativa.',
    throttled: 'Sube el límite de peticiones.',
    duplicate: 'Investiga Claves de idempotencia.',
    slow: 'Añade capacidad en el Nodo más cargado.',
    failed: 'Investiga Logs estructurados para ver por qué.',
  } satisfies Record<Exclude<ChurnCause, 'far'>, string>,
  openRegion: {
    na: 'Abrir Norteamérica',
    eu: 'Abrir Europa',
    apac: 'Abrir Asia-Pacífico',
    sa: 'Abrir Sudamérica',
  } satisfies Record<RegionId, string>,
  buildIn: {
    na: 'Construir en Norteamérica',
    eu: 'Construir en Europa',
    apac: 'Construir en Asia-Pacífico',
    sa: 'Construir en Sudamérica',
  } satisfies Record<RegionId, string>,
  mirrorInto: {
    na: 'Hacer espejo en Norteamérica',
    eu: 'Hacer espejo en Europa',
    apac: 'Hacer espejo en Asia-Pacífico',
    sa: 'Hacer espejo en Sudamérica',
  } satisfies Record<RegionId, string>,
  research: (name: string | number) => `Investigar ${name}`,
  slowestHop: (node: string | number, time: string | number) =>
    `Salto más lento: ${node} añade ${time}`,
  deviceAdds: (device: string | number, time: string | number) =>
    `${device} añade ${time} por internet`,
  apdex: (now: string | number, target: string | number) => `Apdex ${now} / ${target}`,
}
