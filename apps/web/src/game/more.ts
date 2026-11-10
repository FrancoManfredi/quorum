import { Menu } from '@foldkit/ui'

/** On a phone the toolbar keeps the controls you use all the time; the rest wait in More. */
export type MoreItem =
  | 'exit'
  | 'playbooks'
  | 'dashboard'
  | 'help'
  | 'undo'
  | 'redo'
  | 'tidy'
  | 'fit'
  | 'fullscreen'
  | 'screenshot'

export const moreMenu = Menu.create<MoreItem>()
