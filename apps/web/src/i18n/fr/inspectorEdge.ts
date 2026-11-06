import type { Messages } from '../messages.ts'

export const inspectorEdge: Messages['inspectorEdge'] = {
  ceilings: 'Plafonds',
  edgeCache: 'Cache de périphérie',
  inbound: 'Trafic entrant',
  s: (p0) => `${p0}/s`,
  latency: 'Latence',
  cPUCeiling: 'Plafond CPU',
  stack: 'Pile',
  uses: 'Usages',
  standingBurn: 'Dépenses fixes',
  aHandlerRunsIn: (memory, cpu) =>
    `Un gestionnaire s’exécute dans ${memory} Mo d’isolat et peut dépenser ${cpu} de CPU par requête. Une requête au-delà du plafond échoue par dépassement de délai, donc les types gourmands en CPU relèvent d’un serveur applicatif.`,
  thisStackCompilesToTheEdge:
    'Cette pile se compile pour la périphérie : JavaScript, TypeScript, Rust ou Go vers WebAssembly.',
  cannotRunAtTheEdge: (stack) =>
    `${stack} ne peut pas s’exécuter en périphérie. Migrez la pile vers Node.js, Rust ou Go.`,
  aUserInItsRegion: (hop, hit) =>
    `Un utilisateur de sa région l’atteint en ${hop}, donc le saut s’arrête à la périphérie de la région et non à un aller-retour vers l’origine. Placez-en une dans chaque région dont les utilisateurs en ont besoin. Le cache clé-valeur d’une Fonction Edge active permet aussi à un CDN de répondre à ${hit} % des lectures en périphérie.`,
  cannotRunHere: (stack) => `${stack} ne peut pas s’exécuter ici`,
}
