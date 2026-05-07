// Story 13.5 — Tests unitarios de notifyFeedbackAttributed
// TDD Outside-In: tests escritos ANTES de la implementación
//
// AC1: inserta notificación con payload completo para el reviewer
// AC2: usa createAdminClient (service role), no cookie client
// AC3: read: false en la inserción
// AC4: captura errores de BD en console.error sin propagar la excepción

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

import { notifyFeedbackAttributed } from '@/lib/notifications/notify-feedback-attributed'
import { createAdminClient } from '@/lib/supabase/admin'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PARAMS_BASE = {
  reviewerId: 'reviewer-uuid-001',
  projectId: 'project-uuid-001',
  projectSlug: 'mi-proyecto',
  projectTitle: 'Mi Proyecto',
  versionNumber: 2,
  communitySlug: 'startup-madrid',
}

// ---------------------------------------------------------------------------
// Helpers de mocks encadenados
// ---------------------------------------------------------------------------

/** Mock para: from('notifications').insert(...) → resuelve con error o null */
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
// Suite: happy path — inserción correcta
// ---------------------------------------------------------------------------

describe('notifyFeedbackAttributed — happy path', () => {
  it('llama a createAdminClient() para usar service role', async () => {
    mockAdminFrom.mockReturnValueOnce(mockNotificationsInsert())

    await notifyFeedbackAttributed(PARAMS_BASE)

    expect(createAdminClient).toHaveBeenCalledTimes(1)
  })

  it('inserta en la tabla notifications con el payload correcto', async () => {
    const insertMockFn = vi.fn().mockResolvedValue({ data: null, error: null })
    mockAdminFrom.mockReturnValueOnce({ insert: insertMockFn })

    await notifyFeedbackAttributed(PARAMS_BASE)

    expect(mockAdminFrom).toHaveBeenCalledWith('notifications')
    expect(insertMockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: PARAMS_BASE.reviewerId,
        type: 'feedback_attributed',
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

  it('establece read: false en la inserción', async () => {
    const insertMockFn = vi.fn().mockResolvedValue({ data: null, error: null })
    mockAdminFrom.mockReturnValueOnce({ insert: insertMockFn })

    await notifyFeedbackAttributed(PARAMS_BASE)

    expect(insertMockFn).toHaveBeenCalledWith(
      expect.objectContaining({ read: false })
    )
  })

  it('incluye reviewerId como user_id en la inserción', async () => {
    const insertMockFn = vi.fn().mockResolvedValue({ data: null, error: null })
    mockAdminFrom.mockReturnValueOnce({ insert: insertMockFn })

    await notifyFeedbackAttributed(PARAMS_BASE)

    expect(insertMockFn).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'reviewer-uuid-001' })
    )
  })

  it('establece type: "feedback_attributed" en la inserción', async () => {
    const insertMockFn = vi.fn().mockResolvedValue({ data: null, error: null })
    mockAdminFrom.mockReturnValueOnce({ insert: insertMockFn })

    await notifyFeedbackAttributed(PARAMS_BASE)

    expect(insertMockFn).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'feedback_attributed' })
    )
  })
})

// ---------------------------------------------------------------------------
// Suite: manejo de errores silencioso
// ---------------------------------------------------------------------------

describe('notifyFeedbackAttributed — manejo de errores', () => {
  it('registra error de BD en console.error sin propagar la excepción', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const dbError = { message: 'insert failed', code: '23505' }

    const insertMockFn = vi.fn().mockResolvedValue({ data: null, error: dbError })
    mockAdminFrom.mockReturnValueOnce({ insert: insertMockFn })

    // No debe lanzar excepción
    await expect(notifyFeedbackAttributed(PARAMS_BASE)).resolves.toBeUndefined()
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('notifyFeedbackAttributed'),
      dbError
    )

    consoleSpy.mockRestore()
  })

  it('no propaga excepciones lanzadas por createAdminClient', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const runtimeError = new Error('Admin client unavailable')

    mockAdminFrom.mockImplementationOnce(() => {
      throw runtimeError
    })

    await expect(notifyFeedbackAttributed(PARAMS_BASE)).resolves.toBeUndefined()
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('notifyFeedbackAttributed'),
      runtimeError
    )

    consoleSpy.mockRestore()
  })
})
