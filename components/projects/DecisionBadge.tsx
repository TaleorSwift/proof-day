import type { ProjectDecision } from '@/lib/types/projects'

const DECISION_CONFIG: Record<ProjectDecision, { icon: string; label: string; description: string }> = {
  iterate: { icon: '↺', label: 'Iterar', description: 'Refinando la propuesta' },
  scale:   { icon: '↑', label: 'Escalar', description: 'Llevando la idea adelante' },
  abandon: { icon: '✗', label: 'Abandonar', description: 'Desarrollo detenido' },
}

export interface DecisionBadgeProps {
  decision: ProjectDecision
  compact?: boolean
}

export function DecisionBadge({ decision, compact = false }: DecisionBadgeProps) {
  const config = DECISION_CONFIG[decision]

  if (compact) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '2px var(--space-2)' }}>
        <span aria-hidden="true">{config.icon}</span>
        {config.label}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
      <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-lg)', flexShrink: 0 }} aria-hidden="true">
        {config.icon}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-sm)' }}>
          {config.label}
        </p>
        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-xs)' }}>
          {config.description}
        </p>
      </div>
    </div>
  )
}
