import type { ProofScoreLabel } from '@/lib/types/proof-score'

interface ScoreConfig {
  icon: string
  bg: string
  color: string
  description: string
}

const SCORE_CONFIG: Record<ProofScoreLabel, ScoreConfig> = {
  'Promising': {
    icon: '✓',
    bg: '#E8F5EE',
    color: '#2D7A4F',
    description: 'El equipo ve potencial real',
  },
  'Needs iteration': {
    icon: '⟳',
    bg: '#FEF3E2',
    color: '#A05C00',
    description: 'La solución genera dudas — refina antes de escalar',
  },
  'Weak': {
    icon: '✗',
    bg: '#FEE2E2',
    color: '#B91C1C',
    description: 'Señal débil — reconsidera el enfoque',
  },
}

interface ProofScoreBadgeProps {
  label: ProofScoreLabel
  variant?: 'compact' | 'full'
}

export function ProofScoreBadge({ label, variant = 'full' }: ProofScoreBadgeProps) {
  const config = SCORE_CONFIG[label]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Proof Score: ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: variant === 'full' ? 'flex-start' : 'center',
        flexDirection: variant === 'full' ? 'column' : 'row',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) var(--space-4)',
        backgroundColor: config.bg,
        borderRadius: 'var(--radius-lg)',
        width: variant === 'full' ? '100%' : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <span
          style={{
            fontSize: variant === 'full' ? 'var(--text-lg)' : 'var(--text-base)',
            color: config.color,
            fontWeight: 'var(--font-semibold)',
            lineHeight: 1,
          }}
        >
          {config.icon}
        </span>
        <span
          style={{
            fontSize: variant === 'full' ? 'var(--text-base)' : 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: config.color,
          }}
        >
          {label}
        </span>
      </div>

      {variant === 'full' && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: config.color,
            margin: 0,
            opacity: 0.85,
          }}
        >
          {config.description}
        </p>
      )}
    </div>
  )
}
