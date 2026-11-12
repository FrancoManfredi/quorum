import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  BookOpen,
  FileText,
  Gamepad2,
  GraduationCap,
  Info,
  Lightbulb,
  NotebookPen,
  Wrench,
  type IconNode,
} from 'lucide'
import type { BuildGroup } from '@quorum/simulation/catalog'
import { groupBadge } from '@quorum/ui/game/bits'
import type { Section } from '../frontmatter.ts'

/** A kind of page's mark. Its name and its purpose are interface copy (`t.quadrants`). */
export type Quadrant = Readonly<{
  icon: IconNode
  group: BuildGroup
}>

export const QUADRANTS: Readonly<Record<Section, Quadrant>> = {
  play: { icon: Gamepad2, group: 'edge' },
  tutorials: {
    icon: GraduationCap,
    group: 'edge',
  },
  guides: { icon: Wrench, group: 'compute' },
  explanation: { icon: Lightbulb, group: 'data' },
  patterns: {
    icon: NotebookPen,
    group: 'compute',
  },
  reference: { icon: BookOpen, group: 'ops' },
  design: { icon: FileText, group: 'ops' },
  about: { icon: Info, group: 'ops' },
}

export const quadrantBadge = <M>(section: Section, className: string, h: HtmlBuilder<M>): Html =>
  section === 'about'
    ? groupBadge('ops', QUADRANTS.about.icon, className, h, true)
    : groupBadge(QUADRANTS[section].group, QUADRANTS[section].icon, className, h)

/** The group colour of a kind, as a CSS value. */
export const quadrantColor = (section: Section): string =>
  section === 'about' ? 'var(--muted-foreground)' : `var(--group-${QUADRANTS[section].group})`
