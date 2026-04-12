'use client'

interface ChipDefinition {
  label: string
  value: string
}

const FEEDBACK_CHIPS: ChipDefinition[] = [
  { label: 'Claridad del problema', value: 'problem_clarity' },
  { label: 'Disposición de uso', value: 'willingness_to_use' },
  { label: 'Viabilidad técnica', value: 'technical_feasibility' },
  { label: 'Funcionalidades faltantes', value: 'missing_features' },
  { label: 'Ajuste de mercado', value: 'market_fit' },
  { label: 'Problemas de UX', value: 'ux_concerns' },
]

interface Props {
  value: string[]
  onChange: (topics: string[]) => void
}

export function FeedbackTopicChips({ value, onChange }: Props) {
  function toggle(chipValue: string) {
    if (value.includes(chipValue)) {
      onChange(value.filter((v) => v !== chipValue))
    } else {
      onChange([...value, chipValue])
    }
  }

  return (
    <div
      data-testid="modal-feedback-chips"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
      }}
    >
      {FEEDBACK_CHIPS.map((chip) => {
        const isActive = value.includes(chip.value)
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => toggle(chip.value)}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              border: isActive
                ? 'none'
                : '1px solid var(--color-border)',
              background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
              color: isActive ? 'white' : 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
