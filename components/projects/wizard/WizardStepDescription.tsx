'use client'

// Story 10.3 — Paso 2 del wizard: título, tagline, problema, solución con ejemplos contextuales
// Story 13.7 — Integración del botón "Sugerir con IA" + indicador "Generado con IA"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AISuggestButton } from '@/components/projects/wizard/AISuggestButton'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

const DEFAULT_PROBLEM_PLACEHOLDER = '¿Qué problema resuelves?'
const DEFAULT_SOLUTION_PLACEHOLDER = '¿Cuál es tu solución propuesta?'

interface Props {
  data: WizardFormData
  onChange: (fields: Partial<WizardFormData>) => void
}

// ---------------------------------------------------------------------------
// Indicador "Generado con IA" — Story 13.7 AC4
// ---------------------------------------------------------------------------

function AIGeneratedBadge() {
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

export function WizardStepDescription({ data, onChange }: Props) {
  const { selectedTemplate, title, tagline, problem, solution } = data

  // Story 13.7 — T3: estado de campos rellenados por IA
  const [aiGeneratedFields, setAiGeneratedFields] = useState<Set<string>>(new Set())

  function markAsAiGenerated(field: string) {
    setAiGeneratedFields((prev) => new Set([...prev, field]))
  }

  function unmarkAsAiGenerated(field: string) {
    setAiGeneratedFields((prev) => {
      const next = new Set(prev)
      next.delete(field)
      return next
    })
  }

  // Story 10.3 — T3.2/T3.4: placeholders dinámicos según template
  const problemPlaceholder =
    selectedTemplate?.descriptionStructure.problem.placeholder ?? DEFAULT_PROBLEM_PLACEHOLDER
  const solutionPlaceholder =
    selectedTemplate?.descriptionStructure.solution.placeholder ?? DEFAULT_SOLUTION_PLACEHOLDER

  // Contexto compartido para los botones de IA
  const aiContext = {
    title,
    problem,
    solution,
    templateId: selectedTemplate?.id ?? undefined,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Nombre del proyecto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="wizard-title">
          Nombre del proyecto{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
        </Label>
        <Input
          id="wizard-title"
          data-testid="wizard-field-title"
          placeholder="ej. Pulse Check"
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      {/* Tagline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="wizard-tagline">
          Tagline{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
        </Label>
        <Input
          id="wizard-tagline"
          data-testid="wizard-field-tagline"
          placeholder="Una frase que capture tu idea"
          value={tagline}
          onChange={(e) => onChange({ tagline: e.target.value })}
        />
      </div>

      {/* Problema */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {/* Story 13.7 — T4: label con botón "Sugerir con IA" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Label htmlFor="wizard-problem">
            Problema que resuelve{' '}
            <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
          </Label>
          <AISuggestButton
            field="problem"
            context={aiContext}
            onSuggestion={(text) => {
              onChange({ problem: text })
              markAsAiGenerated('problem')
            }}
          />
          {aiGeneratedFields.has('problem') && <AIGeneratedBadge />}
        </div>
        <Textarea
          id="wizard-problem"
          data-testid="wizard-field-problem"
          placeholder={problemPlaceholder}
          rows={3}
          value={problem}
          onChange={(e) => {
            onChange({ problem: e.target.value })
            // Story 13.7 AC4: desmarcar si el Builder edita manualmente
            if (aiGeneratedFields.has('problem')) {
              unmarkAsAiGenerated('problem')
            }
          }}
        />
        {/* Story 10.3 — T3.2: ejemplo contextual bajo el textarea de problema */}
        {selectedTemplate && (
          <p
            data-testid="wizard-hint-problem"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              margin: '0',
              fontStyle: 'italic',
            }}
          >
            Ejemplo: {selectedTemplate.descriptionStructure.problem.example}
          </p>
        )}
      </div>

      {/* Solución */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {/* Story 13.7 — T4: label con botón "Sugerir con IA" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Label htmlFor="wizard-solution">
            Solución propuesta{' '}
            <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
          </Label>
          <AISuggestButton
            field="solution"
            context={aiContext}
            onSuggestion={(text) => {
              onChange({ solution: text })
              markAsAiGenerated('solution')
            }}
          />
          {aiGeneratedFields.has('solution') && <AIGeneratedBadge />}
        </div>
        <Textarea
          id="wizard-solution"
          data-testid="wizard-field-solution"
          placeholder={solutionPlaceholder}
          rows={3}
          value={solution}
          onChange={(e) => {
            onChange({ solution: e.target.value })
            // Story 13.7 AC4: desmarcar si el Builder edita manualmente
            if (aiGeneratedFields.has('solution')) {
              unmarkAsAiGenerated('solution')
            }
          }}
        />
        {/* Story 10.3 — T3.3: ejemplo contextual bajo el textarea de solución */}
        {selectedTemplate && (
          <p
            data-testid="wizard-hint-solution"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              margin: '0',
              fontStyle: 'italic',
            }}
          >
            Ejemplo: {selectedTemplate.descriptionStructure.solution.example}
          </p>
        )}
      </div>
    </div>
  )
}
