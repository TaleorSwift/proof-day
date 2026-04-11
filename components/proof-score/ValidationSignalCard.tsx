import type { SignalLevel } from '@/components/shared/SignalIndicator'
import { SignalIndicator } from '@/components/shared/SignalIndicator'
import { ProgressBar } from '@/components/shared/ProgressBar'

// ---------------------------------------------------------------------------
// Derivación del nivel semáforo a partir de understandPercent
// ---------------------------------------------------------------------------

function deriveSignalLevel(understandPercent: number): { level: SignalLevel; label: string } {
  if (understandPercent >= 70) return { level: 'promising', label: 'Promising' }
  if (understandPercent >= 40) return { level: 'needs-work', label: 'Needs iteration' }
  return { level: 'weak', label: 'Weak' }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ValidationSignalCardProps {
  understandPercent: number   // % de reviewers que comprenden el problema (p1 >= 2)
  wouldUsePercent: number     // % de reviewers que lo usarían (p2 === 3)
  feedbackCount: number       // total de feedbacks — "Basado en N feedbacks"
}

// ---------------------------------------------------------------------------
// Componente — RSC puro: sin 'use client', sin fetch, sin estado
// ---------------------------------------------------------------------------

export function ValidationSignalCard({
  understandPercent,
  wouldUsePercent,
  feedbackCount,
}: ValidationSignalCardProps) {
  const { level, label } = deriveSignalLevel(understandPercent)
  const hasFeedbacks = feedbackCount > 0

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <SignalIndicator level={level} label={label} />

      {hasFeedbacks ? (
        <>
          <ProgressBar
            label="Comprenden el problema"
            percentage={understandPercent}
          />

          <ProgressBar
            label="Lo usarían"
            percentage={wouldUsePercent}
          />

          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Basado en {feedbackCount} feedbacks
          </p>

          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            Esta señal se actualiza con cada nuevo feedback.
          </p>
        </>
      ) : (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          Aún no hay datos de validación
        </p>
      )}
    </div>
  )
}
