import { beforeEach, describe, expect, it } from 'vitest'
import { checkRateLimit, resetRateLimits } from './rateLimit'

describe('rate limiter', () => {
  beforeEach(resetRateLimits)

  it('blocks requests after the configured allowance', () => {
    expect(checkRateLimit('client', 2, 1000, 0).allowed).toBe(true)
    expect(checkRateLimit('client', 2, 1000, 1).allowed).toBe(true)
    expect(checkRateLimit('client', 2, 1000, 2).allowed).toBe(false)
  })

  it('starts a new bucket after the window', () => {
    checkRateLimit('client', 1, 1000, 0)
    expect(checkRateLimit('client', 1, 1000, 1000).allowed).toBe(true)
  })
})
