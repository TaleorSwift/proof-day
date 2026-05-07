'use client'

// Story 13.7 — Indicador "Generado con IA" — AC4
// Componente compartido extraído de WizardStepDescription y WizardStepHypothesis

export function AIGeneratedBadge() {
  return (
    <span
      data-testid="ai-generated-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)',
        fontStyle: 'italic',
      }}
    >
      <span aria-hidden="true">✦</span> Generado con IA
    </span>
  )
}
