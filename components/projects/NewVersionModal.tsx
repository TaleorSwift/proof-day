'use client'

// Story 13.2 — Modal para publicar una nueva versión/iteración de un proyecto
// Patrón: igual que DecisionDialog.tsx (modal accesible con loading/error)

import { useId, useState } from 'react'
import { publishIteration } from '@/lib/api/project-iterations'

export interface NewVersionModalProps {
  projectId: string
  initialTitle: string
  initialDescription: string
  initialHypothesis: string
  onSuccess: (versionNumber: number) => void
  onClose: () => void
}

export function NewVersionModal({
  projectId,
  initialTitle,
  initialDescription,
  initialHypothesis,
  onSuccess,
  onClose,
}: NewVersionModalProps) {
  const headingId = useId()

  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [hypothesis, setHypothesis] = useState(initialHypothesis)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const result = await publishIteration(projectId, { title, description, hypothesis })
      onSuccess(result.versionNumber)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar la versión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Overlay
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(26, 26, 24, 0.5)',
        padding: 'var(--space-4)',
      }}
    >
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        data-testid="new-version-modal"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-6)',
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Heading */}
        <h2
          id={headingId}
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Nueva versión del proyecto
        </h2>

        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 'var(--leading-base)',
          }}
        >
          Edita los campos si quieres actualizar el contenido de esta versión. Puedes publicarla
          sin cambios si tu proyecto no ha variado.
        </p>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          {/* Campo: Título */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label
              htmlFor="new-version-title-input"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
              }}
            >
              Título
            </label>
            <input
              id="new-version-title-input"
              data-testid="new-version-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-surface)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Campo: Descripción */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label
              htmlFor="new-version-description-input"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
              }}
            >
              Descripción
            </label>
            <textarea
              id="new-version-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={4}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-surface)',
                outline: 'none',
                resize: 'vertical',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {/* Campo: Hipótesis */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-hypothesis-bg)',
              border: '1px solid var(--color-hypothesis-border)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <label
              htmlFor="new-version-hypothesis-input"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
              }}
            >
              🔬 Hipótesis a validar
            </label>
            <textarea
              id="new-version-hypothesis-input"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              disabled={isLoading}
              rows={3}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--color-hypothesis-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-surface)',
                outline: 'none',
                resize: 'vertical',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <p
              role="alert"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-weak-text)',
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          {/* Acciones */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-2)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="new-version-submit"
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-2) var(--space-6)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-surface)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Publicando...' : 'Publicar versión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
