// Story 12.4 — Fixtures para AISummary

import type { AISummary, AISummaryRow } from '@/lib/types/ai'
import { aiSummaryFromRow } from '@/lib/types/ai'
import {
  AI_SUMMARY_PULSE_CHECK,
  AI_SUMMARY_DOC_BRIDGE,
  PROJECT_PULSE_CHECK,
  PROJECT_DOC_BRIDGE,
} from './_ids'

// ── AISummaryRows (snake_case — forma cruda de Supabase) ──────────────────────

const pulseCheckSummaryRow: AISummaryRow = {
  id: AI_SUMMARY_PULSE_CHECK,
  project_id: PROJECT_PULSE_CHECK,
  content:
    'Este proyecto aborda un problema real de validación de ideas de producto.\n\n**Puntos fuertes:**\n- Proceso claro y bien estructurado para recoger feedback\n- UI intuitiva que reduce la fricción del Builder\n- Alta claridad en la definición del problema\n\n**Áreas de mejora:**\n- Falta integración con herramientas existentes de gestión\n- El flujo de onboarding podría simplificarse más\n\n**Recomendación:** Continuar con el MVP y validar con más usuarios.',
  feedback_count_at_generation: 5,
  model: 'claude-sonnet-4-6',
  created_at: '2026-05-06T10:00:00Z',
  updated_at: '2026-05-06T10:00:00Z',
}

const docBridgeSummaryRow: AISummaryRow = {
  id: AI_SUMMARY_DOC_BRIDGE,
  project_id: PROJECT_DOC_BRIDGE,
  content:
    'La propuesta de valor de DocBridge es clara: reducir el tiempo de onboarding automatizando la extracción de conocimiento tácito. Los reviewers coinciden en que el problema es real, aunque algunos dudan de la precisión del ML en conversaciones informales de Slack.',
  feedback_count_at_generation: 3,
  model: 'claude-sonnet-4-6',
  created_at: '2026-05-05T14:30:00Z',
  updated_at: '2026-05-05T14:30:00Z',
}

// ── AISummaries (camelCase — forma interna de la app) ─────────────────────────

export const aiSummaryPulseCheck: AISummary = aiSummaryFromRow(pulseCheckSummaryRow)
export const aiSummaryDocBridge: AISummary = aiSummaryFromRow(docBridgeSummaryRow)

// ── Rows (para tests que trabajan con datos crudos de Supabase) ───────────────

export const aiSummaryPulseCheckRow: AISummaryRow = pulseCheckSummaryRow
export const aiSummaryDocBridgeRow: AISummaryRow = docBridgeSummaryRow
