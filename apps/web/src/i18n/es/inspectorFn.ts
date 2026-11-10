import type { Messages } from '../messages.ts'

export const inspectorFn: Messages['inspectorFn'] = {
  executions: 'Ejecuciones',
  coldStart: 'Arranque en frío',
  bill: 'Factura',
  inbound: 'Entrada',
  s: (p0: string | number | null) => `${p0}/s`,
  uses: 'Uso',
  standingBurn: 'Gasto base',
  oneExecutionHoldsTheRequest: (cap: string | number) =>
    `Una ejecución retiene la petición mientras dura, hasta ${cap} a la vez. Pasado el límite, el proveedor limita: las peticiones se descartan, no se encolan.`,
  inFlight: (used: string | number, total: string | number) => `${used} de ${total} en vuelo`,
  aNewEnvironmentBoots: (coldStart: string | number) =>
    `Un entorno de ejecución nuevo arranca antes de que corra el código: ${coldStart} para este stack. Una función que queda inactiva pierde sus entornos, así que un goteo de tráfico lo paga más a menudo que un tráfico constante.`,
  changeTheRuntime: 'Cambia el runtime del stack para cambiar arranque en frío por rendimiento.',
  noBoxToPayFor: (
    perThousandRequests: string | number,
    perGbSecond: string | number,
    gigabytes: string | number,
  ) =>
    `No hay máquina que pagar: nada queda encendido mientras está inactiva. Cada uso factura ${perThousandRequests} por cada 1000 peticiones más ${perGbSecond} por GB-segundo, con ${gigabytes} GB por ejecución, en la línea de Peticiones de la factura.`,
  thisUse: (cost: string | number) => `Este uso: ${cost}/s`,
}
