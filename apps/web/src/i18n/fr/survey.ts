import type { Messages } from '../messages.ts'

export const survey: Messages['survey'] = {
  title: 'Comment ça s’est passé ?',
  note: 'Vos réponses et cette cession vont au développeur.',
  issues: 'Des problèmes pendant votre partie ?',
  likes: 'Quelque chose vous a plu ?',
  send: 'Envoyer',
  sending: 'Envoi…',
  skip: 'Passer',
  sent: 'Merci. Vos réponses ont été envoyées.',
  failed: (p0) => `Non envoyé. ${p0}`,
  offline: 'Impossible de joindre le serveur. Réessayez.',
  empty: 'Répondez au moins à une question.',
  noExit: 'Aucune cession à signaler.',
}
