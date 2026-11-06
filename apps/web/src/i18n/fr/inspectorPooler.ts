import type { Messages } from '../messages.ts'

export const inspectorPooler: Messages['inspectorPooler'] = {
  poolingMode: 'Mode de pool',
  session: 'Session',
  transaction: 'Transaction',
  statement: 'Instruction',
  oneServerConnectionPerStatementA:
    'Une connexion serveur par instruction : une transaction sur plusieurs instructions échoue.',
  oneServerConnectionPerClientBarely:
    'Une connexion serveur par client : à peine moins qu’aucun pool.',
  oneServerConnectionPerActiveTransaction:
    'Une connexion serveur par transaction active. L’état de session casse.',
}
