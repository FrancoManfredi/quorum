import type { Messages } from '../messages.ts'

export const sandbox: Messages['sandbox'] = {
  demand: 'Demanda',
  s: (p0: string | number | null) => `${p0}/s`,
  burn: 'Gasto',
  errors: 'Errores',
  latency: 'Latencia',
  sandboxMenu: 'Menú del sandbox',
  objectiveOf: (p0: string | number | null, p1: string | number | null) =>
    `Objetivo ${p0} de ${p1}`,
  controls: 'Controles',
  users: 'Usuarios',
  lessDemand: 'Menos demanda',
  moreDemand: 'Más demanda',
  mix: 'Mezcla',
  incident: 'Incidente',
  none: 'Ninguno',
  loadACrowdedDesignToTest:
    'Carga un Diseño saturado para probar la colocación de tarjetas y los carriles de enlaces',
  stressBoard: 'Tablero de estrés',
  loadA61NodeDesignTo: 'Carga un Diseño de 61 Nodos para probar el rendimiento',
  bigBoard: 'Tablero grande',
  reset: 'Restablecer',
  copyTheCompanyDesignOntoThis: 'Copia el Diseño de la Empresa en este tablero',
  copyCompany: 'Copiar Empresa',
  freeSandbox: 'Sandbox gratuito',
  passed: 'Superado',
}
