import type { Html, HtmlBuilder } from 'foldkit/html'
import { MESH_HOP_MS, MESH_OVERHEAD, MESH_INSIGHT } from '@quorum/simulation/catalog'
import { nodeLabel } from '@quorum/simulation/labels'
import { platformTax } from '@quorum/simulation/team'
import { burnOf, meshMembers } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, percent, section } from './shared.ts'

/** The Service Mesh's members and what each sidecar costs them (05 "Service Mesh"). */
const sidecars = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const members = meshMembers(game, node)
  return [
    section(
      'Sidecars',
      [
        ...(members.length === 0
          ? [caption('Link App Servers or Workers into it. Nothing is under the mesh yet.', h)]
          : members.map((member) =>
              h.div(
                [h.Key(member.id), h.Class('flex items-center justify-between gap-2 py-0.5')],
                [caption(nodeLabel(game, member), h)],
              ),
            )),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `Each sidecar retries and breaks the Links out of its Node, watches them for Insight (+${percent(MESH_INSIGHT)}), adds ${MESH_HOP_MS} ms to each hop, and takes ${percent(MESH_OVERHEAD)} of the box's CPU. Every member's Burn pays for its sidecar, and each mesh takes Platform Dev Hours.`,
          ],
        ),
        caption(
          'Mutual TLS sits on every member-to-member call. It is a property, not a figure.',
          h,
        ),
      ],
      h,
      true,
    ),
  ]
}

export const meshPanel: Panel = {
  stats: ({ game, node, h }) => {
    const members = meshMembers(game, node)
    const sidecars = members.length
    return [
      row('Sidecars', `${sidecars}`, sidecars === 0 ? 'warn' : 'plain', h),
      row('Per hop', `+${MESH_HOP_MS} ms`, 'plain', h),
      row('Member CPU', `−${percent(MESH_OVERHEAD)}`, 'plain', h),
      row('Insight', `+${percent(MESH_INSIGHT)} on its Links`, 'ok', h),
      row('Platform', `${platformTax(game).toFixed(1)} engineers`, 'plain', h),
      row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [...sidecars(game, node, h)],
}
