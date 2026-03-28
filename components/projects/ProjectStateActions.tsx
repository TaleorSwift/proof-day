'use client'

import { useState } from 'react'
import type { ProjectStatus } from '@/lib/types/projects'
import { publishProject, deactivateProject } from '@/lib/api/projects'

interface ProjectStateActionsProps {
  projectId: string
  currentStatus: ProjectStatus
  isBuilder: boolean
  onStatusChange: (newStatus: ProjectStatus) => void
}

export function ProjectStateActions({
  projectId,
  currentStatus,
  isBuilder,
  onStatusChange,
}: ProjectStateActionsProps) {
  const [status, setStatus] = useState<ProjectStatus>(currentStatus)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isBuilder) return null
  if (status === 'inactive') return null

  async function handlePublish() {
    setIsLoading(true)
    setError(null)
    try {
      await publishProject(projectId)
      setStatus('live')
      setShowConfirm(false)
      onStatusChange('live')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeactivate() {
    setIsLoading(true)
    setError(null)
    try {
      await deactivateProject(projectId)
      setStatus('inactive')
      onStatusChange('inactive')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desactivar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {status === 'draft' && (
        <>
          {!showConfirm ? (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-2) var(--space-6)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-surface)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Publicar
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-hypothesis-bg)',
                border: '1px solid var(--color-hypothesis-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-medium)',
                  margin: 0,
                }}
              >
                ¿Listo para compartir con tu comunidad?
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-2) var(--space-4)',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-surface)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {isLoading ? 'Publicando...' : 'Publicar ahora'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirm(false)
                    setError(null)
                  }}
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
              </div>
            </div>
          )}
        </>
      )}

      {status === 'live' && (
        <button
          type="button"
          onClick={handleDeactivate}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-text-secondary)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Procesando...' : 'Marcar como inactivo'}
        </button>
      )}

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
    </div>
  )
}
