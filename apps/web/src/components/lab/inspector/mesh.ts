import { copy, nodeTitle } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { MESH_HOP_MS, MESH_OVERHEAD, MESH_INSIGHT } from '@quorum/simulation/catalog'
import { platformTax } from '@quorum/simulation/team'
import { burnOf, meshMembers } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, percent, percentNumber, section } from './shared.ts'

/** The Service Mesh's members and what each sidecar costs them (05 "Service Mesh"). */
const sidecars = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const members = meshMembers(game, node)
  return [
    section(
      t.inspectorMesh.sidecars,
      [
        ...(members.length === 0
          ? [caption(t.inspectorMesh.linkAppServersOrWorkersInto, h)]
          : members.map((member) =>
              h.div(
                [h.Key(member.id), h.Class('flex items-center justify-between gap-2 py-0.5')],
                [caption(nodeTitle(t, game, member), h)],
              ),
            )),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            t.inspectorMesh.eachSidecarRetries(
              percentNumber(MESH_INSIGHT),
              t.units.ms(MESH_HOP_MS),
              percentNumber(MESH_OVERHEAD),
            ),
          ],
        ),
        caption(t.inspectorMesh.mutualTLSSitsOnEveryMember, h),
      ],
      h,
      true,
    ),
  ]
}

export const meshPanel: Panel = {
  stats: ({ game, node, h }) => {
    const t = copy(h)

    const members = meshMembers(game, node)
    const sidecars = members.length
    return [
      row(t.inspectorMesh.sidecars, `${sidecars}`, sidecars === 0 ? 'warn' : 'plain', h),
      row(t.inspectorMesh.perHop, `+${t.units.ms(MESH_HOP_MS)}`, 'plain', h),
      row(t.inspectorMesh.memberCPU, `−${percent(MESH_OVERHEAD)}`, 'plain', h),
      row(t.inspectorMesh.insight, t.inspectorMesh.onItsLinks(percent(MESH_INSIGHT)), 'ok', h),
      row(
        t.inspectorMesh.platform,
        t.inspectorMesh.engineers(platformTax(game).toFixed(1)),
        'plain',
        h,
      ),
      row(t.inspectorMesh.burn, t.inspectorMesh.s(money(burnOf(game, node))), 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [...sidecars(game, node, h)],
}
