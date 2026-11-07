export const survey = {
  title: 'How did it go?',
  note: 'Your answers and this Exit go to the developer.',
  issues: 'Any problems while you played?',
  likes: 'Anything you liked?',
  send: 'Send',
  sending: 'Sending…',
  skip: 'Skip',
  sent: 'Thanks. Your answers were sent.',
  failed: (p0: string | number | null) => `Not sent. ${p0}`,
  offline: 'Could not reach the server. Try again.',
  empty: 'Write an answer to at least one question.',
  noExit: 'There is no Exit to report on.',
}
