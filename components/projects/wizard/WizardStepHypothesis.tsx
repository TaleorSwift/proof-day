'use client'

// Story 10.5 — Paso 4 del wizard: campo hipótesis con bloque visual
// Story 13.7 — Integración del botón "Sugerir con IA" + indicador "Generado con IA"

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AISuggestButton } from '@/components/projects/wizard/AISuggestButton'
import { isAIEnabled } from '@/lib/ai/featureFlag'
import { AIGeneratedBadge } from '@/components/projects/wizard/AIGeneratedBadge'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

interface Props {
  data: WizardFormData
  onChange: (fields: Partial<WizardFormData>) => void
}

export function WizardStepHypothesis({ data, onChange }: Props) {
  const { title, problem, solution, hypothesis } = data

  // Story 13.7 — T3: estado de campos rellenados por IA
  const [hypothesisAiGenerated, setHypothesisAiGenerated] = useState(false)

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
        {/* Story 13.7 — T5: label con botón "Sugerir con IA" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Label htmlFor="wizard-hypothesis">
            🚀 Hipótesis a validar
          </Label>
          {isAIEnabled() && (
            <AISuggestButton
              field="hypothesis"
              context={{
                title: title ?? '',
                problem: problem ?? undefined,
                solution: solution ?? undefined,
              }}
              onSuggestion={(text) => {
                onChange({ hypothesis: text })
                setHypothesisAiGenerated(true)
              }}
            />
          )}
          {hypothesisAiGenerated && <AIGeneratedBadge />}
        </div>
        <Textarea
          id="wizard-hypothesis"
          data-testid="wizard-field-hypothesis"
          placeholder="Si [acción], entonces [resultado]…"
          rows={4}
          value={hypothesis}
          onChange={(e) => {
            onChange({ hypothesis: e.target.value })
            // Story 13.7 AC4: desmarcar si el Builder edita manualmente
            if (hypothesisAiGenerated) {
              setHypothesisAiGenerated(false)
            }
          }}
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
