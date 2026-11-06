import type { ComponentDef } from '../catalog/components.ts'

/** A Component's catalog entry, with the defaults of a plain Node filled in. */
export const def = (
  entry: Omit<
    ComponentDef,
    | 'maxOut'
    | 'tap'
    | 'mirror'
    | 'control'
    | 'unlock'
    | 'fixed'
    | 'sized'
    | 'burn'
    | 'steps'
    | 'sends'
    | 'fallback'
    | 'stack'
    | 'limiting'
    | 'coldStart'
  > &
    Partial<ComponentDef>,
): ComponentDef => ({
  sends: [],
  fallback: [],
  stack: false,
  limiting: false,
  coldStart: false,
  maxOut: 99,
  tap: false,
  mirror: false,
  control: false,
  unlock: null,
  fixed: false,
  sized: false,
  steps: 1,
  burn: 0,
  ...entry,
})
