export const inspectorPayments = {
  inTheDrawer: 'In the drawer',
  drawerSize: 'Drawer size',
  spilled: 'Spilled',
  revenue: 'Revenue',
  s: (p0: string | number | null) => `${p0}/s`,
  subscriptions: 'Subscriptions',
  burn: 'Burn',
  salaries: 'Salaries',
  provider: 'Provider',
  firstProvider: 'First',
  secondProvider: 'Second',
  aSecondProviderCharges: (extra: string | number) =>
    `A second provider charges ${extra}% more per checkout and keeps serving when the first is down.`,
  oneProviderTakesEveryCheckout:
    'One provider takes every checkout. When it is down, checkouts fail until it is back.',
}
