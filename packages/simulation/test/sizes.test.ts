import { expect, test } from 'vitest'
import { SIZES } from '../src/catalog.ts'

test('a save stores the SIZES index, so the order only appends', () => {
  expect(SIZES.map((size) => size.name)).toEqual([
    'nano',
    'micro',
    'small',
    'medium',
    'large',
    'xlarge',
    '2xlarge',
    '4xlarge',
    'metal',
  ])
})

test('each step doubles vCPU, and metal is the last', () => {
  const vcpu = SIZES.map((size) => size.vcpu)
  for (const [index, value] of vcpu.entries())
    if (index > 0 && index < vcpu.length - 1) expect(value).toBe(2 * (vcpu[index - 1] ?? 0))
  expect(vcpu.at(-1)).toBe(96)
})
