import type { Messages } from '../messages.ts'

export const survey: Messages['survey'] = {
  title: '¿Qué tal fue?',
  note: 'Tus respuestas y este Exit se envían al desarrollador.',
  issues: '¿Algún problema mientras jugabas?',
  likes: '¿Algo que te gustara?',
  send: 'Enviar',
  sending: 'Enviando…',
  skip: 'Omitir',
  sent: 'Gracias. Tus respuestas se han enviado.',
  failed: (p0: string | number | null) => `No se envió. ${p0}`,
  offline: 'No se pudo contactar con el servidor. Inténtalo de nuevo.',
  empty: 'Escribe una respuesta en al menos una pregunta.',
  noExit: 'No hay ningún Exit que reportar.',
}
