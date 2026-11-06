import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorVec: Messages['inspectorVec'] = {
  exactComparesTheQueryToEvery: (p0, p1, p2) =>
    `Exact compare la requête à chaque vecteur : chaque consultation trouve son plus proche voisin, à ${arg(p0)} par seconde et par palier de taille. HNSW parcourt un graphe : ${arg(p1)}× les consultations, deux fois la mémoire en dépense, et ${arg(p2)} de rappel, donc une consultation sur vingt cite le mauvais document.`,
  recallBurnS: (p0, p1) => `Rappel ${arg(p0)} · Dépense ${arg(p1)}/s`,
  retrieval: 'Récupération',
  linkANodeThatAnswersPrompts: (p0) =>
    `Reliez-lui un nœud qui répond aux requêtes et chaque requête paie une consultation de plus proche voisin pour les documents qu’elle cite. Ces réponses rapportent ${arg(p0)} % de plus, et une pile Python ne garde son bonus d’écosystème ML qu’avec un index sur le chemin.`,
  nothingAnswersPromptsThroughItYet: 'Rien n’y répond encore. Reliez-lui un serveur applicatif.',
  lookups: 'Consultations',
  s: (p0) => `${arg(p0)}/s`,
  load: 'Charge',
  ofS: (p0, p1) => `${arg(p0)} sur ${arg(p1)}/s`,
  idle: 'inactif',
  recall: 'Rappel',
  latency: 'Latence',
  burn: 'Dépenses',
}
