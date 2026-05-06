/**
 * Unit tests — lib/types/ai.ts (Story 12.1)
 * TDD Outside-In: escritos antes de la implementación final
 *
 * Verifica:
 *   - Mapeo correcto de AISummaryRow → AISummary (aiSummaryFromRow)
 *   - Mapeo correcto de NotificationRow → Notification (notificationFromRow)
 *   - Mapeo correcto de NotificationPreferenceRow → NotificationPreference (notificationPreferenceFromRow)
 *   - Mapeo correcto de AICostTrackingRow → AICostTracking (aiCostTrackingFromRow)
 *   - Tipos nominales (NotificationType es string)
 *   - Conversión de numeric string → number en estimatedCostUsd
 */

import { describe, it, expect } from 'vitest'
import {
  aiSummaryFromRow,
  notificationFromRow,
  notificationPreferenceFromRow,
  aiCostTrackingFromRow,
} from '@/lib/types/ai'
import type {
  AISummaryRow,
  NotificationRow,
  NotificationPreferenceRow,
  AICostTrackingRow,
} from '@/lib/types/ai'

// ─────────────────────────────────────────────
// aiSummaryFromRow
// ─────────────────────────────────────────────

const BASE_AI_SUMMARY_ROW: AISummaryRow = {
  id: 'sum-001',
  project_id: 'proj-001',
  content: 'Este proyecto muestra una señal prometedora en el mercado B2B.',
  feedback_count_at_generation: 5,
  model: 'gpt-4o-mini',
  created_at: '2026-05-01T10:00:00Z',
  updated_at: '2026-05-01T10:00:00Z',
}

describe('aiSummaryFromRow — Story 12.1', () => {
  it('mapea id correctamente', () => {
    const summary = aiSummaryFromRow(BASE_AI_SUMMARY_ROW)
    expect(summary.id).toBe('sum-001')
  })

  it('mapea project_id → projectId (camelCase)', () => {
    const summary = aiSummaryFromRow(BASE_AI_SUMMARY_ROW)
    expect(summary.projectId).toBe('proj-001')
  })

  it('mapea content correctamente', () => {
    const summary = aiSummaryFromRow(BASE_AI_SUMMARY_ROW)
    expect(summary.content).toBe('Este proyecto muestra una señal prometedora en el mercado B2B.')
  })

  it('mapea feedback_count_at_generation → feedbackCountAtGeneration (camelCase)', () => {
    const summary = aiSummaryFromRow(BASE_AI_SUMMARY_ROW)
    expect(summary.feedbackCountAtGeneration).toBe(5)
  })

  it('mapea model correctamente', () => {
    const summary = aiSummaryFromRow(BASE_AI_SUMMARY_ROW)
    expect(summary.model).toBe('gpt-4o-mini')
  })

  it('mapea created_at → createdAt (camelCase)', () => {
    const summary = aiSummaryFromRow(BASE_AI_SUMMARY_ROW)
    expect(summary.createdAt).toBe('2026-05-01T10:00:00Z')
  })

  it('mapea updated_at → updatedAt (camelCase)', () => {
    const summary = aiSummaryFromRow(BASE_AI_SUMMARY_ROW)
    expect(summary.updatedAt).toBe('2026-05-01T10:00:00Z')
  })

  it('mapea feedback_count_at_generation = 0 correctamente', () => {
    const summary = aiSummaryFromRow({ ...BASE_AI_SUMMARY_ROW, feedback_count_at_generation: 0 })
    expect(summary.feedbackCountAtGeneration).toBe(0)
  })

  it('preserva contenido con caracteres especiales y saltos de línea', () => {
    const content = 'Línea 1\nLínea 2\n\nPárrafo con ñ y acentós.'
    const summary = aiSummaryFromRow({ ...BASE_AI_SUMMARY_ROW, content })
    expect(summary.content).toBe(content)
  })
})

// ─────────────────────────────────────────────
// notificationFromRow
// ─────────────────────────────────────────────

const BASE_NOTIFICATION_ROW: NotificationRow = {
  id: 'notif-001',
  user_id: 'user-abc',
  type: 'ai_summary_ready',
  payload: { projectId: 'proj-001', projectTitle: 'Mi Idea' },
  read: false,
  created_at: '2026-05-02T08:30:00Z',
}

describe('notificationFromRow — Story 12.1', () => {
  it('mapea id correctamente', () => {
    const notif = notificationFromRow(BASE_NOTIFICATION_ROW)
    expect(notif.id).toBe('notif-001')
  })

  it('mapea user_id → userId (camelCase)', () => {
    const notif = notificationFromRow(BASE_NOTIFICATION_ROW)
    expect(notif.userId).toBe('user-abc')
  })

  it('mapea type correctamente', () => {
    const notif = notificationFromRow(BASE_NOTIFICATION_ROW)
    expect(notif.type).toBe('ai_summary_ready')
  })

  it('mapea payload (JSONB) correctamente con sus campos', () => {
    const notif = notificationFromRow(BASE_NOTIFICATION_ROW)
    expect(notif.payload).toEqual({ projectId: 'proj-001', projectTitle: 'Mi Idea' })
  })

  it('mapea read = false correctamente', () => {
    const notif = notificationFromRow(BASE_NOTIFICATION_ROW)
    expect(notif.read).toBe(false)
  })

  it('mapea read = true correctamente', () => {
    const notif = notificationFromRow({ ...BASE_NOTIFICATION_ROW, read: true })
    expect(notif.read).toBe(true)
  })

  it('mapea created_at → createdAt (camelCase)', () => {
    const notif = notificationFromRow(BASE_NOTIFICATION_ROW)
    expect(notif.createdAt).toBe('2026-05-02T08:30:00Z')
  })

  it('mapea payload vacío {} correctamente', () => {
    const notif = notificationFromRow({ ...BASE_NOTIFICATION_ROW, payload: {} })
    expect(notif.payload).toEqual({})
  })

  it('mapea payload con datos anidados correctamente', () => {
    const payload = { meta: { level: 'info' }, ids: [1, 2, 3] }
    const notif = notificationFromRow({ ...BASE_NOTIFICATION_ROW, payload })
    expect(notif.payload).toEqual(payload)
  })
})

// ─────────────────────────────────────────────
// notificationPreferenceFromRow
// ─────────────────────────────────────────────

const BASE_PREFERENCE_ROW: NotificationPreferenceRow = {
  id: 'pref-001',
  user_id: 'user-abc',
  type: 'ai_summary_ready',
  email_enabled: true,
}

describe('notificationPreferenceFromRow — Story 12.1', () => {
  it('mapea id correctamente', () => {
    const pref = notificationPreferenceFromRow(BASE_PREFERENCE_ROW)
    expect(pref.id).toBe('pref-001')
  })

  it('mapea user_id → userId (camelCase)', () => {
    const pref = notificationPreferenceFromRow(BASE_PREFERENCE_ROW)
    expect(pref.userId).toBe('user-abc')
  })

  it('mapea type correctamente', () => {
    const pref = notificationPreferenceFromRow(BASE_PREFERENCE_ROW)
    expect(pref.type).toBe('ai_summary_ready')
  })

  it('mapea email_enabled = true → emailEnabled (camelCase)', () => {
    const pref = notificationPreferenceFromRow(BASE_PREFERENCE_ROW)
    expect(pref.emailEnabled).toBe(true)
  })

  it('mapea email_enabled = false → emailEnabled = false', () => {
    const pref = notificationPreferenceFromRow({ ...BASE_PREFERENCE_ROW, email_enabled: false })
    expect(pref.emailEnabled).toBe(false)
  })
})

// ─────────────────────────────────────────────
// aiCostTrackingFromRow
// ─────────────────────────────────────────────

const BASE_COST_TRACKING_ROW: AICostTrackingRow = {
  id: 'cost-001',
  month: '2026-05',
  tokens_input: 150000,
  tokens_output: 45000,
  estimated_cost_usd: '0.027500',
  synthesis_count: 8,
  updated_at: '2026-05-06T12:00:00Z',
}

describe('aiCostTrackingFromRow — Story 12.1', () => {
  it('mapea id correctamente', () => {
    const cost = aiCostTrackingFromRow(BASE_COST_TRACKING_ROW)
    expect(cost.id).toBe('cost-001')
  })

  it('mapea month correctamente', () => {
    const cost = aiCostTrackingFromRow(BASE_COST_TRACKING_ROW)
    expect(cost.month).toBe('2026-05')
  })

  it('mapea tokens_input → tokensInput (camelCase)', () => {
    const cost = aiCostTrackingFromRow(BASE_COST_TRACKING_ROW)
    expect(cost.tokensInput).toBe(150000)
  })

  it('mapea tokens_output → tokensOutput (camelCase)', () => {
    const cost = aiCostTrackingFromRow(BASE_COST_TRACKING_ROW)
    expect(cost.tokensOutput).toBe(45000)
  })

  it('convierte estimated_cost_usd (string) → estimatedCostUsd (number)', () => {
    const cost = aiCostTrackingFromRow(BASE_COST_TRACKING_ROW)
    expect(typeof cost.estimatedCostUsd).toBe('number')
    expect(cost.estimatedCostUsd).toBeCloseTo(0.0275, 6)
  })

  it('mapea synthesis_count → synthesisCount (camelCase)', () => {
    const cost = aiCostTrackingFromRow(BASE_COST_TRACKING_ROW)
    expect(cost.synthesisCount).toBe(8)
  })

  it('mapea updated_at → updatedAt (camelCase)', () => {
    const cost = aiCostTrackingFromRow(BASE_COST_TRACKING_ROW)
    expect(cost.updatedAt).toBe('2026-05-06T12:00:00Z')
  })

  it('mapea synthesis_count = 0 correctamente', () => {
    const cost = aiCostTrackingFromRow({ ...BASE_COST_TRACKING_ROW, synthesis_count: 0 })
    expect(cost.synthesisCount).toBe(0)
  })

  it('convierte estimated_cost_usd "0.000000" correctamente a 0', () => {
    const cost = aiCostTrackingFromRow({ ...BASE_COST_TRACKING_ROW, estimated_cost_usd: '0.000000' })
    expect(cost.estimatedCostUsd).toBe(0)
  })

  it('mapea tokens grandes (bigint) correctamente', () => {
    const cost = aiCostTrackingFromRow({
      ...BASE_COST_TRACKING_ROW,
      tokens_input: 10_000_000,
      tokens_output: 3_500_000,
    })
    expect(cost.tokensInput).toBe(10_000_000)
    expect(cost.tokensOutput).toBe(3_500_000)
  })
})
