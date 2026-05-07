'use client'

// Story 13.2 — Wrapper Client Component para el botón "Nueva versión"
// Se extrae para mantener el máximo SSR en page.tsx (Server Component).
// Gestiona el estado del modal y el feedback visual post-publicación.

import { useState } from 'react'
import { NewVersionModal } from '@/components/projects/NewVersionModal'

export interface NewVersionActionsProps {
  projectId: string
  initialTitle: string
  initialDescription: string
  initialHypothesis: string
}

export function NewVersionActions({
  projectId,
  initialTitle,
  initialDescription,
  initialHypothesis,
}: NewVersionActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null)

  function handleSuccess(versionNumber: number) {
    setPublishedVersion(versionNumber)
    setIsModalOpen(false)
  }

  return (
    <>
      {/* Botón "Nueva versión" */}
      <button
        type="button"
        data-testid="new-version-btn"
        onClick={() => setIsModalOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-surface)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        Nueva versión
      </button>

      {/* Banner de confirmación post-publicación (reset visual del proof score) */}
      {publishedVersion !== null && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-hypothesis-bg)',
            border: '1px solid var(--color-hypothesis-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            fontWeight: 'var(--font-medium)',
          }}
        >
          Versión {publishedVersion} publicada — Esperando feedback
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <NewVersionModal
          projectId={projectId}
          initialTitle={initialTitle}
          initialDescription={initialDescription}
          initialHypothesis={initialHypothesis}
          onSuccess={handleSuccess}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
