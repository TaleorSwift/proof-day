'use client'

// Story 10.5 — Paso 4 del wizard: campo hipótesis con bloque visual

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

interface Props {
  data: WizardFormData
  onChange: (fields: Partial<WizardFormData>) => void
}

export function WizardStepHypothesis({ data, onChange }: Props) {
  const { hypothesis } = data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Bloque visual de hipótesis — patrón "En Juego" (design-tokens.md) */}
      <div
        data-testid="hypothesis-block"
        style={{
          backgroundColor: 'var(--color-hypothesis-bg)',
          border: '1px solid var(--color-hypothesis-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <Label htmlFor="wizard-hypothesis">
          🚀 Hipótesis a validar
        </Label>
        <Textarea
          id="wizard-hypothesis"
          data-testid="wizard-field-hypothesis"
          placeholder="Si [acción], entonces [resultado]…"
          rows={4}
          value={hypothesis}
          onChange={(e) => onChange({ hypothesis: e.target.value })}
          className="border-0 shadow-none focus:ring-0"
        />
      </div>

      {/* Hint contextual */}
      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          margin: 0,
          lineHeight: 'var(--leading-base)',
        }}
      >
        La hipótesis es opcional — puedes dejarla vacía y añadirla más tarde al editar tu proyecto.
      </p>
    </div>
  )
}
