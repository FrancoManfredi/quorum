import type { Messages } from '../messages.ts'

export const cost: Messages['cost'] = {
  s: (p0) => `${p0}/s`,
  burn: 'Dépenses',
  revenue: 'Revenus',
  margin: 'Marge',
  compute: 'Calcul',
  data: 'Données',
  storage: 'Stockage',
  egress: 'Trafic sortant',
  requests: 'Requêtes',
  observability: 'Observabilité',
  salaries: 'Salaires',
  notes: {
    compute: 'Serveurs d’application, workers, edge et nœuds de plateforme',
    data: 'Base de données, cache, pooler, répliques et le reste',
    storage: 'Go stockés, facturés par Go et par seconde',
    egress: 'Octets sortants de l’origine et du CDN',
    thirdParty: 'Frais de paiement, analyses, jetons et messages',
    requests: 'Requêtes de la passerelle, du serverless et des fonctions edge, facturées à l’usage',
    observability: 'Échantillonnage et rétention d’Analytics',
    salaries: 'Ingénieurs, par langage et par politique',
  },
  thirdParties: 'Tiers',
  cloudBill: 'La facture cloud',
  billExplainer:
    'La facture suit l’indice de coût de l’ère, donc elle monte avec l’entreprise. Une passerelle facture chaque requête, de même que les requêtes et les Go-secondes d’une fonction serverless et les requêtes d’une fonction edge : la ligne Requêtes correspond à ce qu’elles servent.',
}
