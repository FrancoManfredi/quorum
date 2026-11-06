import { type Panel, spreading } from './shared.ts'

export const dsqlPanel: Panel = {
  late: ({ game, node, h }) => [...spreading(game, node, h)],
}
