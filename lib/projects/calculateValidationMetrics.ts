// ---------------------------------------------------------------------------
// Cálculo de señales de validación desde feedbacks SSR
// ---------------------------------------------------------------------------

export interface ValidationMetrics {
  understandPercent: number
  wouldUsePercent: number
}

// KPI: % sobre total esperado. Denominador = feedbackCount. No-respuestas (p1 o p2 = 0) cuentan como "no entiende".
export function calculateValidationMetrics(
  feedbacks: Array<{ scores: unknown }>,
  feedbackCount: number,
): ValidationMetrics {
  if (feedbackCount === 0) {
    return { understandPercent: 0, wouldUsePercent: 0 }
  }

  const understandCount = feedbacks.filter((f) => {
    const s = f.scores as { p1?: number } | null
    return (s?.p1 ?? 0) >= 2
  }).length

  const wouldUseCount = feedbacks.filter((f) => {
    const s = f.scores as { p2?: number } | null
    return s?.p2 === 3
  }).length

  return {
    understandPercent: Math.round((understandCount / feedbackCount) * 100),
    wouldUsePercent: Math.round((wouldUseCount / feedbackCount) * 100),
  }
}
