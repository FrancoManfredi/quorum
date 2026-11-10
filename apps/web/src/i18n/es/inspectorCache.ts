import type { Messages } from '../messages.ts'

export const inspectorCache: Messages['inspectorCache'] = {
  cache: 'Caché',
  aWriteReturnsFromTheCache:
    'Una escritura vuelve de la caché y llega a la base de datos más tarde. Una caída pierde lo que no se ha volcado.',
  everyWriteGoesToTheCache:
    'Cada escritura va a la caché y a la base de datos a la vez: más fresca, y una escritura más larga.',
  readsComeFromTheCacheWrites:
    'Las lecturas salen de la caché y las escrituras la rodean. Un fallo puede guardar una fila vieja hasta el TTL.',
  everyMiss: 'Cada fallo',
  coalesce: 'Coalescer',
  expireOnTheTTL: 'Caducar con el TTL',
  refreshEarly: 'Refrescar antes',
  missOnExpiry: 'Fallo al caducar',
  staleWhileRevalidating: 'Obsoleto mientras se revalida',
  coldStart: 'Arranque en frío',
  warmStart: 'Arranque en caliente',
}
