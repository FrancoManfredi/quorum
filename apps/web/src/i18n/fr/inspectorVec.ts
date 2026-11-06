import type { Messages } from '../messages.ts'
import { isOne } from '../plural.ts'

export const inspectorVec: Messages['inspectorVec'] = {
  exactComparesTheQueryToEvery: (p0, p1, p2) =>
    `Exact compare la requête à chaque vecteur : chaque consultation trouve son plus proche voisin, à ${p0} par seconde et par palier de taille. HNSW parcourt un graphe : ${p1}× les consultations, deux fois la mémoire en dépense, et ${p2} de rappel, donc une consultation sur vingt cite le mauvais document.`,
  recallBurnS: (p0, p1) => `Rappel ${p0} · Dépense ${p1}/s`,
  retrieval: 'Récupération',
  linkANodeThatAnswersPrompts: (p0) =>
    `Reliez-lui un nœud qui répond aux requêtes et chaque requête paie une consultation de plus proche voisin pour les documents qu’elle cite. Ces réponses rapportent ${p0} % de plus, et une pile Python ne garde son bonus d’écosystème ML qu’avec un index sur le chemin.`,
  nothingAnswersPromptsThroughItYet: 'Rien n’y répond encore. Reliez-lui un serveur applicatif.',
  lookups: 'Consultations',
  s: (p0) => `${p0}/s`,
  load: 'Charge',
  ofS: (p0, p1) => `${p0} sur ${p1}/s`,
  idle: 'inactif',
  recall: 'Rappel',
  latency: 'Latence',
  burn: 'Dépenses',
  index: 'Index',
  nodesRetrieveFromIt: (count) =>
    `${count} ${isOne('fr', count) ? 'nœud récupère' : 'nœuds récupèrent'} depuis lui.`,
}
