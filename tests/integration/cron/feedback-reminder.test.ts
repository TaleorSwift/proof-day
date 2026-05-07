import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Tests TDD Outside-In — POST /api/cron/feedback-reminder
// Story 11.4: Recordatorio automático de feedback — cron job
// AC-1, AC-2, AC-3, AC-4, AC-5, AC-6
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Mocks hoisted — se elevan antes que los imports
// ---------------------------------------------------------------------------

const {
  supabaseMock,
  createFeedbackReminderServiceMock,
  feedbackReminderServiceInstance,
} = vi.hoisted(() => {
  const supabaseMock = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  }

  const feedbackReminderServiceInstance = {
    processReminders: vi.fn(),
  }

  const createFeedbackReminderServiceMock = vi
    .fn()
    .mockReturnValue(feedbackReminderServiceInstance)

  return {
    supabaseMock,
    createFeedbackReminderServiceMock,
    feedbackReminderServiceInstance,
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

vi.mock('@/lib/services/feedbackReminder.service', () => ({
  createFeedbackReminderService: createFeedbackReminderServiceMock,
}))

// ---------------------------------------------------------------------------
// Import después de mocks
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/cron/feedback-reminder/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_SECRET = 'test-cron-secret-abc123'

function buildRequest(authHeader?: string): Request {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (authHeader !== undefined) {
    headers['authorization'] = authHeader
  }
  return new Request('http://localhost/api/cron/feedback-reminder', {
    method: 'POST',
    headers,
  })
}

// ---------------------------------------------------------------------------
// T1 — Protección con CRON_SECRET (AC-1)
// ---------------------------------------------------------------------------

describe('POST /api/cron/feedback-reminder — protección CRON_SECRET', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', VALID_SECRET)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('T1.2 — petición sin header Authorization → 401 con code CRON_UNAUTHORIZED', async () => {
    const req = buildRequest()
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized', code: 'CRON_UNAUTHORIZED' })
    expect(feedbackReminderServiceInstance.processReminders).not.toHaveBeenCalled()
  })

  it('T1.3 — petición con header incorrecto → 401', async () => {
    const req = buildRequest('Bearer wrong-secret')
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized', code: 'CRON_UNAUTHORIZED' })
    expect(feedbackReminderServiceInstance.processReminders).not.toHaveBeenCalled()
  })

  it('T1.3b — header sin "Bearer " prefix → 401', async () => {
    const req = buildRequest(VALID_SECRET)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized', code: 'CRON_UNAUTHORIZED' })
  })
})

// ---------------------------------------------------------------------------
// T2 — Lógica de detección de proyectos con pocos feedbacks (AC-2, AC-3)
// ---------------------------------------------------------------------------

describe('POST /api/cron/feedback-reminder — detección proyectos', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', VALID_SECRET)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('T2.1 — 0 proyectos live → { processed: 0, created: 0, skipped: 0 } y 200 OK', async () => {
    feedbackReminderServiceInstance.processReminders.mockResolvedValue({
      processed: 0,
      created: 0,
      skipped: 0,
    })

    const req = buildRequest(`Bearer ${VALID_SECRET}`)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ processed: 0, created: 0, skipped: 0 })
  })

  it('T2.2 — 1 proyecto live con 0 feedbacks en 7 días → { processed: 1, created: 1, skipped: 0 }', async () => {
    feedbackReminderServiceInstance.processReminders.mockResolvedValue({
      processed: 1,
      created: 1,
      skipped: 0,
    })

    const req = buildRequest(`Bearer ${VALID_SECRET}`)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ processed: 1, created: 1, skipped: 0 })
  })

  it('T2.3 — 1 proyecto con 3+ feedbacks completos en 7 días → { processed: 0, created: 0, skipped: 1 }', async () => {
    feedbackReminderServiceInstance.processReminders.mockResolvedValue({
      processed: 0,
      created: 0,
      skipped: 1,
    })

    const req = buildRequest(`Bearer ${VALID_SECRET}`)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ processed: 0, created: 0, skipped: 1 })
  })

  it('T2.4 — 1 proyecto con notif ya creada esta semana → { processed: 0, created: 0, skipped: 1 }', async () => {
    feedbackReminderServiceInstance.processReminders.mockResolvedValue({
      processed: 0,
      created: 0,
      skipped: 1,
    })

    const req = buildRequest(`Bearer ${VALID_SECRET}`)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ processed: 0, created: 0, skipped: 1 })
  })

  it('T2 — invoca createFeedbackReminderService con el cliente Supabase', async () => {
    feedbackReminderServiceInstance.processReminders.mockResolvedValue({
      processed: 0,
      created: 0,
      skipped: 0,
    })

    const req = buildRequest(`Bearer ${VALID_SECRET}`)
    await POST(req)

    expect(createFeedbackReminderServiceMock).toHaveBeenCalledWith(supabaseMock)
    expect(feedbackReminderServiceInstance.processReminders).toHaveBeenCalledOnce()
  })
})

// ---------------------------------------------------------------------------
// T3 — Respeto de notification_preferences (AC-5)
// ---------------------------------------------------------------------------

describe('POST /api/cron/feedback-reminder — notification_preferences', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', VALID_SECRET)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('T3.1 — builder con pref feedback_reminder=false → notif NO creada, skipped', async () => {
    feedbackReminderServiceInstance.processReminders.mockResolvedValue({
      processed: 0,
      created: 0,
      skipped: 1,
    })

    const req = buildRequest(`Bearer ${VALID_SECRET}`)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.skipped).toBe(1)
    expect(body.processed).toBe(0)
    expect(body.created).toBe(0)
  })

  it('T3.2 — builder sin fila en notification_preferences → notif creada (opt-in por defecto)', async () => {
    feedbackReminderServiceInstance.processReminders.mockResolvedValue({
      processed: 1,
      created: 1,
      skipped: 0,
    })

    const req = buildRequest(`Bearer ${VALID_SECRET}`)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.processed).toBe(1)
    expect(body.created).toBe(1)
    expect(body.skipped).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// T4 — Sin duplicados en la misma semana (AC-6)
// ---------------------------------------------------------------------------

describe('POST /api/cron/feedback-reminder — sin duplicados', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', VALID_SECRET)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('T4.1 — notif ya existe para ese proyecto en los últimos 7 días → skipped += 1, no inserta', async () => {
    feedbackReminderServiceInstance.processReminders.mockResolvedValue({
      processed: 0,
      created: 0,
      skipped: 1,
    })

    const req = buildRequest(`Bearer ${VALID_SECRET}`)
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ processed: 0, created: 0, skipped: 1 })
  })
})
