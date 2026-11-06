export const inspectorFn = {
  executions: 'Executions',
  coldStart: 'Cold start',
  bill: 'Bill',
  inbound: 'Inbound',
  s: (p0: string | number | null) => `${p0}/s`,
  uses: 'Uses',
  standingBurn: 'Standing Burn',
  oneExecutionHoldsTheRequest: (cap: string | number) =>
    `One execution holds the request for as long as it runs, up to ${cap} at a time. Past the cap the provider throttles: the requests are dropped, not queued.`,
  inFlight: (used: string | number, total: string | number) => `${used} of ${total} in flight`,
  aNewEnvironmentBoots: (coldStart: string | number) =>
    `A new execution environment boots before the code runs: ${coldStart} for this Stack. A function that idles loses its environments, so a trickle of traffic pays it more often than a steady one.`,
  changeTheRuntime: 'Change the runtime in the Stack to trade the cold start for throughput.',
  noBoxToPayFor: (
    perThousandRequests: string | number,
    perGbSecond: string | number,
    gigabytes: string | number,
  ) =>
    `There is no box to pay for: nothing stands while it idles. Each use bills ${perThousandRequests} per 1,000 requests plus ${perGbSecond} per GB-second, at ${gigabytes} GB an execution, on the Requests line of the bill.`,
  thisUse: (cost: string | number) => `This use: ${cost}/s`,
}
