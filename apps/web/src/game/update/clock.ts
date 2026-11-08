import { Actions } from '../board-actions.ts'
import { Work } from '../board-actions.ts'
import {
  ALERT_RULES,
  COMPONENTS,
  FEATURES,
  INCIDENTS,
  REGION_INFO,
  MIGRATION_STEPS,
  RESEARCH,
  STEP_SECONDS,
  type ResearchId,
} from '@quorum/simulation/catalog'
import { CALENDAR_HOUR, mailedTo } from './mail.ts'
import {
  EVENT_EVERY,
  churnFact,
  stallFact,
  EASY_MODE_KEY,
  easyModeFact,
  disclosureFact,
  eventFact,
  eventMail,
  factOf,
  postmortemFact,
} from '../mail.ts'
import { recordEra } from '@quorum/simulation/founder'
import { Game } from '@quorum/simulation/state'
import { HISTORY_EVERY, HISTORY_POINTS, sampleNode, type NodeSample } from '../node-metrics.ts'
import {
  Model,
  clockPaused,
  offCompany,
  boardChallenge,
  boardSandbox,
  roomLive,
  type Tone,
} from '../model.ts'
import { clockStep } from '../clock-machine.ts'
import { advanceChange } from '../feedback.ts'
import { SAVE_EVERY, SAMPLE_EVERY, mostSteps, speedsOf } from './constant.ts'
import { StepEvent } from '@quorum/simulation/events'
import {
  WriteFounder,
  AppendLog,
  ComputeBottleneck,
  ComputeWhatIfs,
  FitBoard,
  ToggleFullscreen,
  WriteSandboxStore,
} from '../commands.ts'
import { advanceReveals } from '../reveal.ts'
import { advanceSandbox, GUIDED, passedAll } from '@quorum/simulation/sandbox'
import { alertText, money } from '@quorum/ui/game/format'
import { churnOf } from '@quorum/simulation/churn'
import { closed, withMail, resolvedExcept } from '../inbox.ts'
import { formats } from '../../i18n/format.ts'
import { has, zoned } from '@quorum/simulation/lookups'
import { line, sampleOf } from '../telemetry.ts'
import {
  milestones,
  say,
  saveCommands,
  toasted,
  act,
  nodeName,
  percent,
  storeOf,
  type AnyCommand,
  type MessageCases,
  type UpdateResult,
} from './shared.ts'
import { nameIn } from '../../i18n/refusal.ts'
import { newSamples, record } from '../history.ts'
import { nextAdvice } from '@quorum/simulation/goals'
import { nodeTitle, type Messages } from '../../i18n/messages.ts'
import { runTick } from './session.ts'
import { payGapOf } from '@quorum/simulation/team'
import { regionApdexOf, regionView } from '@quorum/simulation/regions'
import { sessionStep } from '../session-machine.ts'
import { solveFlow } from '@quorum/simulation/solve'
import { step } from '@quorum/simulation/step'
import { studyStall } from '@quorum/simulation/studies'
import { tidy } from '@quorum/ui/board/tidy'
import { type EventMail } from '../copy/index.ts'
import { type Ledger } from '@quorum/simulation/ledger'
import { type LogEntry } from '../playlog.ts'

/** What the player hears about a Step event, if anything. */
export type Note = readonly [string, Tone] | null

/** A Step event's toast, and the Mail behind it. */
export type EventNote = readonly [string, Tone, EventMail] | null

/** What a blocked item waits on, in the words the Mail uses (18 "Teammates"). */
export const BLOCK_TEXT: Readonly<Record<'decision' | 'index' | 'copy' | 'hire', string>> = {
  decision: 'waiting on a decision',
  index: 'waiting on an index',
  copy: 'waiting on a database copy',
  hire: 'waiting on a hire',
}

export const eventText = (event: StepEvent, game: Game): EventNote =>
  StepEvent.$match(event, {
    IncidentStarted: ({ incident }): EventNote =>
      incident.kind === 'bad-deploy'
        ? null
        : incident.kind === 'breach'
          ? [
              'Data breach: an unpatched CVE was exploited. Users are leaving.',
              'danger',
              { topic: 'incident-breach', vars: {} },
            ]
          : incident.kind === 'credential-leak'
            ? [
                'Credential leak: the phishing page took your keys. Users are leaving.',
                'danger',
                { topic: 'incident-phishing', vars: {} },
              ]
            : incident.kind === 'instance' && incident.nodeId
              ? [
                  `${nodeName(game, incident.nodeId)} failed. Select it and click Replace.`,
                  'danger',
                  { topic: 'incident-instance', vars: { node: nodeName(game, incident.nodeId) } },
                ]
              : incident.kind === 'slow-query'
                ? [
                    'A new query has no index. Every read scans the table.',
                    'danger',
                    { topic: 'incident-slow-query', vars: {} },
                  ]
                : incident.kind === 'poison'
                  ? [
                      'A task keeps failing. Workers retry it instead of the queue.',
                      'danger',
                      { topic: 'incident-poison', vars: {} },
                    ]
                  : incident.kind === 'ddos'
                    ? [
                        'A flood of junk traffic hits the edge.',
                        'danger',
                        { topic: 'incident-ddos', vars: {} },
                      ]
                    : incident.kind === 'stampede'
                      ? [
                          'The Cache restarted empty. Every miss goes to the database.',
                          'danger',
                          { topic: 'incident-stampede', vars: {} },
                        ]
                      : incident.kind === 'zone' && incident.zone
                        ? [
                            `Zone ${incident.zone.toUpperCase()} is down.`,
                            'danger',
                            { topic: 'incident-zone', vars: { zone: incident.zone.toUpperCase() } },
                          ]
                        : incident.kind === 'psp-outage'
                          ? [
                              'The Payment Provider is down. Checkouts fail.',
                              'danger',
                              { topic: 'incident-psp', vars: {} },
                            ]
                          : null,
    IncidentResolved: ({ postmortem }): EventNote =>
      postmortem.action
        ? [
            `${INCIDENTS[postmortem.kind].name} is over. Action item: ${RESEARCH[postmortem.action].name}. Until then it is twice as likely.`,
            'primary',
            {
              topic: 'resolved-action',
              vars: {
                incident: INCIDENTS[postmortem.kind].name,
                action: RESEARCH[postmortem.action].name,
              },
            },
          ]
        : [
            `${INCIDENTS[postmortem.kind].name} is over.`,
            'primary',
            { topic: 'resolved', vars: { incident: INCIDENTS[postmortem.kind].name } },
          ],
    DrawerFull: (): EventNote => [
      'The Payments drawer is full. Revenue is spilling.',
      'warn',
      { topic: 'drawer', vars: {} },
    ],
    OutOfMemory: ({ nodeId }): EventNote => [
      `${nodeName(game, nodeId)} ran out of memory and restarted.`,
      'danger',
      { topic: 'oom', vars: { node: nodeName(game, nodeId) } },
    ],
    CreditsExhausted: ({ nodeId }): EventNote => [
      `${nodeName(game, nodeId)} is out of CPU credits: throttled to 20%.`,
      'warn',
      { topic: 'credits', vars: { node: nodeName(game, nodeId) } },
    ],
    AlertFired: ({ rule }): EventNote => [
      `Page: ${alertText(rule, game.alertRules[rule]).toLowerCase()} for ${ALERT_RULES[rule].seconds} s.`,
      'danger',
      {
        topic: 'alert',
        vars: {
          alert: alertText(rule, game.alertRules[rule]),
          seconds: String(ALERT_RULES[rule].seconds),
        },
      },
    ],
    AlertIgnored: ({ rule }): EventNote => [
      `Five false alarms today: the team ignores “${alertText(rule, game.alertRules[rule])}”. Change its threshold.`,
      'warn',
      { topic: 'alert-ignored', vars: { alert: alertText(rule, game.alertRules[rule]) } },
    ],
    Hired: (): EventNote => ['An engineer joined the team.', 'ok', { topic: 'hired', vars: {} }],
    // A disclosure and its exploit are written by `security`, not by the event table.
    CveDisclosed: (): EventNote => null,
    // The owner also proposes the patch, which is a teammate's Mail of its own (18).
    PatchProposed: ({ item }): EventNote => {
      const target = COMPONENTS[item.target as keyof typeof COMPONENTS]?.name ?? 'the Design'
      const due = `${Math.max(1, Math.round(((item.due ?? game.time) - game.time) / 60))} min`
      return [
        `${target}: its owner proposes the patch.`,
        'warn',
        { topic: 'patch-proposed', vars: { item: Work.itemName(item), target, due } },
      ]
    },
    CveExploited: (): EventNote => null,
    Blocked: ({ item, reason }): EventNote => [
      `${Work.itemName(item)} waits on you: ${BLOCK_TEXT[reason]}.`,
      'warn',
      { topic: 'blocked', vars: { item: Work.itemName(item), reason: BLOCK_TEXT[reason] } },
    ],
    EngineerUnhappy: ({ engineerId }): EventNote => {
      const mate = game.engineers.find((engineer) => engineer.id === engineerId)
      const gap = mate ? Math.round(payGapOf(game, mate) * 100) : 0
      return [
        'An engineer is unhappy: a long freeze, too many pages, or a pay gap.',
        'warn',
        { topic: 'unhappy', vars: { pages: String(mate?.pages ?? 0), gap: `${gap}%` } },
      ]
    },
    WorkFinished: ({ item }): EventNote =>
      item.kind === 'task'
        ? [
            `${Work.itemName(item)} is done.`,
            'ok',
            { topic: 'finished', vars: { item: Work.itemName(item) } },
          ]
        : null,
    Deployed: ({ features, bad }): EventNote => {
      const names = features.map((id) => FEATURES[id].name).join(', ')
      return bad
        ? [
            `Deployed ${names} with a bug. App Servers are crashing.`,
            'danger',
            { topic: 'deployed-bad', vars: { features: names } },
          ]
        : [`Deployed ${names}.`, 'primary', { topic: 'deployed', vars: { features: names } }]
    },
    StudyCompleted: ({ research }): EventNote => [
      `${RESEARCH[research].name} is researched.`,
      'ok',
      { topic: 'finished', vars: { item: RESEARCH[research].name } },
    ],
    MigrationShifted: ({ step }): EventNote => [
      `${percent(MIGRATION_STEPS[step - 1] ?? 0)} of App Servers moved to the new Stack.`,
      'primary',
      { topic: 'migration', vars: { share: percent(MIGRATION_STEPS[step - 1] ?? 0) } },
    ],
  })

export const eventLog = (event: StepEvent): Record<string, unknown> =>
  StepEvent.$match(event, {
    IncidentStarted: ({ incident }) => ({ kind: incident.kind, node: incident.nodeId }),
    IncidentResolved: ({ postmortem }) => ({ ...postmortem }),
    DrawerFull: () => ({}),
    OutOfMemory: ({ nodeId }) => ({ node: nodeId }),
    CreditsExhausted: ({ nodeId }) => ({ node: nodeId }),
    AlertFired: ({ rule }) => ({ rule }),
    AlertIgnored: ({ rule }) => ({ rule }),
    Hired: ({ engineerId }) => ({ engineer: engineerId }),
    CveDisclosed: ({ item }) => ({ cve: item.ref, due: item.due }),
    PatchProposed: ({ item, engineerId }) => ({ cve: item.ref, engineer: engineerId }),
    Blocked: ({ item, reason, engineerId }) => ({
      item: item.id,
      reason,
      engineer: engineerId,
    }),
    EngineerUnhappy: ({ engineerId }) => ({ engineer: engineerId }),
    CveExploited: ({ cve, target }) => ({ cve, target }),
    WorkFinished: ({ item }) => ({ kind: item.kind, ref: item.ref, cost: item.cost }),
    Deployed: ({ features, bad }) => ({ features, bad }),
    MigrationShifted: ({ step }) => ({ step }),
    StudyCompleted: ({ research }) => ({ research }),
  })

/** A Step event as a Toast in the player's language, for a Challenge: it has no Inbox to carry the Mail. */
export const eventToast = (t: Messages, event: StepEvent, game: Game): Note => {
  const e = t.toasts.event
  const node = (id: string): string => {
    const found = game.nodes.find((entry) => entry.id === id)
    return found ? nodeTitle(t, game, found) : t.toasts.event.theDesign
  }
  const item = (value: Parameters<typeof Work.itemName>[0]): string =>
    nameIn(t, Work.itemName(value))
  return StepEvent.$match(event, {
    IncidentStarted: ({ incident }): Note => {
      switch (incident.kind) {
        case 'breach':
          return [e.breach, 'danger']
        case 'credential-leak':
          return [e.phishing, 'danger']
        case 'instance':
          return incident.nodeId ? [e.instance(node(incident.nodeId)), 'danger'] : null
        case 'slow-query':
          return [e.slowQuery, 'danger']
        case 'poison':
          return [e.poison, 'danger']
        case 'ddos':
          return [e.ddos, 'danger']
        case 'stampede':
          return [e.stampede, 'danger']
        case 'zone':
          return incident.zone ? [e.zone(incident.zone.toUpperCase()), 'danger'] : null
        case 'psp-outage':
          return [e.psp, 'danger']
        default:
          return null
      }
    },
    IncidentResolved: ({ postmortem }): Note => {
      const incident = t.catalog.incidents[postmortem.kind].name
      return postmortem.action
        ? [e.resolvedAction(incident, t.catalog.research[postmortem.action].name), 'primary']
        : [e.resolved(incident), 'primary']
    },
    DrawerFull: (): Note => [e.drawer, 'warn'],
    OutOfMemory: ({ nodeId }): Note => [e.oom(node(nodeId)), 'danger'],
    CreditsExhausted: ({ nodeId }): Note => [e.credits(node(nodeId)), 'warn'],
    AlertFired: ({ rule }): Note => [
      e.alert(
        formats(t).alertText(rule, game.alertRules[rule]).toLowerCase(),
        t.units.s(ALERT_RULES[rule].seconds),
      ),
      'danger',
    ],
    AlertIgnored: ({ rule }): Note => [
      e.alertIgnored(formats(t).alertText(rule, game.alertRules[rule])),
      'warn',
    ],
    Hired: (): Note => [e.hired, 'ok'],
    CveDisclosed: (): Note => null,
    PatchProposed: ({ item: patch }): Note => {
      const target = COMPONENTS[patch.target as keyof typeof COMPONENTS]
      return [
        e.patchProposed(
          target ? t.catalog.components[patch.target as keyof typeof COMPONENTS].name : e.theDesign,
        ),
        'warn',
      ]
    },
    CveExploited: (): Note => null,
    Blocked: ({ item: blocked, reason }): Note => [
      e.blocked(
        item(blocked),
        reason === 'decision'
          ? e.waitDecision
          : reason === 'index'
            ? e.waitIndex
            : reason === 'copy'
              ? e.waitCopy
              : e.waitHire,
      ),
      'warn',
    ],
    EngineerUnhappy: (): Note => [e.unhappy, 'warn'],
    WorkFinished: ({ item: done }): Note =>
      done.kind === 'task' ? [e.finished(item(done)), 'ok'] : null,
    Deployed: ({ features, bad }): Note => {
      const names = features.map((id) => t.catalog.features[id].name).join(', ')
      return bad ? [e.deployedBad(names), 'danger'] : [e.deployed(names), 'primary']
    },
    StudyCompleted: ({ research }): Note => [e.researched(t.catalog.research[research].name), 'ok'],
    MigrationShifted: ({ step }): Note => [
      e.migrationShifted(percent(MIGRATION_STEPS[step - 1] ?? 0)),
      'primary',
    ],
  })
}

export const tick = (model: Model, elapsedMs: number): UpdateResult => {
  const challenge = boardChallenge(model.board)
  if (challenge?._tag === 'Running') return runTick(model, challenge, elapsedMs)
  // A tick owes the real time that passed, at the speed the player chose, in 100 ms Steps.
  const owed =
    model.board.clock.carry + (elapsedMs * model.board.clock.speed) / (1_000 * STEP_SECONDS)
  const most = mostSteps(model.board.clock.speed)
  // A live Room steps the Company on the server; this tab only paints it.
  const steps = roomLive(model) ? 0 : Math.min(Math.floor(owed), most)
  // Over the cap, the clock drops the excess instead of saving it for the next tick.
  const carry = roomLive(model) || steps === most ? 0 : owed - steps
  let game = model.board.game
  const events: Array<StepEvent> = []
  for (let index = 0; index < steps; index += 1) {
    const result = step(game, STEP_SECONDS)
    game = result.game
    events.push(...result.events)
  }
  // A guided Sandbox checks its objective, and may script an incident or change demand.
  const open = boardSandbox(model.board)
  const guided = open?.id ? GUIDED[open.id] : null
  let run = open
  let advanced = false
  if (run && guided && !passedAll(guided, run.progress)) {
    const advance = advanceSandbox(
      guided,
      run.progress,
      game,
      solveFlow(game),
      steps * STEP_SECONDS,
    )
    if (advance.game.incident && advance.game.incident !== game.incident)
      events.push(StepEvent.IncidentStarted({ incident: advance.game.incident }))
    game = advance.game
    run = { ...run, progress: advance.progress }
    advanced = advance.advanced
  }
  // The Bottleneck search re-solves three times, so it runs once per sim second (04).
  const second = Math.floor(game.time)
  const search = model.board.bottleneckAt < 0 || second !== model.board.bottleneckAt
  const flow = solveFlow(game)
  // The search runs on the compute worker; until it answers, the last Bottleneck stands.
  const bottleneck = model.board.bottleneck
  const ledger: Ledger = { ...flow, bottleneck }
  // An incident drops the clock to 1×, so the player has time to respond.
  const incident = events.some((event) => event._tag === 'IncidentStarted')
  // With auto-pause on, a SEV1 or SEV2 stops the clock until the player resumes it.
  const severe = events.find(
    (event) => event._tag === 'IncidentStarted' && event.incident.severity <= 2,
  )
  const autoPaused =
    model.prefs.easyMode && model.prefs.autoPause && severe !== undefined && !clockPaused(model)
  let next: Model = {
    ...model,
    board: {
      ...model.board,
      game,
      session: run
        ? sessionStep(model.board.session, { _tag: 'SandboxUpdated', run })
        : model.board.session,
      bottleneck,
      bottleneckAt: search ? second : model.board.bottleneckAt,
      clock: {
        ...model.board.clock,
        mode: autoPaused
          ? clockStep(model.board.clock.mode, { _tag: 'SevereIncident' })
          : model.board.clock.mode,
        speed: incident ? Math.min(model.board.clock.speed, 1) : model.board.clock.speed,
        carry,
      },
    },
  }
  next = advanceReveals(next, ledger)
  const commands: Array<AnyCommand> = []
  if (search) commands.push(ComputeBottleneck({ game, at: second }))
  // What-if rows (12 "Load diagnosis") run ghost Simulations, so they refresh every few sim
  // seconds, and only for a busy selected Node once `profiling` shows them.
  const watched = model.board.selected
  const rows = model.board.whatIfs
  if (
    search &&
    watched &&
    has(game, 'profiling') &&
    (flow.nodes[watched]?.utilization ?? 0) >= WHAT_IF_LOAD &&
    (rows?.nodeId !== watched || second - rows.at >= WHAT_IF_EVERY || second < rows.at)
  )
    commands.push(ComputeWhatIfs({ game, nodeId: watched, at: second }))
  const logs: Array<LogEntry> = []

  if (run && guided && advanced) {
    const done = passedAll(guided, run.progress)
    logs.push(
      line(game.time, 'ObjectivePassed', { sandbox: guided.id, objective: run.progress.objective }),
    )
    if (done) {
      const passed = next.passed.includes(guided.id) ? next.passed : [...next.passed, guided.id]
      next = { ...next, passed, panel: 'passed', board: { ...next.board, flow: { _tag: 'Idle' } } }
      commands.push(WriteSandboxStore({ store: storeOf(next) }))
    } else {
      const [raised, clear] = toasted(
        next,
        say(next).toasts.objectiveDone(run.progress.objective, guided.objectives.length),
        'ok',
      )
      next = raised
      commands.push(clear)
    }
  }

  if (autoPaused && severe?._tag === 'IncidentStarted') {
    const [raised, clear] = toasted(
      next,
      say(next).toasts.pausedBySevere(
        severe.incident.severity,
        say(next).catalog.incidents[severe.incident.kind].name,
      ),
      'danger',
    )
    next = raised
    commands.push(clear)
  }

  for (const event of events) {
    logs.push(line(game.time, event._tag, eventLog(event)))
    // The Simulation files a CVE as a ticket; Security writes the advisory, and a thread closes with its ticket.
    if (!boardChallenge(next.board) && event._tag === 'CveDisclosed') {
      next = mailedTo(next, disclosureFact(event.item, game), game.time)
      continue
    }
    if (event._tag === 'CveExploited')
      next = {
        ...next,
        board: {
          ...next.board,
          inbox: closed(
            next.board.inbox,
            `security:${event.cve}`,
            game.time,
            'Exploited. The ticket expired, and so did the Users who trusted you.',
            { id: 'exploited', vars: {} },
          ),
        },
      }
    if (event._tag === 'WorkFinished' && event.item.kind === 'patch')
      next = {
        ...next,
        board: {
          ...next.board,
          inbox: closed(
            next.board.inbox,
            `security:${event.item.ref}`,
            game.time,
            'Patched before the deadline. Nothing happened, which is the point.',
            { id: 'patched', vars: {} },
          ),
        },
      }
    const text = eventText(event, game)
    // An incident's postmortem is a teammate's to file, so the alarm clearing and the follow-up
    // are two Mail: the pager's record, and a person asking for the write-up (18 "Teammates").
    if (!boardChallenge(next.board) && event._tag === 'IncidentResolved')
      next = mailedTo(next, postmortemFact(event.postmortem, game), game.time)
    if (!text) continue
    // What happened in the Design is Mail (GDD 18); a Challenge has no Inbox, so it keeps the toast.
    if (boardChallenge(next.board)) {
      const toast = eventToast(say(next), event, game)
      if (toast) {
        const [raised, clear] = toasted(next, toast[0], toast[1])
        next = raised
        commands.push(clear)
      }
    } else {
      next = mailedTo(next, eventFact(event, text[2], game), game.time, true)
    }
  }

  // Money out (09 "Runway and running out of Cash"): the bridge arrives, or the Nodes shut down.
  if (!offCompany(next)) {
    const was = model.board.game.bridge._tag
    const bridge = next.board.game.bridge
    if (was === 'None' && bridge._tag === 'Offered') {
      logs.push(
        line(game.time, 'BridgeOffered', { grant: bridge.grant, dilution: bridge.dilution }),
      )
      const [raised, clear] = toasted(
        next,
        say(next).toasts.bridgeOffer(money(bridge.grant), Math.round(bridge.dilution * 100)),
        'danger',
      )
      next = raised
      commands.push(clear)
    }
    const shut = next.board.game.nodes.filter(
      (node) =>
        node.service._tag === 'Shut' &&
        (model.board.game.nodes.find((before) => before.id === node.id)?.service._tag ??
          'InService') !== 'Shut',
    )
    if (shut.length > 0) {
      logs.push(line(game.time, 'NodesShutDown', { nodes: shut.map((node) => node.id) }))
      const [raised, clear] = toasted(
        next,
        shut.length === 1 ? say(next).toasts.nodeShut : say(next).toasts.nodesShut(shut.length),
        'danger',
      )
      next = raised
      commands.push(clear)
    }
  }

  const change = advanceChange(next.board, ledger, next.toastSeq + 1)
  next = { ...next, board: { ...next.board, change } }
  if (change._tag === 'Settled' || change._tag === 'Lasting')
    logs.push(line(game.time, 'ChangeSettled', change.delta))

  // The Dashboard's long history: every Sample the Steps added.
  next = {
    ...next,
    board: {
      ...next.board,
      dashboard: {
        ...next.board.dashboard,
        history: record(
          next.board.dashboard.history,
          newSamples(game.history, model.board.game.time, game.time),
          Math.floor(game.time),
        ),
      },
    },
  }

  // Capture actual observations, not reconstructed samples across skipped time.
  if (Math.floor(game.time / HISTORY_EVERY) > Math.floor(model.board.game.time / HISTORY_EVERY)) {
    const history: Record<string, ReadonlyArray<NodeSample>> = {}
    for (const node of game.nodes) {
      const past = next.board.nodeHistory[node.id] ?? []
      history[node.id] = [...past, sampleNode(game, node, ledger)]
        .filter((sample) => sample.time > game.time - HISTORY_EVERY * HISTORY_POINTS)
        .slice(-HISTORY_POINTS)
    }
    const chosen = next.board.nodeSample
    next = {
      ...next,
      board: {
        ...next.board,
        nodeHistory: history,
        nodeSample:
          chosen && history[chosen.nodeId]?.some((sample) => sample.time === chosen.time)
            ? chosen
            : null,
      },
    }
  }

  // The log records what the player was told and what limited the Design.
  const advice = nextAdvice(game, ledger)
  const told = `${advice.key}|${advice.text}`
  if (told !== next.board.lastGoal) {
    logs.push(line(game.time, 'GoalChanged', { goal: advice.text }))
    next = { ...next, board: { ...next.board, lastGoal: told } }
    if (!offCompany(next))
      next = mailedTo(
        {
          ...next,
          board: { ...next.board, inbox: resolvedExcept(next.board.inbox, advice.key, game.time) },
        },
        factOf(advice, game),
        game.time,
      )
  }
  // Once a calendar hour, a region whose users fell over the hour gets a Customers Mail; its
  // thread resolves when the region grows again (GDD 12 "The Churn breakdown").
  if (
    !offCompany(next) &&
    Math.floor(game.time / CALENDAR_HOUR) > Math.floor(model.board.game.time / CALENDAR_HOUR)
  ) {
    for (const region of churnOf(game, ledger)) {
      const key = `customers:churn:${region.region}`
      const falling = region.perHour < 0 && regionApdexOf(game, region.region) < region.target
      const open = next.board.inbox.mail.some(
        (mail) => mail.key === key && mail.phase._tag !== 'Resolved' && !mail.trashed,
      )
      if (falling) next = mailedTo(next, churnFact(game, region), game.time)
      else if (open)
        next = {
          ...next,
          board: {
            ...next.board,
            inbox: closed(
              next.board.inbox,
              key,
              game.time,
              `${REGION_INFO[region.region].name} is growing again.`,
              { id: 'growing', vars: { name: REGION_INFO[region.region].name } },
            ),
          },
        }
    }
  }
  // A player who struggles hears about Easy mode once a Company, at an hour's turn.
  if (
    !offCompany(next) &&
    !next.prefs.easyMode &&
    Math.floor(game.time / CALENDAR_HOUR) > Math.floor(model.board.game.time / CALENDAR_HOUR) &&
    struggling(game) &&
    !next.board.inbox.mail.some((mail) => mail.key === EASY_MODE_KEY)
  )
    next = mailedTo(next, easyModeFact(game), game.time)
  // A stalled running Study holds the queue: a teammate writes once, and the Thread waits in Needs
  // action until the Study moves or leaves the queue (10 "Studies").
  if (!offCompany(next)) {
    const running = game.studies[0]
    const stall = running ? studyStall(game, ledger, running.id) : null
    const key = running && stall ? `research:stalled:${running.id}` : null
    if (running && stall) next = mailedTo(next, stallFact(game, running.id, stall), game.time)
    for (const mail of next.board.inbox.mail) {
      if (!mail.key.startsWith('research:stalled:') || mail.key === key) continue
      if (mail.phase._tag === 'Resolved' || mail.trashed) continue
      const name = RESEARCH[mail.key.slice('research:stalled:'.length) as ResearchId]?.name
      // The player usually caused this, by cancelling or by shipping the fix: no new unread Mail.
      const inbox = closed(
        next.board.inbox,
        mail.key,
        game.time,
        `${name} no longer holds the queue.`,
        { id: 'unstalled', vars: { name: name ?? '' } },
      )
      next = {
        ...next,
        board: { ...next.board, inbox: withMail(inbox, mail.id, { read: mail.read }) },
      }
    }
  }
  // The world writes too: teammates, CVEs, customers, and spam.
  const bucket = Math.floor(game.time / EVENT_EVERY)
  if (!offCompany(next) && game.stage >= 1 && bucket > next.board.inbox.bucket) {
    const event = eventMail(game, bucket, next.board.inbox.mail)
    next = { ...next, board: { ...next.board, inbox: { ...next.board.inbox, bucket } } }
    if (event) next = mailedTo(next, event, game.time)
  }
  const marker = bottleneck ? `${bottleneck}:${ledger.nodes[bottleneck]?.limit ?? 'none'}` : ''
  if (marker !== next.board.lastBottleneck) {
    logs.push(line(game.time, 'BottleneckChanged', { bottleneck: marker || null }))
    next = { ...next, board: { ...next.board, lastBottleneck: marker } }
  }
  if (game.time - next.board.clock.sampledAt >= SAMPLE_EVERY) {
    logs.push(line(game.time, 'Sample', sampleOf(next, ledger)))
    next = {
      ...next,
      board: { ...next.board, clock: { ...next.board.clock, sampledAt: game.time } },
    }
  }
  if (game.time - model.board.clock.savedAt >= SAVE_EVERY) {
    next = { ...next, board: { ...next.board, clock: { ...next.board.clock, savedAt: game.time } } }
    if (!offCompany(next)) commands.push(...saveCommands(next))
    else if (boardSandbox(next.board)?.id === null) {
      next = { ...next, freeBoard: game }
      commands.push(WriteSandboxStore({ store: storeOf(next) }))
    }
  }
  // The Founder records each Era reached in a Company.
  if (!offCompany(next) && !next.founder.erasReached.includes(game.stage)) {
    next = { ...next, founder: recordEra(next.founder, game.stage) }
    commands.push(WriteFounder({ founder: next.founder }))
  }
  if (logs.length > 0) commands.push(AppendLog({ entries: logs }))
  return milestones(model, { model: next, commands }, events, ledger)
}

/** Sim seconds of history the error share is averaged over before Easy mode is offered. */
const STRUGGLE_WINDOW = 300

/** Sim seconds between what-if runs, and the utilization a Node needs before they run. */
const WHAT_IF_EVERY = 5
const WHAT_IF_LOAD = 0.7

/**
 * Too many failures or incidents: a tenth of requests failed over the last five sim minutes, or
 * three of the recorded postmortems are SEV1 or SEV2.
 */
const struggling = (game: Game): boolean => {
  const recent = game.history.slice(-STRUGGLE_WINDOW)
  const errors =
    recent.length === STRUGGLE_WINDOW &&
    recent.reduce((sum, sample) => sum + sample.errors, 0) / recent.length >= 0.1
  const severe = game.postmortems.filter((postmortem) => postmortem.severity <= 2).length >= 3
  return errors || severe
}

type ClockTag =
  | 'Ticked'
  | 'SpeedCycled'
  | 'SpeedChosen'
  | 'PauseToggled'
  | 'FullscreenToggled'
  | 'BoardFitted'
  | 'BoardTidied'

export const clockHandlers = (model: Model): MessageCases<UpdateResult, ClockTag> => ({
  Ticked: ({ elapsedMs }) => tick(model, elapsedMs),

  SpeedCycled: () => {
    if (!model.prefs.easyMode) return { model }
    const speeds = speedsOf(model.board.game)
    const index = speeds.indexOf(model.board.clock.speed)
    return {
      model: {
        ...model,
        board: {
          ...model.board,
          clock: { ...model.board.clock, speed: speeds[(index + 1) % speeds.length] ?? 1 },
        },
      },
    }
  },

  SpeedChosen: ({ speed }) => ({
    model: { ...model, board: { ...model.board, clock: { ...model.board.clock, speed } } },
  }),

  PauseToggled: () => {
    if (!model.prefs.easyMode) return { model }
    const next = {
      ...model,
      board: {
        ...model.board,
        clock: {
          ...model.board.clock,
          mode: clockStep(model.board.clock.mode, { _tag: 'PauseToggled' }),
        },
      },
    }
    return { model: next }
  },

  FullscreenToggled: () => ({ model, commands: [ToggleFullscreen({})] }),

  BoardFitted: () => ({ model, commands: [FitBoard({})] }),

  BoardTidied: () => {
    const view = regionView(model.board.game, model.board.region)
    const nodes = view.nodes.map((node) => ({
      ...node,
      group: zoned(node) ? node.zone : 'all',
    }))
    const spots = tidy(nodes, view.links, ['all', 'a', 'b', 'c'])
    const moved = [...spots].map(([id, spot]) => Actions.move(model.board.game, id, spot.x, spot.y))
    const tidied = act(model, 'Tidied the board by zone', moved, {
      undoable: true,
    })
    return { ...tidied, commands: [...(tidied.commands ?? []), FitBoard({})] }
  },
})
