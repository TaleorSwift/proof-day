// Story 12.1 — Tipos para tablas de Epic 12: AI Summaries & Notifications

// ─────────────────────────────────────────────────────────────────
// NotificationType
// ─────────────────────────────────────────────────────────────────

/**
 * Tipo nominal para los tipos de notificación.
 * Se usa string en lugar de enum para extensibilidad sin deploy de schema.
 *
 * Valores conocidos del sistema:
 *   - 'ai_synthesis_ready'    — síntesis IA completada, notifica al Builder (Story 12.3)
 *   - 'budget_alert'          — presupuesto mensual de IA >= 80% del límite (Story 12.7)
 *   - 'new_iteration_ready'   — nueva versión del proyecto publicada, notifica a reviewers (Story 13.3)
 *   - 'feedback_attributed'   — feedback del Reviewer atribuido a una iteración (Story 13.5)
 */
export type NotificationType = string

// ─────────────────────────────────────────────────────────────────
// AISummary
// ─────────────────────────────────────────────────────────────────

/** Dominio (camelCase) — resumen IA de un proyecto */
export interface AISummary {
  id: string
  projectId: string
  content: string
  feedbackCountAtGeneration: number
  model: string
  createdAt: string
  updatedAt: string
}

/** Row tal como lo devuelve Supabase (snake_case) */
export interface AISummaryRow {
  id: string
  project_id: string
  content: string
  feedback_count_at_generation: number
  model: string
  created_at: string
  updated_at: string
}

export function aiSummaryFromRow(row: AISummaryRow): AISummary {
  return {
    id: row.id,
    projectId: row.project_id,
    content: row.content,
    feedbackCountAtGeneration: row.feedback_count_at_generation,
    model: row.model,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ─────────────────────────────────────────────────────────────────
// Notification
// ─────────────────────────────────────────────────────────────────

/** Dominio (camelCase) — notificación para un usuario */
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  payload: Record<string, unknown>
  read: boolean
  createdAt: string
}

/** Row tal como lo devuelve Supabase (snake_case) */
export interface NotificationRow {
  id: string
  user_id: string
  type: string
  payload: Record<string, unknown>
  read: boolean
  created_at: string
}

export function notificationFromRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    payload: row.payload,
    read: row.read,
    createdAt: row.created_at,
  }
}

// ─────────────────────────────────────────────────────────────────
// NotificationPreference
// ─────────────────────────────────────────────────────────────────

/** Dominio (camelCase) — preferencia de notificación por usuario/tipo */
export interface NotificationPreference {
  id: string
  userId: string
  type: NotificationType
  emailEnabled: boolean
}

/** Row tal como lo devuelve Supabase (snake_case) */
export interface NotificationPreferenceRow {
  id: string
  user_id: string
  type: string
  email_enabled: boolean
}

export function notificationPreferenceFromRow(row: NotificationPreferenceRow): NotificationPreference {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    emailEnabled: row.email_enabled,
  }
}

// ─────────────────────────────────────────────────────────────────
// AICostTracking
// ─────────────────────────────────────────────────────────────────

/** Dominio (camelCase) — tracking de costes de IA por mes */
export interface AICostTracking {
  id: string
  month: string
  tokensInput: number
  tokensOutput: number
  estimatedCostUsd: number
  synthesisCount: number
  updatedAt: string
}

/** Row tal como lo devuelve Supabase (snake_case) */
export interface AICostTrackingRow {
  id: string
  month: string
  tokens_input: number
  tokens_output: number
  estimated_cost_usd: string // numeric viene como string desde PostgreSQL
  synthesis_count: number
  updated_at: string
}

export function aiCostTrackingFromRow(row: AICostTrackingRow): AICostTracking {
  return {
    id: row.id,
    month: row.month,
    tokensInput: row.tokens_input,
    tokensOutput: row.tokens_output,
    estimatedCostUsd: parseFloat(row.estimated_cost_usd),
    synthesisCount: row.synthesis_count,
    updatedAt: row.updated_at,
  }
}
