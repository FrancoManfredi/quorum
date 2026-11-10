import type { Messages } from '../messages.ts'

export const inspectorCdn: Messages['inspectorCdn'] = {
  deploysAndKeys: 'Despliegues y claves',
  keepUntilTheTTL: 'Mantener hasta el TTL',
  purgeOnDeploy: 'Purgar al desplegar',
  aDeployEmptiesTheCacheThe:
    'Un despliegue vacía la caché: el origen recibe los fallos mientras se rellena.',
  afterADeployTheEdgeServes:
    'Tras un despliegue el edge sirve algunas páginas viejas hasta que pasa el TTL.',
  theKeyHoldsThePathThe:
    'La clave incluye la ruta, la cadena de consulta y las cookies: no se comparte nada entre usuarios.',
  aSmallerKeyLifts: (lift: string | number) =>
    `Una clave más pequeña sube la tasa de aciertos un ${lift}%, y una página con sesión iniciada cacheada bajo ella puede servirse a otro usuario: una fuga de datos.`,
}
