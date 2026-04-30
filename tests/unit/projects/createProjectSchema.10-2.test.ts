// Story 10.2 — T5.4: Test unitario createProjectSchema con template_id

import { describe, it, expect } from 'vitest'
import { createProjectSchema } from '@/lib/validations/projects'

const BASE_VALID_DATA = {
  title: 'Pulse Check',
  problem: 'Remote teams struggle with visibility.',
  solution: 'A weekly pulse survey tool.',
  hypothesis: 'If teams track mood, they intervene faster.',
  imageUrls: ['https://example.com/image.jpg'],
  communityId: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
}

describe('createProjectSchema — template_id (Story 10.2)', () => {
  it('acepta body con template_id: null', () => {
    const result = createProjectSchema.safeParse({
      ...BASE_VALID_DATA,
      template_id: null,
    })
    expect(result.success).toBe(true)
  })

  it('acepta body con template_id: uuid válido', () => {
    const result = createProjectSchema.safeParse({
      ...BASE_VALID_DATA,
      template_id: 'b3bb189e-8bf9-3888-9912-ace4e6543002',
    })
    expect(result.success).toBe(true)
  })

  it('acepta body sin campo template_id (retrocompatibilidad)', () => {
    const result = createProjectSchema.safeParse({
      ...BASE_VALID_DATA,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza template_id con string que no es uuid', () => {
    const result = createProjectSchema.safeParse({
      ...BASE_VALID_DATA,
      template_id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })
})
