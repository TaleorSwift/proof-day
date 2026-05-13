import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Tests TDD Outside-In — launchProject (Story 11.5)
// Gate de reciprocidad al publicar
// AC-1: threshold=0 → siempre pasa (sin consulta de feedbacks)
// AC-2: threshold=3, builder tiene 2 feedbacks → RECIPROCITY_GATE_BLOCKED
// AC-3: threshold=3, builder tiene 3+ feedbacks → publica OK
// AC-4: pluralización correcta del mensaje
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
const MOCK_COMMUNITY_ID = 'community-uuid-test'
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

function mockAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
}

/**
 * Construye el mock de supabase con threshold, feedbackCount y existingProjectCount.
 * existingProjectCount (default=1): proyectos ya publicados por el builder en la comunidad.
 * Con 0 el gate se bypasea (primer proyecto); con ≥1 aplica el check normal de feedbacks.
 */
function mockWithThresholdAndFeedbacks(
  threshold: number,
  feedbackCount: number,
  existingProjectCount = 1,
) {
  // projects: cadena insert → .insert(...).select(...).single()
  const singleProjectSpy = vi.fn().mockResolvedValue({ data: MOCK_PROJECT, error: null })
  const selectInsertSpy = vi.fn().mockReturnValue({ single: singleProjectSpy })
  const insertSpy = vi.fn().mockReturnValue({ select: selectInsertSpy })

  // projects: cadena count → .select(...).eq(...).eq(...)
  const countEq2 = vi.fn().mockResolvedValue({ count: existingProjectCount, error: null })
  const countEq1 = vi.fn().mockReturnValue({ eq: countEq2 })
  const countSelectSpy = vi.fn().mockReturnValue({ eq: countEq1 })

  supabaseMock.from.mockImplementation((table: string) => {
    if (table === 'communities') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: MOCK_COMMUNITY_ID, reciprocity_threshold: threshold },
          error: null,
        }),
      }
    }
    if (table === 'feedbacks') {
      const gteMock = vi.fn().mockResolvedValue({ count: feedbackCount, error: null })
      const eqMock2 = vi.fn().mockReturnValue({ gte: gteMock })
      const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock1 })
      return { select: selectMock }
    }
    if (table === 'projects') {
      return { insert: insertSpy, select: countSelectSpy }
    }
    return {}
  })

  return { insertSpy }
}

// ---------------------------------------------------------------------------
// AC-1: Gate desactivado cuando reciprocity_threshold = 0
// ---------------------------------------------------------------------------

describe('launchProject (Story 11.5) — AC-1: threshold=0 → siempre pasa', () => {
  beforeEach(mockAuth)
  afterEach(() => vi.clearAllMocks())

  it('publica correctamente cuando threshold=0 aunque el builder tenga 0 feedbacks', async () => {
    mockWithThresholdAndFeedbacks(0, 0)

    const result = await launchProject(VALID_INPUT)

    expect(result.success).toBe(true)
  })

  it('NO consulta la tabla feedbacks cuando threshold=0', async () => {
    const { insertSpy } = mockWithThresholdAndFeedbacks(0, 0)

    await launchProject(VALID_INPUT)

    // El insert del proyecto sí se llama — el gate no bloqueó
    expect(insertSpy).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// AC-2: Gate bloqueante — builder no cumple el umbral
// ---------------------------------------------------------------------------

describe('launchProject (Story 11.5) — AC-2: threshold=3, given=2 → RECIPROCITY_GATE_BLOCKED', () => {
  beforeEach(mockAuth)
  afterEach(() => vi.clearAllMocks())

  it('devuelve success:false con code RECIPROCITY_GATE_BLOCKED', async () => {
    mockWithThresholdAndFeedbacks(3, 2)

    const result = await launchProject(VALID_INPUT)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('RECIPROCITY_GATE_BLOCKED')
    }
  })

  it('devuelve el mensaje correcto con pluralización (falta 1 feedback)', async () => {
    mockWithThresholdAndFeedbacks(3, 2)

    const result = await launchProject(VALID_INPUT)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe(
        'Necesitas dar 1 feedback más antes de publicar. Has dado 2 de 3 requeridos.',
      )
    }
  })

  it('NO inserta el proyecto cuando el gate bloquea', async () => {
    const { insertSpy } = mockWithThresholdAndFeedbacks(3, 2)

    await launchProject(VALID_INPUT)

    expect(insertSpy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// AC-2 + AC-4: Pluralización del mensaje para distintos casos
// ---------------------------------------------------------------------------

describe('launchProject (Story 11.5) — AC-4: pluralización del mensaje', () => {
  beforeEach(mockAuth)
  afterEach(() => vi.clearAllMocks())

  it('threshold=3, given=0 → "Necesitas dar 3 feedbacks más..."', async () => {
    mockWithThresholdAndFeedbacks(3, 0)

    const result = await launchProject(VALID_INPUT)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe(
        'Necesitas dar 3 feedbacks más antes de publicar. Has dado 0 de 3 requeridos.',
      )
    }
  })

  it('threshold=3, given=1 → "Necesitas dar 2 feedbacks más..."', async () => {
    mockWithThresholdAndFeedbacks(3, 1)

    const result = await launchProject(VALID_INPUT)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe(
        'Necesitas dar 2 feedbacks más antes de publicar. Has dado 1 de 3 requeridos.',
      )
    }
  })

  it('threshold=1, given=0 → "Necesitas dar 1 feedback más..." (singular)', async () => {
    mockWithThresholdAndFeedbacks(1, 0)

    const result = await launchProject(VALID_INPUT)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe(
        'Necesitas dar 1 feedback más antes de publicar. Has dado 0 de 1 requeridos.',
      )
    }
  })
})

// ---------------------------------------------------------------------------
// AC-3: Gate superado — builder cumple o supera el umbral
// ---------------------------------------------------------------------------

describe('launchProject (Story 11.5) — AC-3: threshold=3, given≥3 → publica OK', () => {
  beforeEach(mockAuth)
  afterEach(() => vi.clearAllMocks())

  it('publica correctamente cuando given === threshold', async () => {
    mockWithThresholdAndFeedbacks(3, 3)

    const result = await launchProject(VALID_INPUT)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.projectId).toBe(MOCK_PROJECT.id)
    }
  })

  it('publica correctamente cuando given > threshold', async () => {
    mockWithThresholdAndFeedbacks(3, 5)

    const result = await launchProject(VALID_INPUT)

    expect(result.success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Primer proyecto: siempre puede publicarse sin cumplir el gate de reciprocidad
// ---------------------------------------------------------------------------

describe('launchProject — primer proyecto siempre puede publicarse', () => {
  beforeEach(mockAuth)
  afterEach(() => vi.clearAllMocks())

  it('threshold=3, feedbacks=0, existingProjects=0 → publica OK (bypass del gate)', async () => {
    mockWithThresholdAndFeedbacks(3, 0, 0)

    const result = await launchProject(VALID_INPUT)

    expect(result.success).toBe(true)
  })

  it('threshold=3, feedbacks=0, existingProjects=1 → RECIPROCITY_GATE_BLOCKED', async () => {
    mockWithThresholdAndFeedbacks(3, 0, 1)

    const result = await launchProject(VALID_INPUT)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('RECIPROCITY_GATE_BLOCKED')
    }
  })

  it('threshold=5, feedbacks=0, existingProjects=0 → inserta el proyecto', async () => {
    const { insertSpy } = mockWithThresholdAndFeedbacks(5, 0, 0)

    await launchProject(VALID_INPUT)

    expect(insertSpy).toHaveBeenCalled()
  })
})
