import type { Messages } from '../messages.ts'

export const levers: Messages['levers'] = {
  label: 'Palanca de producto',
  step: (step, max) => (step <= 0 ? 'Sin palanca' : `Paso ${step} de ${max}`),
  share: (share) => `${share} del tráfico`,
  count: (step, max) => `${step}/${max}`,
  titleLow: (name) => `El Insight de ${name} es muy bajo`,
  titleRaise: (name) => `Haz que ${name} gane más rápido`,
  titleFaster: (name) => `${name} gana más rápido ahora`,
  low: (name, earn, draw) =>
    `${name} gana ${earn} de Insight/s; este estudio necesita ${draw}/s. Más tráfico de ${name} gana Insight más rápido.`,
  raise: (name) => `${name} paga este estudio. Con más tráfico, el Insight gana más rápido.`,
  faster: (name, share) =>
    `${name} ocupa el ${share} del tráfico, así que su Insight gana más rápido.`,
  reaches: (share, percent) =>
    `Llega al ${share} del tráfico, con un ${percent}% menos de crecimiento.`,
  cost: (percent) => `Cuesta un ${percent}% de crecimiento de usuarios.`,
  buildStep: (step, dh) => `Construir paso ${step} · ${dh} DH`,
  setStep: (step) => `Ajustar paso ${step}`,
  removeStep: 'Quitar',
  remove: (dh) => `Quitar · ${dh} DH devueltos`,
  takeOff: 'Quitar el paso',
  set: 'Ajustar la palanca',
  item: (kind) => `Palanca de ${kind}`,
  queued: (kind) => `Paso de la palanca de ${kind} en cola`,
  removed: (kind) => `Paso de la palanca de ${kind} quitado`,
  pinned: 'Un desafío fija su mix.',
  noLever: (kind) => `${kind} no tiene palanca de producto.`,
  opens: (kind, step, era) => `El paso ${step} de la palanca de ${kind} se abre en ${era}.`,
  onBacklog: (kind) => `Ya hay un paso de la palanca de ${kind} en la cola.`,
  capped: (venture, kind) => `${venture} limita la palanca de ${kind} al primer paso.`,
  lastStep: (kind) => `La palanca de ${kind} está en su último paso.`,
  notServed: (kind) => `La empresa no sirve ${kind}.`,
  alreadyOff: (kind) => `La palanca de ${kind} ya está apagada.`,
  onBacklogRemove: (kind) => `Hay un paso de la palanca de ${kind} en la cola.`,
}
