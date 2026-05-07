import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

// ---------------------------------------------------------------------------
// Constantes de negocio (Story 11.4)
// ---------------------------------------------------------------------------

/** Mínimo de feedbacks completos (quality_score >= QUALITY_THRESHOLD) en los
 *  últimos DAYS_LOOKBACK días para considerar que un proyecto tiene suficiente
 *  feedback y no necesita recordatorio. */
const MIN_COMPLETE_FEEDBACKS_PER_WEEK = 3

/** Umbral de calidad — feedbacks con quality_score >= este valor cuentan como
 *  "completos" para el cómputo del recordatorio. */
const QUALITY_THRESHOLD = 0.6

/** Ventana de tiempo hacia atrás para contar feedbacks recientes (días). */
const DAYS_LOOKBACK = 7

/** Tipo de notificación. Debe coincidir con el valor almacenado en la BD. */
const NOTIFICATION_TYPE = 'feedback_reminder'

// ---------------------------------------------------------------------------
// Tipos locales
// ---------------------------------------------------------------------------

interface ProjectRow {
  id: string
  slug: string
  title: string
  builder_id: string
}

interface ReminderResult {
  processed: number
  skipped: number
}

// ---------------------------------------------------------------------------
// Factory del service
// ---------------------------------------------------------------------------

/**
 * Crea el service de recordatorio de feedback.
 *
 * Encapsula toda la lógica de:
 * 1. Obtener proyectos live
 * 2. Verificar feedbacks recientes completos
 * 3. Verificar preferencias de notificación
 * 4. Evitar duplicados en la misma semana
 * 5. Insertar notificaciones in-app
 */
export function createFeedbackReminderService(supabase: SupabaseClient) {
  return {
    /**
     * Procesa todos los proyectos live y crea notificaciones de recordatorio
     * para builders con pocos feedbacks recientes.
     *
     * @returns { processed, skipped } — número de notificaciones creadas y proyectos omitidos
     */
    async processReminders(): Promise<ReminderResult> {
      const weekAgo = new Date(
        Date.now() - DAYS_LOOKBACK * 24 * 60 * 60 * 1000,
      ).toISOString()

      // 1. Obtener todos los proyectos en estado 'live'
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, slug, title, builder_id')
        .eq('status', 'live')

      if (projectsError || !projects) {
        return { processed: 0, skipped: 0 }
      }

      let processed = 0
      let skipped = 0

      for (const project of projects as ProjectRow[]) {
        const shouldSkip = await shouldSkipProject(
          supabase,
          project,
          weekAgo,
        )

        if (shouldSkip) {
          skipped++
          continue
        }

        // 5. Insertar notificación in-app (AC-4)
        const feedbackCount = await countRecentCompleteFeeedbacks(
          supabase,
          project.id,
          weekAgo,
        )

        await supabase.from('notifications').insert({
          user_id: project.builder_id,
          type: NOTIFICATION_TYPE,
          payload: {
            projectId: project.id,
            projectSlug: project.slug,
            projectTitle: project.title,
            feedbackCount,
          },
          read: false,
        })

        processed++
      }

      return { processed, skipped }
    },
  }
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Determina si un proyecto debe omitirse para el recordatorio.
 * Retorna true (skip) si:
 *  - El builder tiene ya 3+ feedbacks completos en los últimos 7 días
 *  - El builder ha optado-out de las notificaciones de este tipo
 *  - Ya existe una notificación feedback_reminder para este proyecto esta semana
 */
async function shouldSkipProject(
  supabase: SupabaseClient,
  project: ProjectRow,
  weekAgo: string,
): Promise<boolean> {
  // AC-3 — Comprobar si el proyecto tiene suficientes feedbacks recientes
  const feedbackCount = await countRecentCompleteFeeedbacks(
    supabase,
    project.id,
    weekAgo,
  )

  if (feedbackCount >= MIN_COMPLETE_FEEDBACKS_PER_WEEK) {
    return true
  }

  // AC-5 — Comprobar preferencias de notificación del builder
  const { data: pref } = await supabase
    .from('notification_preferences')
    .select('email_enabled')
    .eq('user_id', project.builder_id)
    .eq('type', NOTIFICATION_TYPE)
    .maybeSingle()

  // Si existe preferencia y está desactivada → skip (opt-out)
  if (pref !== null && pref.email_enabled === false) {
    return true
  }

  // AC-6 — Comprobar si ya existe notificación esta semana para este proyecto
  const { data: existingNotif } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', project.builder_id)
    .eq('type', NOTIFICATION_TYPE)
    .contains('payload', { projectId: project.id })
    .gte('created_at', weekAgo)
    .maybeSingle()

  if (existingNotif !== null) {
    return true
  }

  return false
}

/**
 * Cuenta los feedbacks recientes completos (quality_score >= QUALITY_THRESHOLD)
 * de un proyecto en los últimos DAYS_LOOKBACK días.
 */
async function countRecentCompleteFeeedbacks(
  supabase: SupabaseClient,
  projectId: string,
  since: string,
): Promise<number> {
  const { count } = await supabase
    .from('feedbacks')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .gte('quality_score', QUALITY_THRESHOLD)
    .gte('created_at', since)

  return count ?? 0
}
