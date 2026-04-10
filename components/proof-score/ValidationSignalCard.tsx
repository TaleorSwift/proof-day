import type { ProofScoreLabel, ProofScoreResult } from '@/lib/types/proof-score'
import type { SignalLevel } from '@/components/shared/SignalIndicator'
import { SignalIndicator } from '@/components/shared/SignalIndicator'
import { ProgressBar } from '@/components/shared/ProgressBar'

// ---------------------------------------------------------------------------
// Mapa de derivación: ProofScoreLabel → SignalLevel
// ---------------------------------------------------------------------------

const LABEL_TO_LEVEL: Record<ProofScoreLabel, SignalLevel> = {
  Promising: 'promising',
  'Needs iteration': 'needs-work',
  Weak: 'weak',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ValidationSignalCardProps {
  score: ProofScoreResult
}

// ---------------------------------------------------------------------------
// Componente — RSC puro: sin 'use client', sin fetch, sin estado
// ---------------------------------------------------------------------------

export function ValidationSignalCard({ score }: ValidationSignalCardProps) {
  const level = LABEL_TO_LEVEL[score.label]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <SignalIndicator level={level} label={score.label} />

      <ProgressBar
        label="Puntuación media"
        percentage={score.average}
      />

      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          margin: 0,
        }}
      >
        Basado en {score.feedbackCount} respuestas
      </p>
    </div>
  )
}
