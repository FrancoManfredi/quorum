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

export type Quadrant = Readonly<{
  label: string
  /** What a reader comes to the kind for, in a few words. */
  purpose: string
  icon: IconNode
  group: BuildGroup
}>

export const QUADRANTS: Readonly<Record<Section, Quadrant>> = {
  play: { label: 'Play the game', purpose: 'Learn the controls', icon: Gamepad2, group: 'edge' },
  tutorials: {
    label: 'Tutorials',
    purpose: 'Learn by playing',
    icon: GraduationCap,
    group: 'edge',
  },
  guides: { label: 'How-to guides', purpose: 'Fix a problem', icon: Wrench, group: 'compute' },
  explanation: { label: 'Explanation', purpose: 'Understand why', icon: Lightbulb, group: 'data' },
  patterns: {
    label: 'Patterns',
    purpose: 'Learn a design pattern',
    icon: NotebookPen,
    group: 'compute',
  },
  reference: { label: 'Reference', purpose: 'Look up a fact', icon: BookOpen, group: 'ops' },
  design: { label: 'Design', purpose: 'Read the design document', icon: FileText, group: 'ops' },
  about: { label: 'About', purpose: 'The wiki itself', icon: Info, group: 'ops' },
}

export const quadrantBadge = <M>(section: Section, className: string, h: HtmlBuilder<M>): Html =>
  section === 'about'
    ? groupBadge('ops', QUADRANTS.about.icon, className, h, true)
    : groupBadge(QUADRANTS[section].group, QUADRANTS[section].icon, className, h)

/** The group colour of a kind, as a CSS value. */
export const quadrantColor = (section: Section): string =>
  section === 'about' ? 'var(--muted-foreground)' : `var(--group-${QUADRANTS[section].group})`
