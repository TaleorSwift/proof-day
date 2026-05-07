import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeedbackReminderService } from '@/lib/services/feedbackReminder.service'

/**
 * POST /api/cron/feedback-reminder
 *
 * Endpoint invocado por el cron job semanal de Vercel (lunes 9:00 UTC).
 * Detecta proyectos live con pocos feedbacks recientes y envía notificaciones
 * in-app a los builders.
 *
 * Protegido con CRON_SECRET — requiere Authorization: Bearer <CRON_SECRET>.
 * La comparación usa timingSafeEqual para evitar timing attacks (AC-1).
 *
 * Story 11.4 — Epic 11: Calidad del Feedback y Reciprocidad
 */
export async function POST(request: Request): Promise<NextResponse> {
  // AC-1, AC-2 — Verificación del secret con comparación segura ante timing attacks
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const expected = secret ? `Bearer ${secret}` : null

  const isAuthorized =
    expected !== null &&
    authHeader !== null &&
    authHeader.length === expected.length &&
    timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'CRON_UNAUTHORIZED' },
      { status: 401 },
    )
  }

  const supabase = await createClient()
  const service = createFeedbackReminderService(supabase)

  // AC-2, AC-3, AC-4, AC-5, AC-6 — Delegar toda la lógica al service
  const result = await service.processReminders()

  console.error('[cron/feedback-reminder]', result)

  return NextResponse.json(result)
}
