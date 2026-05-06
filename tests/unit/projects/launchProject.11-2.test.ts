import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Tests TDD Outside-In — launchProject (Story 11.2)
// T3.1–T3.2: campo customQuestion incluido en el insert de Supabase
// AC-4
// ---------------------------------------------------------------------------

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

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

import { launchProject, type LaunchProjectInput } from '@/actions/projects/launchProject'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-test' }
const MOCK_COMMUNITY = { id: 'community-uuid-test' }
const MOCK_PROJECT = { id: 'project-uuid-test', slug: 'mi-proyecto-test' }

const VALID_INPUT: LaunchProjectInput = {
  communitySlug: 'startup-madrid',
  title: 'Mi proyecto test',
  tagline: 'Tagline de test',
  problem: 'El problema a resolver',
  solution: 'La solución propuesta',
  hypothesis: 'Si implemento esto, funciona',
  imageUrls: [],
  feedbackTopics: [],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockAuthOk() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
}

function mockProjectInsertOk() {
  const insertSpy = vi.fn().mockReturnThis()
  const selectSpy = vi.fn().mockReturnThis()
  const singleSpy = vi.fn().mockResolvedValue({ data: MOCK_PROJECT, error: null })

  supabaseMock.from.mockImplementation((table: string) => {
    if (table === 'communities') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_COMMUNITY, error: null }),
      }
    }
    if (table === 'projects') {
      return { insert: insertSpy, select: selectSpy, single: singleSpy }
    }
    return {}
  })

  return { insertSpy, selectSpy, singleSpy }
}

// ---------------------------------------------------------------------------
// T3.1: customQuestion en el insert
// ---------------------------------------------------------------------------

describe('launchProject (Story 11.2) — T3.1: customQuestion en el insert', () => {
  beforeEach(mockAuthOk)
  afterEach(() => vi.clearAllMocks())

  it('incluye custom_question en el insert cuando customQuestion está presente', async () => {
    const { insertSpy } = mockProjectInsertOk()

    await launchProject({
      ...VALID_INPUT,
      customQuestion: '¿Lo usarías en producción inmediatamente?',
    })

    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        custom_question: '¿Lo usarías en producción inmediatamente?',
      }),
    )
  })
})

// ---------------------------------------------------------------------------
// T3.2: sin customQuestion → custom_question es null
// ---------------------------------------------------------------------------

describe('launchProject (Story 11.2) — T3.2: sin customQuestion → null', () => {
  beforeEach(mockAuthOk)
  afterEach(() => vi.clearAllMocks())

  it('incluye custom_question: null en el insert cuando customQuestion no se proporciona', async () => {
    const { insertSpy } = mockProjectInsertOk()

    await launchProject(VALID_INPUT)

    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        custom_question: null,
      }),
    )
  })

  it('incluye custom_question: null cuando customQuestion es string vacío', async () => {
    const { insertSpy } = mockProjectInsertOk()

    await launchProject({ ...VALID_INPUT, customQuestion: '' })

    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        custom_question: null,
      }),
    )
  })
})
