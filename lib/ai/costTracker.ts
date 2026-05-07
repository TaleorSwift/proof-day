// Story 12.2 — Tracking de uso de IA en ai_cost_tracking
// AC5: read-modify-write mensual; UPDATE si fila existe, INSERT si no
// Usa service role Supabase (bypasea RLS)

import { createAdminClient } from '@/lib/supabase/admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Input para registrar el coste de una síntesis */
export interface TrackCostInput {
  /** Reservado para futura segmentación por comunidad — no persiste en v12.2 */
  communityId: string
  tokensInput: number
  tokensOutput: number
  /** Ignorado intencionalmente — Ollama local no tiene coste económico (siempre 0.0) */
  costUsd: number
}

// ---------------------------------------------------------------------------
// getCurrentMonth — función pura auxiliar
// ---------------------------------------------------------------------------

/** Retorna el mes actual en formato YYYY-MM */
function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

// ---------------------------------------------------------------------------
// trackCost — read-modify-write
// ---------------------------------------------------------------------------

/**
 * Registra el uso de tokens en ai_cost_tracking.
 * - Si existe fila del mes actual: UPDATE sumando tokens e incrementando synthesis_count
 * - Si no existe: INSERT con valores iniciales
 * - total_cost_usd siempre 0.0 para Ollama local
 */
export async function trackCost(input: TrackCostInput): Promise<void> {
  const supabase = createAdminClient()
  const month = getCurrentMonth()

  const { data: existing, error: selectError } = await supabase
    .from('ai_cost_tracking')
    .select()
    .eq('month', month)
    .single()

  const isNotFound =
    !existing && selectError?.code === 'PGRST116'

  if (!existing && !isNotFound && selectError) {
    throw new Error(`Error al leer ai_cost_tracking: ${selectError.message}`)
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('ai_cost_tracking')
      .update({
        tokens_input: existing.tokens_input + input.tokensInput,
        tokens_output: existing.tokens_output + input.tokensOutput,
        estimated_cost_usd: 0.0,
        synthesis_count: existing.synthesis_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('month', month)

    if (updateError) {
      throw new Error(`Error al actualizar ai_cost_tracking: ${updateError.message}`)
    }
  } else {
    const { error: insertError } = await supabase
      .from('ai_cost_tracking')
      .insert({
        month,
        tokens_input: input.tokensInput,
        tokens_output: input.tokensOutput,
        estimated_cost_usd: 0.0,
        synthesis_count: 1,
      })

    if (insertError) {
      throw new Error(`Error al insertar ai_cost_tracking: ${insertError.message}`)
    }
  }
}
