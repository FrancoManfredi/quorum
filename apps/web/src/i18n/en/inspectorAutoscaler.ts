export const inspectorAutoscaler = {
  scaling: 'Scaling',
  load: 'Load',
  requests: 'Requests',
  queueDepth: 'Queue depth',
  min: (p0: string | number | null) => `min ${p0}`,
  noMax: 'no max',
  max: (p0: string | number | null) => `max ${p0}`,
  onLoad: 'On load',
  aheadOfThePeak: 'Ahead of the peak',
  twoCalendarHoursBeforeTheDaily:
    'Two calendar hours before the daily peak it adds the copies the peak will need, so they are warm when it arrives.',
  itReactsToTheLoadIt:
    'It reacts to the load it sees. Research Scheduled scaling to provision for the peak first.',
}
