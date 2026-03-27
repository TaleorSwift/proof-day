import { describe, it, expect } from 'vitest'

describe('Setup smoke test', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  it('should have correct environment', () => {
    expect(typeof process).toBe('object')
  })
})
