'use client'

import { useState } from 'react'
import { submitFeedback } from '@/lib/api/feedback'
import type { FeedbackScore } from '@/lib/types/feedback'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FeedbackFormInlineProps {
  projectId: string
  communityId: string
}

// ---------------------------------------------------------------------------
// Estado interno
// ---------------------------------------------------------------------------

type FormState = 'idle' | 'loading' | 'success' | 'error'

// ---------------------------------------------------------------------------
// Sub-componente: ScoreSelector — botones de selección para una pregunta
// ---------------------------------------------------------------------------

interface ScoreSelectorProps {
  options: Array<{ label: string; value: FeedbackScore }>
  selected: FeedbackScore | undefined
  onSelect: (value: FeedbackScore) => void
}

function ScoreSelector({ options, selected, onSelect }: ScoreSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      {options.map(({ label, value }) => {
        const isSelected = selected === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              border: isSelected
                ? '1.5px solid var(--color-primary)'
                : '1px solid var(--color-border)',
              backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
              color: isSelected ? 'var(--color-surface)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FeedbackFormInline
// ---------------------------------------------------------------------------

export function FeedbackFormInline({ projectId, communityId }: FeedbackFormInlineProps) {
  const [p1Score, setP1Score] = useState<FeedbackScore | undefined>(undefined)
  const [p2Score, setP2Score] = useState<FeedbackScore | undefined>(undefined)
  const [improvement, setImprovement] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isValid =
    p1Score !== undefined &&
    p2Score !== undefined &&
    improvement.length >= 10

  async function handleSubmit() {
    if (!isValid) return
    setFormState('loading')
    setErrorMessage('')
    try {
      await submitFeedback({
        projectId,
        communityId,
        scores: {
          p1: p1Score,
          p2: p2Score,
          p3: 2, // valor neutral — esta pregunta no se muestra al usuario en el formulario inline
        },
        textResponses: {
          p4: improvement,
        },
      })
      setFormState('success')
    } catch (err) {
      setFormState('error')
      setErrorMessage(err instanceof Error ? err.message : 'Error al enviar el feedback')
    }
  }

  // Estado de confirmación
  if (formState === 'success') {
    return (
      <div
        data-testid="feedback-form-inline-confirmation"
        style={{
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-promising-bg)',
          border: '1px solid var(--color-promising-text)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-promising-text)',
            fontWeight: 'var(--font-medium)',
            margin: 0,
          }}
        >
          Gracias por tu feedback. ¡Tu perspectiva es valiosa!
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {/* Pregunta p1: ¿Entiendes el problema? */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-primary)',
          }}
        >
          ¿Entiendes el problema?
        </span>
        <ScoreSelector
          options={[
            { label: 'Sí', value: 3 },
            { label: 'Parcialmente', value: 2 },
            { label: 'No', value: 1 },
          ]}
          selected={p1Score}
          onSelect={setP1Score}
        />
      </div>

      {/* Pregunta p2: ¿Lo usarías? */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-primary)',
          }}
        >
          ¿Lo usarías?
        </span>
        <ScoreSelector
          options={[
            { label: 'Sí', value: 3 },
            { label: 'No', value: 1 },
          ]}
          selected={p2Score}
          onSelect={setP2Score}
        />
      </div>

      {/* Pregunta p4: ¿Qué mejorarías? */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label
          htmlFor="feedback-improvement"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-primary)',
          }}
        >
          ¿Qué mejorarías?
        </label>
        <textarea
          id="feedback-improvement"
          value={improvement}
          onChange={(e) => setImprovement(e.target.value)}
          placeholder="Mínimo 10 caracteres..."
          rows={3}
          style={{
            width: '100%',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: 'var(--leading-base)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Mensaje de error */}
      {formState === 'error' && errorMessage && (
        <p
          role="alert"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-weak-text)',
            margin: 0,
            backgroundColor: 'var(--color-weak-bg)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {errorMessage}
        </p>
      )}

      {/* Botón submit */}
      <button
        data-testid="feedback-form-inline-submit"
        type="button"
        disabled={!isValid || formState === 'loading'}
        onClick={handleSubmit}
        style={{
          width: '100%',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          border: 'none',
          cursor: isValid && formState !== 'loading' ? 'pointer' : 'not-allowed',
          backgroundColor:
            isValid && formState !== 'loading'
              ? 'var(--color-accent)'
              : 'var(--color-border)',
          color: 'var(--color-surface)',
          transition: 'background-color 0.15s ease',
        }}
      >
        {formState === 'loading' ? 'Enviando...' : 'Compartir insight'}
      </button>
    </div>
  )
}
