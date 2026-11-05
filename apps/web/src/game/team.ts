import { DragAndDrop } from '@foldkit/ui'
import { Schema } from 'effect'
import { Command, type Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { FeatureId, PolicyId, TeamKind } from '@quorum/simulation/state'
import type { Team } from './model.ts'

/* The Team panel: it owns the engineer drag gesture and turns each button and
   each drop between teams into a Game action, which the parent runs. */

export const TeamMessage = defineMessageUnion({
  DragChanged: { message: DragAndDrop.Message },
  HireChosen: {},
  LayoffChosen: { engineerId: Schema.String },
  Created: {},
  Removed: { teamId: Schema.String },
  EngineerAssigned: { engineerId: Schema.String, teamId: Schema.String },
  PolicyChosen: { teamId: Schema.String, policy: PolicyId },
  KindChosen: { teamId: Schema.String, kind: TeamKind },
  FeatureQueued: { id: FeatureId },
  /** The split's draft: its name, its owner, and the Features it moves. */
  ServiceNamed: { name: Schema.String },
  ServiceOwnerChosen: { teamId: Schema.String },
  ServiceFeatureToggled: { id: FeatureId },
  SplitChosen: {},
})
export type TeamMessage = typeof TeamMessage.Type

export const TeamOutMessage = defineMessageUnion({
  Hire: {},
  Layoff: { engineerId: Schema.String },
  CreateTeam: {},
  RemoveTeam: { teamId: Schema.String },
  Assign: { engineerId: Schema.String, teamId: Schema.String },
  SetPolicy: { teamId: Schema.String, policy: PolicyId },
  SetKind: { teamId: Schema.String, kind: TeamKind },
  QueueFeature: { id: FeatureId },
  SplitService: { name: Schema.String, owner: Schema.String, features: Schema.Array(FeatureId) },
})
export type TeamOutMessage = typeof TeamOutMessage.Type

export const initTeam = (): Team => ({
  drag: DragAndDrop.init({ id: 'team-drag' }),
  service: { name: '', owner: 'core', features: [] },
})

type TeamReturn = Update.ReturnWithOutMessage<Team, TeamMessage, TeamOutMessage>

const out = (team: Team, outMessage: TeamOutMessage): TeamReturn => ({ model: team, outMessage })

/** A drop moves someone only when it lands in another team. */
const dragged = (team: Team, message: DragAndDrop.Message): TeamReturn => {
  const next = DragAndDrop.update(team.drag, message)
  const drop = next.outMessage
  return {
    model: { ...team, drag: next.model },
    commands: Command.mapMessages(next.commands, (child) =>
      TeamMessage.DragChanged({ message: child }),
    ),
    ...(drop?._tag === 'Reordered' && drop.fromContainerId !== drop.toContainerId
      ? {
          outMessage: TeamOutMessage.Assign({
            engineerId: drop.itemId,
            teamId: drop.toContainerId,
          }),
        }
      : {}),
  }
}

export const updateTeam = (team: Team, message: TeamMessage): TeamReturn =>
  TeamMessage.match<TeamReturn>(message, {
    DragChanged: ({ message: child }) => dragged(team, child),
    HireChosen: () => out(team, TeamOutMessage.Hire()),
    LayoffChosen: ({ engineerId }) => out(team, TeamOutMessage.Layoff({ engineerId })),
    Created: () => out(team, TeamOutMessage.CreateTeam()),
    Removed: ({ teamId }) => out(team, TeamOutMessage.RemoveTeam({ teamId })),
    EngineerAssigned: ({ engineerId, teamId }) =>
      out(team, TeamOutMessage.Assign({ engineerId, teamId })),
    PolicyChosen: ({ teamId, policy }) => out(team, TeamOutMessage.SetPolicy({ teamId, policy })),
    KindChosen: ({ teamId, kind }) => out(team, TeamOutMessage.SetKind({ teamId, kind })),
    FeatureQueued: ({ id }) => out(team, TeamOutMessage.QueueFeature({ id })),
    ServiceNamed: ({ name }) => ({
      model: { ...team, service: { ...team.service, name } },
    }),
    ServiceOwnerChosen: ({ teamId }) => ({
      model: { ...team, service: { ...team.service, owner: teamId } },
    }),
    ServiceFeatureToggled: ({ id }) => ({
      model: {
        ...team,
        service: {
          ...team.service,
          features: team.service.features.includes(id)
            ? team.service.features.filter((entry) => entry !== id)
            : [...team.service.features, id],
        },
      },
    }),
    SplitChosen: () =>
      out(
        team,
        TeamOutMessage.SplitService({
          name: team.service.name,
          owner: team.service.owner,
          features: [...team.service.features],
        }),
      ),
  })
