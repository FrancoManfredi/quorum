import { describe, expect, test } from 'vitest'
import { newGame } from './company.ts'
import { nextAdvice } from './goals.ts'
import { solve } from './solve.ts'
import { NO_INSIGHT, type Game } from './state.ts'

/* 18 "Mail": the mentor's advice holds for the Board the player sees. */

describe('the mentor asks for a Study', () => {
  test('not before Insight covers any Research item', () => {
    // A new Company has no Insight, and Research is still hidden (GDD 15, Progressive disclosure).
    const game: Game = { ...newGame(), pools: NO_INSIGHT }
    expect(nextAdvice(game, solve(game)).key).not.toBe('mentor:research')
  })

  test('once Insight covers the cheapest Research item', () => {
    const game: Game = { ...newGame(), pools: { ...NO_INSIGHT, page: 1_000_000 } }
    expect(nextAdvice(game, solve(game)).key).toBe('mentor:research')
  })
})
