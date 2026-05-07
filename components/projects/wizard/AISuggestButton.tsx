'use client'

// Story 13.7 — Botón "Sugerir con IA" para los campos del wizard
// AC1: botón habilitado/deshabilitado según si hay título, estado loading
// AC3: llama a onSuggestion con el texto recibido de la API

import { useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AISuggestButtonProps {
  field: 'problem' | 'solution' | 'hypothesis'
  context: {
    title: string
    problem?: string
    solution?: string
    hypothesis?: string
    templateId?: string
  }
  onSuggestion: (text: string) => void
  disabled?: boolean
  /** data-testid para identificar el botón por campo en tests de integración */
  'data-testid'?: string
}

// ---------------------------------------------------------------------------
// Spinner — componente interno simple
// ---------------------------------------------------------------------------

function Spinner() {
  return (
    <span
      data-testid="ai-suggest-spinner"
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        border: '1.5px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// AISuggestButton
// ---------------------------------------------------------------------------

const ERROR_DISPLAY_MS = 3000

export function AISuggestButton({
  field,
  context,
  onSuggestion,
  disabled = false,
  'data-testid': dataTestId,
}: AISuggestButtonProps) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isDisabled = disabled || !context.title || context.title.trim() === '' || loading

  function showError(message: string) {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, ERROR_DISPLAY_MS)
  }

  async function handleClick() {
    if (isDisabled) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch('/api/ai/suggest-project-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          title: context.title,
          problem: context.problem,
          solution: context.solution,
          hypothesis: context.hypothesis,
          templateId: context.templateId,
        }),
      })

      if (!response.ok) {
        showError('Error al generar sugerencia')
        return
      }

      const data = await response.json()
      if (data.suggestion) {
        onSuggestion(data.suggestion)
      }
    } catch {
      showError('Error al generar sugerencia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Keyframes de animación — inyectados inline para evitar dependencias externas */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        data-testid={dataTestId ?? `ai-suggest-${field}`}
        title={
          !context.title || context.title.trim() === ''
            ? 'Escribe el nombre del proyecto primero'
            : undefined
        }
        aria-label="Sugerir con IA"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          fontSize: 'var(--text-xs)',
          color: isDisabled ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-1) var(--space-2)',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled && !loading ? 0.5 : 1,
          transition: 'opacity 0.15s ease',
          lineHeight: 1,
        }}
      >
        {loading ? (
          <Spinner />
        ) : (
          <span aria-hidden="true" style={{ fontSize: '10px' }}>
            ✦
          </span>
        )}
        Sugerir con IA
      </button>
      {errorMessage && (
        <span
          data-testid="ai-suggest-error"
          role="alert"
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-error, #dc2626)',
          }}
        >
          {errorMessage}
        </span>
      )}
    </>
  )
}
