import type { Messages } from '../messages.ts'

export const sandbox: Messages['sandbox'] = {
  demand: 'Demande',
  s: (p0) => `${p0}/s`,
  burn: 'Dépenses',
  errors: 'Erreurs',
  latency: 'Latence',
  sandboxMenu: 'Menu bac à sable',
  objectiveOf: (p0, p1) => `Objectif ${p0} de ${p1}`,
  controls: 'Commandes',
  users: 'Utilisateurs',
  lessDemand: 'Réduire la demande',
  moreDemand: 'Augmenter la demande',
  mix: 'Répartition',
  levers: 'Leviers',
  incident: 'Incident',
  none: 'Aucun',
  loadACrowdedDesignToTest:
    'Chargez un design encombré pour tester le placement des cartes et relier les voies',
  stressBoard: 'Plan de charge extrême',
  loadA61NodeDesignTo: 'Charger une architecture à 61 nœuds pour tester les performances',
  bigBoard: 'Grand plan',
  reset: 'Réinitialiser',
  copyTheCompanyDesignOntoThis: "Copiez le design de l'entreprise sur ce tableau",
  copyCompany: 'Copier l’entreprise',
  freeSandbox: 'Bac à sable libre',
  passed: 'Réussi',
}
