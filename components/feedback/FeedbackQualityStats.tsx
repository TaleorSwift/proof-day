'use client'

// Story 11.3 — Filtro de completitud del feedback + quality warning

export interface FeedbackQualityStatsProps {
  /** Array de feedbacks con su quality score calculado */
  feedbacks: Array<{ qualityScore: number | null }>
  /** Umbral de calidad del proyecto (default 0.6) */
  qualityThreshold: number
}

/**
 * Muestra las estadísticas de completitud del feedback para el Builder.
 * Indica cuántos feedbacks superan el umbral de calidad y emite un warning
 * si más del 40% de los feedbacks son incompletos.
 *
 * No renderiza nada si no hay feedbacks.
 */
export function FeedbackQualityStats({
  feedbacks,
  qualityThreshold,
}: FeedbackQualityStatsProps) {
  const total = feedbacks.length

  if (total === 0) return null

  const completeCount = feedbacks.filter(
    (f) => f.qualityScore !== null && f.qualityScore >= qualityThreshold
  ).length

  const incompleteCount = total - completeCount
  const incompleteRatio = incompleteCount / total
  const showWarning = incompleteRatio > 0.4

  return (
    <div
      data-testid="feedback-quality-stats"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          margin: 0,
        }}
      >
        {completeCount} feedbacks completos de {total} totales
      </p>

      {showWarning && (
        <div
          data-testid="feedback-quality-warning"
          style={{
            backgroundColor: 'var(--color-needs-bg)',
            color: 'var(--color-needs-text)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-xs)',
            lineHeight: 'var(--leading-sm)',
          }}
        >
          La mayoría de tus feedbacks son breves — considera añadir una pregunta más específica
        </div>
      )}
    </div>
  )
}
