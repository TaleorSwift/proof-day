import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock de Supabase (hoisted para que vi.mock lo use)
// ---------------------------------------------------------------------------

const { supabaseMock } = vi.hoisted(() => {
  const supabaseMock = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  }
  return { supabaseMock }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

// ---------------------------------------------------------------------------
// Imports — después de los mocks
// ---------------------------------------------------------------------------

import { PUT } from '@/app/api/projects/[id]/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-test' }
const PROJECT_ID = 'project-uuid-test'

const EXISTING_PROJECT = {
  id: PROJECT_ID,
  status: 'draft',
  builder_id: MOCK_USER.id,
}

const UPDATED_PROJECT = {
  id: PROJECT_ID,
  title: 'Título actualizado',
  feedback_topics: null,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRequest(body: unknown): Request {
  return new Request(`http://localhost/api/projects/${PROJECT_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function buildParams(id: string = PROJECT_ID): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}

function mockAuthOk() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
}

function mockProjectUpdateWithCapture() {
  let capturedUpdateFields: Record<string, unknown> | null = null
  const singleUpdateSpy = vi.fn().mockResolvedValue({ data: UPDATED_PROJECT, error: null })
  const selectAfterUpdateSpy = vi.fn().mockReturnValue({ single: singleUpdateSpy })
  const eqAfterUpdateSpy = vi.fn().mockReturnValue({ select: selectAfterUpdateSpy })
  const updateSpy = vi.fn().mockImplementation((fields: Record<string, unknown>) => {
    capturedUpdateFields = fields
    return { eq: eqAfterUpdateSpy }
  })

  supabaseMock.from.mockImplementation((table: string) => {
    if (table === 'projects') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: EXISTING_PROJECT, error: null }),
          }),
        }),
        update: updateSpy,
      }
    }
    return {}
  })

  return { updateSpy, getCaptured: () => capturedUpdateFields }
}

// ---------------------------------------------------------------------------
// Suite: feedbackTopics [] → feedback_topics: null (E3)
// ---------------------------------------------------------------------------

describe('PUT /api/projects/[id] — feedbackTopics [] → feedback_topics: null', () => {
  beforeEach(mockAuthOk)
  afterEach(() => vi.clearAllMocks())

  it('llama a Supabase update con feedback_topics: null cuando feedbackTopics es []', async () => {
    const { updateSpy, getCaptured } = mockProjectUpdateWithCapture()

    const request = buildRequest({ feedbackTopics: [] })
    await PUT(request, buildParams())

    expect(updateSpy).toHaveBeenCalled()
    const fields = getCaptured()
    expect(fields).not.toBeNull()
    expect(fields!.feedback_topics).toBeNull()
  })

  it('llama a Supabase update con el array cuando feedbackTopics tiene elementos', async () => {
    const { updateSpy, getCaptured } = mockProjectUpdateWithCapture()

    const request = buildRequest({ feedbackTopics: ['ux', 'producto'] })
    await PUT(request, buildParams())

    expect(updateSpy).toHaveBeenCalled()
    const fields = getCaptured()
    expect(fields).not.toBeNull()
    expect(fields!.feedback_topics).toEqual(['ux', 'producto'])
  })

  it('no incluye feedback_topics en el update cuando feedbackTopics no se envía', async () => {
    const { updateSpy, getCaptured } = mockProjectUpdateWithCapture()

    const request = buildRequest({ title: 'Solo título' })
    await PUT(request, buildParams())

    expect(updateSpy).toHaveBeenCalled()
    const fields = getCaptured()
    expect(fields).not.toBeNull()
    expect('feedback_topics' in fields!).toBe(false)
  })
})
