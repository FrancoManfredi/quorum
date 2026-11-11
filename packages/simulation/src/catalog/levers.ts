/* Product levers (10 "Product levers"): the request kinds a product change can raise. */

import { ERAS } from './eras.ts'
import type { FeatureId } from './work.ts'
import type { VentureId } from './ventures.ts'

/**
 * The twelve kinds a Product lever can raise. `page`, `read`, and `write` are
 * already abundant and never limit a default recipe; `bot` and `bid` pay no
 * recipe.
 */
export const LEVER_KINDS = [
  'login',
  'search',
  'upload',
  'media',
  'rt',
  'buy',
  'job',
  'report',
  'ai',
  'feed',
  'hook',
  'push',
] as const
export type LeverKind = (typeof LEVER_KINDS)[number]

/** The kind's share multiplier at step 0 to 3. A step of 0 is the Era's mix. */
export const LEVER_STEPS = [1, 2, 3, 4] as const
/** Dev Hours each step costs: the first, second, and third. */
export const LEVER_DH = [24, 80, 240] as const
/** User growth multiplier per step: 1%, 2%, and 4% off growth. */
export const LEVER_GROWTH = [0.99, 0.98, 0.96] as const
/** Share of a step's Dev Hours a removal refunds. */
export const LEVER_REFUND = 0.5
export const MAX_LEVER_STEP = 3

/** The Feature that brings a kind, or the first one that changes it. */
export const LEVER_OWNER: Readonly<Record<LeverKind, FeatureId>> = {
  login: 'password-login',
  search: 'search-filters',
  upload: 'profile-photos',
  media: 'video',
  rt: 'chat',
  buy: 'checkout',
  job: 'data-export',
  report: 'dashboards',
  ai: 'ai-assistant',
  feed: 'activity-feed',
  hook: 'webhooks',
  push: 'push-notifications',
}

/** A Venture's cap: the product change would erase the Venture's constraint. */
export const LEVER_CAPS: Readonly<
  Partial<Record<VentureId, Readonly<{ kind: LeverKind; step: number }>>>
> = {
  fintech: { kind: 'buy', step: 1 },
  'ai-startup': { kind: 'ai', step: 1 },
  healthcare: { kind: 'upload', step: 1 },
  government: { kind: 'push', step: 1 },
}

/** The Era a kind arrives in: the first one whose mix carries it. */
export const leverEra = (kind: LeverKind): number => {
  const index = ERAS.findIndex((era) => (era.mix[kind] ?? 0) > 0)
  return index < 0 ? ERAS.length - 1 : index
}

/** The kind's share when it arrives. */
export const leverBaseShare = (kind: LeverKind): number => ERAS[leverEra(kind)]?.mix[kind] ?? 0

/** The first Era a step opens in: the kind's Era, then one Era later, then two. */
export const leverStepEra = (kind: LeverKind, step: number): number =>
  leverEra(kind) + Math.max(0, step - 1)

export const isLeverKind = (kind: string): kind is LeverKind =>
  (LEVER_KINDS as ReadonlyArray<string>).includes(kind)

/** The kind's share multiplier at a step, clamped to the three buildable steps. */
export const leverMultiplier = (step: number): number =>
  LEVER_STEPS[Math.max(0, Math.min(MAX_LEVER_STEP, Math.floor(step)))] ?? 1

/** The share a step costs, in Dev Hours. Step 0 costs nothing. */
export const leverDh = (step: number): number => LEVER_DH[Math.max(1, step) - 1] ?? 0

/** The growth multiplier a step leaves. Step 0 leaves growth alone. */
export const leverGrowth = (step: number): number =>
  step <= 0 ? 1 : (LEVER_GROWTH[Math.min(MAX_LEVER_STEP, step) - 1] ?? 1)

/** The growth multiplier the built steps leave together: each step costs its own percent. */
export const leverGrowthTotal = (step: number): number => {
  let factor = 1
  for (let each = 1; each <= Math.min(MAX_LEVER_STEP, step); each += 1)
    factor *= LEVER_GROWTH[each - 1] ?? 1
  return factor
}
