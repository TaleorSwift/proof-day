// Story 13.3 — Tests unitarios de notifyPreviousReviewers
// TDD Outside-In: tests escritos ANTES de la implementación
//
// AC1: no inserta nada si no hay reviewers anteriores
// AC2: inserta notificación por cada reviewer único
// AC3: el Builder es excluido de la lista de destinatarios
// AC4: omite inserciones cuando ya existe notificación duplicada
// AC5: el payload incluye todos los campos requeridos
// AC6: captura errores de BD en consola sin propagar la excepción

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock de createAdminClient — hoisted para disponibilidad en factory
// ---------------------------------------------------------------------------

const { mockAdminFrom, mockAdminClient } = vi.hoisted(() => {
  const mockAdminFrom = vi.fn()
  const mockAdminClient = {
    from: mockAdminFrom,
  }
  return { mockAdminFrom, mockAdminClient }
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}))

// ---------------------------------------------------------------------------
// Import del helper bajo test — DESPUÉS de los mocks
// ---------------------------------------------------------------------------

import { notifyPreviousReviewers } from '@/lib/notifications/notify-previous-reviewers'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PARAMS_BASE = {
  projectId: 'project-uuid-001',
  builderId: 'builder-uuid-001',
  projectSlug: 'mi-proyecto',
  projectTitle: 'Mi Proyecto',
  versionNumber: 2,
  communitySlug: 'startup-madrid',
}

// ---------------------------------------------------------------------------
// Helpers de mocks encadenados
// ---------------------------------------------------------------------------

/** Mock para: from('feedbacks').select('reviewer_id').eq(...).neq(...) */
function mockFeedbacksQuery(rows: Array<{ reviewer_id: string }> | null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        neq: vi.fn().mockResolvedValue({ data: rows, error: null }),
      }),
    }),
  }
}

/** Mock para: from('notifications').select('id').eq(...).eq(...).contains(...).maybeSingle() */
function mockNotificationsCheckQuery(existingData: { id: string } | null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          contains: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: existingData, error: null }),
          }),
        }),
      }),
    }),
  }
}

/** Mock para: from('notifications').insert(...) */
function mockNotificationsInsert(error: unknown = null) {
  return {
    insert: vi.fn().mockResolvedValue({ data: null, error }),
  }
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Suite: sin reviewers anteriores
// ---------------------------------------------------------------------------

describe('notifyPreviousReviewers — sin reviewers anteriores', () => {
  it('no inserta ninguna notificación cuando no hay feedbacks previos', async () => {
    mockAdminFrom.mockReturnValueOnce(mockFeedbacksQuery([]))

    await notifyPreviousReviewers(PARAMS_BASE)

    // Solo se llama a feedbacks, nunca a notifications
    expect(mockAdminFrom).toHaveBeenCalledTimes(1)
    expect(mockAdminFrom).toHaveBeenCalledWith('feedbacks')
  })

  it('no inserta ninguna notificación cuando feedbacks retorna null', async () => {
    mockAdminFrom.mockReturnValueOnce(mockFeedbacksQuery(null))

    await notifyPreviousReviewers(PARAMS_BASE)

    expect(mockAdminFrom).toHaveBeenCalledTimes(1)
    expect(mockAdminFrom).toHaveBeenCalledWith('feedbacks')
  })
})

// ---------------------------------------------------------------------------
// Suite: exclusión del Builder
// ---------------------------------------------------------------------------

describe('notifyPreviousReviewers — exclusión del Builder', () => {
  it('usa neq con el builderId para excluirlo de la consulta de reviewers', async () => {
    const neqMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const eqMock = vi.fn().mockReturnValue({ neq: neqMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockAdminFrom.mockReturnValueOnce({ select: selectMock })

    await notifyPreviousReviewers(PARAMS_BASE)

    expect(eqMock).toHaveBeenCalledWith('project_id', PARAMS_BASE.projectId)
    expect(neqMock).toHaveBeenCalledWith('reviewer_id', PARAMS_BASE.builderId)
  })
})

// ---------------------------------------------------------------------------
// Suite: happy path — 2 reviewers distintos
// ---------------------------------------------------------------------------

describe('notifyPreviousReviewers — happy path con 2 reviewers', () => {
  it('inserta una notificación por cada reviewer único', async () => {
    const reviewer1 = 'reviewer-uuid-001'
    const reviewer2 = 'reviewer-uuid-002'
    const feedbackRows = [
      { reviewer_id: reviewer1 },
      { reviewer_id: reviewer2 },
    ]

    let callCount = 0
    mockAdminFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockFeedbacksQuery(feedbackRows)
      // Cada reviewer: check duplicados (no existe) + insert
      if (callCount % 2 === 0) return mockNotificationsCheckQuery(null)
      return mockNotificationsInsert()
    })

    await notifyPreviousReviewers(PARAMS_BASE)

    // 1 llamada a feedbacks + 2 * (1 check + 1 insert) = 5 llamadas totales
    expect(mockAdminFrom).toHaveBeenCalledTimes(5)
  })

  it('el payload de la notificación incluye todos los campos requeridos', async () => {
    const reviewerId = 'reviewer-uuid-001'

    let callCount = 0
    const insertMockFn = vi.fn().mockResolvedValue({ data: null, error: null })

    mockAdminFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockFeedbacksQuery([{ reviewer_id: reviewerId }])
      if (callCount === 2) return mockNotificationsCheckQuery(null)
      return { insert: insertMockFn }
    })

    await notifyPreviousReviewers(PARAMS_BASE)

    expect(insertMockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: reviewerId,
        type: 'new_iteration_ready',
        read: false,
        payload: expect.objectContaining({
          projectId: PARAMS_BASE.projectId,
          projectSlug: PARAMS_BASE.projectSlug,
          projectTitle: PARAMS_BASE.projectTitle,
          versionNumber: PARAMS_BASE.versionNumber,
          communitySlug: PARAMS_BASE.communitySlug,
        }),
      })
    )
  })
})

// ---------------------------------------------------------------------------
// Suite: deduplicación
// ---------------------------------------------------------------------------

describe('notifyPreviousReviewers — deduplicación', () => {
  it('omite el insert cuando ya existe una notificación duplicada para ese reviewer', async () => {
    const reviewerId = 'reviewer-uuid-001'
    const insertMockFn = vi.fn()

    let callCount = 0
    mockAdminFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockFeedbacksQuery([{ reviewer_id: reviewerId }])
      // Notificación existente — dedup guard activo
      if (callCount === 2) return mockNotificationsCheckQuery({ id: 'existing-notif-id' })
      return { insert: insertMockFn }
    })

    await notifyPreviousReviewers(PARAMS_BASE)

    expect(insertMockFn).not.toHaveBeenCalled()
    // 2 llamadas: feedbacks + check
    expect(mockAdminFrom).toHaveBeenCalledTimes(2)
  })

  it('deduplica reviewer_ids repetidos en feedbacks antes de procesar', async () => {
    const reviewerId = 'reviewer-uuid-001'
    // Mismo reviewer aparece dos veces en feedbacks
    const feedbackRows = [
      { reviewer_id: reviewerId },
      { reviewer_id: reviewerId },
    ]

    const insertMockFn = vi.fn().mockResolvedValue({ data: null, error: null })

    let callCount = 0
    mockAdminFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockFeedbacksQuery(feedbackRows)
      if (callCount === 2) return mockNotificationsCheckQuery(null)
      return { insert: insertMockFn }
    })

    await notifyPreviousReviewers(PARAMS_BASE)

    // Solo un insert — reviewer deduplicado
    expect(insertMockFn).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Suite: manejo de errores silencioso
// ---------------------------------------------------------------------------

describe('notifyPreviousReviewers — manejo de errores', () => {
  it('no propaga errores de BD — los registra en console.error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const dbError = new Error('BD connection failed')

    mockAdminFrom.mockImplementationOnce(() => {
      throw dbError
    })

    // No debe lanzar excepción
    await expect(notifyPreviousReviewers(PARAMS_BASE)).resolves.toBeUndefined()
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('notifyPreviousReviewers'),
      dbError
    )

    consoleSpy.mockRestore()
  })
})
