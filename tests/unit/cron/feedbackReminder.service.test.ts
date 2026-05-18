import { describe, it, expect, vi } from 'vitest'
import { createFeedbackReminderService } from '@/lib/services/feedbackReminder.service'

// ---------------------------------------------------------------------------
// Tests unitarios del service feedbackReminder.service.ts
// Story 11.4 — AC-3, AC-4, AC-5, AC-6
// TDD Outside-In: T2.5, T3.3, T4.2
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Estrategia de mock: factory de supabase con comportamiento por tabla
// ---------------------------------------------------------------------------

/**
 * Crea un mock de supabase que devuelve respuestas distintas según la tabla.
 *
 * @param options.liveProjects     Lista de proyectos live devueltos por 'projects'
 * @param options.feedbackCount    Count de feedbacks recientes completos
 * @param options.notifPref        Preferencia de notificación del builder (null = no existe)
 * @param options.existingNotif    Si existe notificación reciente (null = no existe)
 */
function buildSuiteSupabase(options: {
  liveProjects?: Array<{
    id: string
    slug: string
    title: string
    builder_id: string
  }>
  feedbackCount?: number
  notifPref?: { email_enabled: boolean } | null
  existingNotif?: { id: string } | null
}) {
  const {
    liveProjects = [],
    feedbackCount = 0,
    notifPref = null,
    existingNotif = null,
  } = options

  const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })

  const fromMock = vi.fn().mockImplementation((table: string) => {
    if (table === 'projects') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi
          .fn()
          .mockResolvedValue({ data: liveProjects, error: null }),
      }
    }

    if (table === 'feedbacks') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        // Resolve con el count esperado
        then: undefined,
        // Hacemos que la cadena se resuelva con el count
        // La cadena real termina con .gte().gte() → necesitamos que el
        // segundo .gte() resuelva el count
        __resolveWith: { count: feedbackCount, error: null },
      }
    }

    if (table === 'notification_preferences') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: notifPref, error: null }),
      }
    }

    if (table === 'notifications') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        maybeSingle: vi
          .fn()
          .mockResolvedValue({ data: existingNotif, error: null }),
        insert: insertMock,
      }
    }

    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: insertMock,
    }
  })

  return { from: fromMock, insertMock }
}

// ---------------------------------------------------------------------------
// Tests: sin proyectos live
// ---------------------------------------------------------------------------

describe('feedbackReminder.service — sin proyectos live', () => {
  it('T2.1 — 0 proyectos → { processed: 0, created: 0, skipped: 0 }', async () => {
    const { from } = buildSuiteSupabase({ liveProjects: [] })
    const service = createFeedbackReminderService({ from } as never)

    const result = await service.processReminders()

    expect(result).toEqual({ processed: 0, created: 0, skipped: 0 })
  })

  it('T2.1b — error al obtener proyectos → { processed: 0, created: 0, skipped: 0 }', async () => {
    const from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    })
    const service = createFeedbackReminderService({ from } as never)

    const result = await service.processReminders()

    expect(result).toEqual({ processed: 0, created: 0, skipped: 0 })
  })
})

// ---------------------------------------------------------------------------
// Tests: proyectos con feedbacks recientes suficientes → skip (AC-3)
// ---------------------------------------------------------------------------

describe('feedbackReminder.service — proyectos con suficientes feedbacks recientes (AC-3)', () => {
  it('T2.3 — 1 proyecto con 3+ feedbacks completos → { processed: 0, created: 0, skipped: 1 }', async () => {
    const project = {
      id: 'proj-001',
      slug: 'mi-proyecto',
      title: 'Mi Proyecto',
      builder_id: 'user-001',
    }

    // Mock completo con cadenas correctas
    const feedbacksChainInstance = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    }

    // La cadena termina con el segundo .gte() — necesita resolver con count
    let gteCallCount = 0
    feedbacksChainInstance.gte.mockImplementation(() => {
      gteCallCount++
      if (gteCallCount >= 2) {
        // Segunda llamada a .gte() — devuelve el resultado final
        return Promise.resolve({ count: 3, error: null })
      }
      return feedbacksChainInstance
    })

    const from = vi.fn().mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [project], error: null }),
        }
      }
      if (table === 'feedbacks') {
        return feedbacksChainInstance
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        insert: vi.fn().mockResolvedValue({ data: null }),
      }
    })

    const service = createFeedbackReminderService({ from } as never)
    const result = await service.processReminders()

    expect(result).toEqual({ processed: 0, created: 0, skipped: 1 })
  })
})

// ---------------------------------------------------------------------------
// Tests: opt-out de preferencias → skip (AC-5)
// ---------------------------------------------------------------------------

describe('feedbackReminder.service — notification_preferences opt-out (AC-5)', () => {
  it('T3.1 — builder con email_enabled=false → skip', async () => {
    const project = {
      id: 'proj-002',
      slug: 'proyecto-dos',
      title: 'Proyecto Dos',
      builder_id: 'user-002',
    }

    const feedbacksChainInstance = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    }

    let gteCallCount = 0
    feedbacksChainInstance.gte.mockImplementation(() => {
      gteCallCount++
      if (gteCallCount >= 2) {
        return Promise.resolve({ count: 0, error: null })
      }
      return feedbacksChainInstance
    })

    const notifPrefsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: { email_enabled: false }, error: null }),
    }

    const from = vi.fn().mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [project], error: null }),
        }
      }
      if (table === 'feedbacks') {
        return feedbacksChainInstance
      }
      if (table === 'notification_preferences') {
        return notifPrefsChain
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        insert: vi.fn().mockResolvedValue({ data: null }),
      }
    })

    const service = createFeedbackReminderService({ from } as never)
    const result = await service.processReminders()

    expect(result).toEqual({ processed: 0, created: 0, skipped: 1 })
  })

  it('T3.2 — sin fila en notification_preferences → opt-in → notif creada', async () => {
    const project = {
      id: 'proj-003',
      slug: 'proyecto-tres',
      title: 'Proyecto Tres',
      builder_id: 'user-003',
    }

    const feedbacksChainInstance = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    }

    let gteCallCount = 0
    feedbacksChainInstance.gte.mockImplementation(() => {
      gteCallCount++
      if (gteCallCount >= 2) {
        return Promise.resolve({ count: 0, error: null })
      }
      return feedbacksChainInstance
    })

    const notifPrefsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }

    // Segunda llamada a feedbacksChainInstance (para el insert del processed)
    const feedbacksChainInstance2 = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    }

    let gteCallCount2 = 0
    feedbacksChainInstance2.gte.mockImplementation(() => {
      gteCallCount2++
      if (gteCallCount2 >= 2) {
        return Promise.resolve({ count: 0, error: null })
      }
      return feedbacksChainInstance2
    })

    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })

    const notificationsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: insertMock,
    }

    let feedbacksCallCount = 0
    const from = vi.fn().mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [project], error: null }),
        }
      }
      if (table === 'feedbacks') {
        feedbacksCallCount++
        if (feedbacksCallCount === 1) return feedbacksChainInstance
        return feedbacksChainInstance2
      }
      if (table === 'notification_preferences') {
        return notifPrefsChain
      }
      if (table === 'notifications') {
        return notificationsChain
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        insert: insertMock,
      }
    })

    const service = createFeedbackReminderService({ from } as never)
    const result = await service.processReminders()

    expect(result).toEqual({ processed: 1, created: 1, skipped: 0 })
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: project.builder_id,
        type: 'feedback_reminder',
        read: false,
        payload: expect.objectContaining({
          projectId: project.id,
          projectSlug: project.slug,
          projectTitle: project.title,
        }),
      }),
    )
  })
})

// ---------------------------------------------------------------------------
// Tests: sin duplicados en la misma semana (AC-6)
// ---------------------------------------------------------------------------

describe('feedbackReminder.service — sin duplicados (AC-6)', () => {
  it('T4.1 — notif ya existe en los últimos 7 días → skipped += 1', async () => {
    const project = {
      id: 'proj-004',
      slug: 'proyecto-cuatro',
      title: 'Proyecto Cuatro',
      builder_id: 'user-004',
    }

    const feedbacksChainInstance = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    }

    let gteCallCount = 0
    feedbacksChainInstance.gte.mockImplementation(() => {
      gteCallCount++
      if (gteCallCount >= 2) {
        return Promise.resolve({ count: 0, error: null })
      }
      return feedbacksChainInstance
    })

    const notifPrefsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }

    const notificationsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      // Retorna notificación existente → duplicado
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: { id: 'notif-existing-001' }, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }

    const from = vi.fn().mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [project], error: null }),
        }
      }
      if (table === 'feedbacks') {
        return feedbacksChainInstance
      }
      if (table === 'notification_preferences') {
        return notifPrefsChain
      }
      if (table === 'notifications') {
        return notificationsChain
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      }
    })

    const service = createFeedbackReminderService({ from } as never)
    const result = await service.processReminders()

    expect(result).toEqual({ processed: 0, created: 0, skipped: 1 })
    expect(notificationsChain.insert).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: payload de la notificación (AC-4)
// ---------------------------------------------------------------------------

describe('feedbackReminder.service — payload notificación (AC-4)', () => {
  it('T4 — payload incluye projectId, projectSlug, projectTitle, feedbackCount', async () => {
    const project = {
      id: 'proj-005',
      slug: 'proyecto-payload',
      title: 'Proyecto Payload Test',
      builder_id: 'user-005',
    }

    const feedbacksChainInstance = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    }

    let gteCallCount = 0
    feedbacksChainInstance.gte.mockImplementation(() => {
      gteCallCount++
      if (gteCallCount >= 2) {
        // 1 feedback completo (por debajo del umbral de 3)
        return Promise.resolve({ count: 1, error: null })
      }
      return feedbacksChainInstance
    })

    const feedbacksChainInstance2 = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    }

    let gteCallCount2 = 0
    feedbacksChainInstance2.gte.mockImplementation(() => {
      gteCallCount2++
      if (gteCallCount2 >= 2) {
        return Promise.resolve({ count: 1, error: null })
      }
      return feedbacksChainInstance2
    })

    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })

    const notificationsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: insertMock,
    }

    let feedbacksCallCount = 0
    const from = vi.fn().mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [project], error: null }),
        }
      }
      if (table === 'feedbacks') {
        feedbacksCallCount++
        if (feedbacksCallCount === 1) return feedbacksChainInstance
        return feedbacksChainInstance2
      }
      if (table === 'notification_preferences') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }
      if (table === 'notifications') {
        return notificationsChain
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      }
    })

    const service = createFeedbackReminderService({ from } as never)
    await service.processReminders()

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: project.builder_id,
        type: 'feedback_reminder',
        read: false,
        payload: {
          projectId: project.id,
          projectSlug: project.slug,
          projectTitle: project.title,
          feedbackCount: 1,
        },
      }),
    )
  })
})
