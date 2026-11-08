import { Actions } from '../board-actions.ts'
import { Work } from '../board-actions.ts'
import {
  DIGEST_ID,
  InboxMessage,
  InboxOutMessage,
  folderList,
  mailed,
  updateInbox,
} from '../inbox.ts'
import {
  FEATURES,
  LANGUAGES,
  RESEARCH,
  RUNTIME_IDS,
  RUNTIMES,
  type ResearchId,
} from '@quorum/simulation/catalog'
import { FocusInspector } from '../commands.ts'
import { Message } from '../message.ts'
import { Model, type Inbox } from '../model.ts'
import { Option } from 'effect'
import { PrefsMessage } from '../prefs.ts'
import { ResearchMessage } from '../research.ts'
import { TeamOutMessage } from '../team.ts'
import { Update } from 'foldkit'
import { eventFact, type Fact } from '../mail.ts'
import { money } from '@quorum/ui/game/format'
import { say, withToast, act, type UpdateResult, type Dispatch } from './shared.ts'
import { teamAction } from './team.ts'
import { tradeoffOf } from './tradeoff.ts'

/** A fact joins the Inbox; it needs no preview card while the Inbox panel is open. */
export const CALENDAR_HOUR = 60

export const mailedTo = (model: Model, fact: Fact, time: number, repeats = false): Model => ({
  ...model,
  board: {
    ...model.board,
    inbox: mailed(model.board.inbox, fact, time, model.panel === 'inbox', repeats),
  },
})

/** The Inbox's keys: J and K move, E deletes (or restores), S reports spam, 1 to 9 press a button. */
export const mailKey = (model: Model, key: string, route: Dispatch): UpdateResult | null => {
  const list = folderList(model.board.inbox)
  const at = list.findIndex((mail) => mail.id === model.board.inbox.focus)
  const current = list[at]
  const neighbour = (list[at + 1] ?? list[at - 1])?.id ?? null
  // Deleting or reporting a Mail moves on to its neighbour.
  const apply = (message: InboxMessage): UpdateResult =>
    Update.combine(model, [
      (next: Model) => foldInbox(next, message, route),
      (next: Model) => foldInbox(next, InboxMessage.Opened({ id: neighbour }), route),
    ])
  switch (key) {
    case 'j':
      return foldInbox(
        model,
        InboxMessage.Opened({ id: list[Math.min(at + 1, list.length - 1)]?.id ?? null }),
        route,
      )
    case 'k':
      return foldInbox(
        model,
        InboxMessage.Opened({ id: list[Math.max(at - 1, 0)]?.id ?? null }),
        route,
      )
    case 'e':
      return current && current.id !== DIGEST_ID
        ? apply(
            current.trashed
              ? InboxMessage.Restored({ id: current.id })
              : InboxMessage.Trashed({ id: current.id }),
          )
        : null
    case 's':
      return current && current.id !== DIGEST_ID && !current.trashed
        ? apply(InboxMessage.MarkedSpam({ id: current.id }))
        : null
    default: {
      // The reader shows every button, so every one of them takes a number, in order.
      if (!/^[1-9]$/.test(key)) return null
      const action = current?.phase._tag === 'Active' ? current.actions[Number(key) - 1] : undefined
      // The Inbox owns the number keys while it is open, so they never reach the board's shortcuts.
      return current && action
        ? foldInbox(model, InboxMessage.Acted({ id: current.id, action: action.id }), route)
        : { model }
    }
  }
}

/** A Mail button whose effect is outside the Inbox: the Message it stands for. */
export const mailAction = (
  model: Model,
  route: Dispatch,
  kind: string,
  target: string | null,
): UpdateResult => {
  switch (kind) {
    case 'raise':
      return route(model, Message.RoundRaised())
    case 'decline':
      return route(model, Message.RoundDeclined())
    case 'hire':
      return teamAction(model, TeamOutMessage.Hire())
    case 'team':
      return route(model, Message.PanelOpened({ panel: 'team' }))
    case 'rewrite': {
      const runtime = RUNTIME_IDS.find((id) => LANGUAGES[RUNTIMES[id].language].name === target)
      if (!runtime)
        return withToast(model, say(model).toasts.noPlayableRuntime(target ?? ''), 'warn')
      const game = model.board.game
      const servers = game.nodes.filter((node) => node.type === 'server')
      const node =
        servers.find((entry) => entry.id === model.board.selected && entry.runtime !== runtime) ??
        servers.find((entry) => entry.runtime !== runtime)
      if (!node)
        return withToast(
          model,
          servers.length === 0
            ? say(model).toasts.addServerFirst
            : say(model).toasts.alreadyRuns(target ?? ''),
          'warn',
        )
      const research = RUNTIMES[runtime].research
      if (research && !game.researched.includes(research)) {
        const opened = route(model, Message.PanelOpened({ panel: 'research' }))
        return withToast(
          {
            ...opened.model,
            board: {
              ...opened.model.board,
              research: { ...opened.model.board.research, focus: research },
            },
          },
          say(model).toasts.researchThenReview(say(model).catalog.research[research].name),
          'warn',
        )
      }
      const [card, commands] = tradeoffOf(model, node.id, { kind: 'runtime', id: runtime }, true)
      return {
        model: {
          ...model,
          panel: 'none',
          board: {
            ...model.board,
            region: node.region,
            selected: node.id,
            selection: [],
            flow: { _tag: 'Idle' },
            tradeoff: card,
          },
        },
        commands,
      }
    }
    case 'easy':
      return model.prefs.easyMode
        ? { model }
        : route(model, Message.PrefsChanged({ message: PrefsMessage.EasyModeToggled() }))
    case 'churn':
      return route(model, Message.PanelOpened({ panel: 'churn' }))
    case 'research': {
      const opened = route(model, Message.PanelOpened({ panel: 'research' }))
      const focused = route(
        opened.model,
        Message.ResearchChanged({ message: ResearchMessage.Focused({ id: target as ResearchId }) }),
      )
      return { ...focused, commands: [...(opened.commands ?? []), ...(focused.commands ?? [])] }
    }
    case 'first':
      return route(model, Message.WorkPrioritized({ id: Number(target) }))
    case 'approve':
      return route(model, Message.WorkApproved({ id: Number(target) }))
    case 'defer':
      return route(model, Message.WorkDeferred({ id: Number(target) }))
    case 'patch':
      return route(model, Message.WorkPatched({ id: Number(target) }))
    case 'queue':
      return route(model, Message.WorkPatchQueued({ id: Number(target) }))
    case 'timeoff':
      return route(model, Message.EngineerGivenTimeOff({ engineerId: target ?? '' }))
    case 'payrise':
      return route(model, Message.EngineerGivenRaise({ engineerId: target ?? '' }))
    case 'resign':
      return route(model, Message.EngineerResigned({ engineerId: target ?? '' }))
    case 'rush':
      return route(model, Message.WorkRushed({ id: Number(target) }))
    case 'show':
      return target === null ? { model } : route(model, Message.RevealNode({ nodeId: target }))
    case 'resize':
    case 'quota':
    case 'reserved': {
      // The Inspector holds a Node's size, its limit, and its pricing model (GDD 18 "Senders").
      const node = model.board.game.nodes.find((entry) => entry.id === target)
      if (!node) return { model }
      const inspected = route(model, Message.NodeTapped({ nodeId: node.id }))
      return {
        model: {
          ...inspected.model,
          panel: 'none',
          board: { ...inspected.model.board, region: node.region },
        },
        commands: [...(inspected.commands ?? []), FocusInspector({})],
      }
    }
    case 'backlog': {
      const id = target as keyof typeof FEATURES | null
      if (!id || !(id in FEATURES)) return { model }
      return act(model, `Queued ${FEATURES[id].name}`, Work.queueFeature(model.board.game, id))
    }
    case 'trap':
      return trapTaken(model, target)
    case 'vendor': {
      const id = target as ResearchId | null
      if (!id || !(id in RESEARCH)) return { model }
      return act(
        model,
        `Booked a demo of ${RESEARCH[id].name}`,
        Actions.takeDiscount(model.board.game, id),
        {
          note: () => [say(model).toasts.vendorDemo(say(model).catalog.research[id].name), 'ok'],
        },
      )
    }
    case 'postmortem':
    case 'postmortem-take':
      return route(
        model,
        Message.PostmortemFiled({
          id: Number(target),
          take: kind === 'postmortem-take',
        }),
      )
    default:
      return { model }
  }
}

/** What paying a fake invoice costs, in Cash: the amount printed on the invoice itself. */
export const FAKE_INVOICE = 4_812

export const FAKE_DOMAIN = 389

/**
 * A trap the player clicked (18 "Spam and phishing"): the effect lands in the world, and the Mail
 * records it. Spam lies about the world, so the damage is always the player's own click.
 */
export const trapTaken = (model: Model, target: string | null): UpdateResult => {
  const game = model.board.game
  switch (target) {
    case 'phish': {
      const taken = act(model, 'Gave away the credentials', Actions.phished(game), {
        note: () => [say(model).toasts.credentialLeak, 'danger'],
      })
      const incident = taken.model.board.game.incident
      // The Act starts the incident directly, so the pager's Mail is written here, not by a Step.
      return incident?.kind === 'credential-leak'
        ? {
            ...taken,
            model: mailedTo(
              taken.model,
              eventFact(
                { _tag: 'IncidentStarted', incident },
                { topic: 'incident-phishing', vars: {} },
                taken.model.board.game,
              ),
              taken.model.board.game.time,
              true,
            ),
          }
        : taken
    }
    case 'invoice':
      return act(model, 'Paid a fake invoice', Actions.payFakeInvoice(game, FAKE_INVOICE), {
        note: () => [say(model).toasts.paidInvoice(money(FAKE_INVOICE)), 'danger'],
      })
    case 'domain':
      return act(model, 'Paid a fake domain notice', Actions.payFakeInvoice(game, FAKE_DOMAIN), {
        note: () => [say(model).toasts.paidDomain(money(FAKE_DOMAIN)), 'danger'],
      })
    // A fake advisory's patcher installs a backdoor: it is used after a while, and a breach starts.
    case 'patcher': {
      const taken = act(model, 'Ran an unknown patcher', Actions.installBackdoor(game), {
        note: () => [say(model).toasts.patcherBackdoor, 'danger'],
      })
      return taken
    }
    default:
      return withToast(model, say(model).toasts.phishing, 'danger')
  }
}

/** An Inbox gesture. The Inbox reads the board's Game and whether its panel is open. */
export const foldInbox = (model: Model, message: InboxMessage, route: Dispatch): UpdateResult =>
  Update.foldChild({
    update: (inbox: Inbox, child: InboxMessage) =>
      updateInbox(inbox, child, { game: model.board.game, open: model.panel === 'inbox' }),
    read: (parent: Model) => Option.some(parent.board.inbox),
    write: (parent, inbox) => ({ ...parent, board: { ...parent.board, inbox } }),
    toParentMessage: (child) => Message.InboxChanged({ message: child }),
    foldOutMessage: (out: InboxOutMessage) => (parent: Model) =>
      InboxOutMessage.match<UpdateResult>(out, {
        PanelWanted: () => ({
          model: { ...parent, panel: 'inbox', board: { ...parent.board, flow: { _tag: 'Idle' } } },
        }),
        ActionTaken: ({ kind, target }) => mailAction(parent, route, kind, target),
      }),
  })(model, message)
