export const incidents = {
  ignored: 'Ignored',
  s: (p0: string | number | null) => `${p0} s`,
  rollBack: 'Roll back',
  researchToRollBack: (p0: string | number | null) => `Research ${p0} to roll back`,
  file: 'File',
  actionItem: (p0: string | number | null) => `Action item: ${p0}`,
  fileAndLeaveTheActionItem:
    'File and leave the action item open: this incident stays twice as likely',
  showDetails: 'Show details',
  users: 'Users',
  revenue: 'Revenue',
}
