import type { Messages } from '../messages.ts'

export const cost: Messages['cost'] = {
  s: (p0: string | number | null) => `${p0}/s`,
  burn: 'Gasto',
  revenue: 'Ingresos',
  margin: 'Margen',
  compute: 'Cómputo',
  data: 'Datos',
  storage: 'Almacenamiento',
  egress: 'Egress',
  requests: 'Peticiones',
  observability: 'Observabilidad',
  salaries: 'Salarios',
  notes: {
    compute: 'Servidores de aplicaciones, Workers, edge y Nodos de plataforma',
    data: 'Base de datos, caché, pooler, réplicas y el resto',
    storage: 'GB almacenados, con un precio por GB y por segundo',
    egress: 'Bytes que salen del origen y del CDN',
    thirdParty: 'Comisiones de pago, escaneos, tokens y mensajes',
    requests:
      'Peticiones del API Gateway, de la Función serverless y de la Función edge, con precio por uso',
    observability: 'Muestreo y retención de Analítica',
    salaries: 'Ingenieros, por lenguaje y política',
  },
  thirdParties: 'Terceros',
  cloudBill: 'La factura de la nube',
  billExplainer:
    'La factura sigue el índice de coste de la Era, así que sube con la Empresa. Un API Gateway cobra cada petición; también se cobran las peticiones y los GB-segundos de una Función serverless y las peticiones de una Función edge: la línea de Peticiones es lo que sirven.',
}
