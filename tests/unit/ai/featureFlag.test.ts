import { describe, it, expect, vi, afterEach } from 'vitest'
import { isAIEnabled } from '@/lib/ai/featureFlag'

describe('isAIEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("devuelve true cuando NEXT_PUBLIC_AI_ENABLED es 'true'", () => {
    vi.stubEnv('NEXT_PUBLIC_AI_ENABLED', 'true')
    expect(isAIEnabled()).toBe(true)
  })

  it("devuelve false cuando NEXT_PUBLIC_AI_ENABLED es 'false'", () => {
    vi.stubEnv('NEXT_PUBLIC_AI_ENABLED', 'false')
    expect(isAIEnabled()).toBe(false)
  })

  it('devuelve false cuando NEXT_PUBLIC_AI_ENABLED está vacía', () => {
    vi.stubEnv('NEXT_PUBLIC_AI_ENABLED', '')
    expect(isAIEnabled()).toBe(false)
  })

  it("devuelve false para valores distintos de 'true' ('1', 'TRUE', '0')", () => {
    vi.stubEnv('NEXT_PUBLIC_AI_ENABLED', '1')
    expect(isAIEnabled()).toBe(false)
  })
})
