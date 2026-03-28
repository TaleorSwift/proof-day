'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { registerDecision } from '@/lib/api/projects'
import type { ProjectDecision } from '@/lib/types/projects'

interface DecisionOption {
  value: ProjectDecision
  icon: string
  label: string
  description: string
}

const DECISION_OPTIONS: DecisionOption[] = [
  {
    value: 'iterate',
    icon: '↺',
    label: 'Iterar',
    description: 'Refinando la propuesta',
  },
  {
    value: 'scale',
    icon: '↑',
    label: 'Escalar',
    description: 'Llevando la idea adelante',
  },
  {
    value: 'abandon',
    icon: '✗',
    label: 'Abandonar',
    description: 'Desarrollo detenido',
  },
]

export interface DecisionDialogProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: (decision: ProjectDecision) => void
}

export function DecisionDialog({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: DecisionDialogProps) {
  const [selectedDecision, setSelectedDecision] = useState<ProjectDecision | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!selectedDecision) return
    setIsLoading(true)
    setError(null)
    try {
      await registerDecision(projectId, selectedDecision)
      onSuccess(selectedDecision)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la decisión')
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelectedDecision(null)
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar tu decisión</DialogTitle>
        </DialogHeader>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-2)',
          }}
        >
          {DECISION_OPTIONS.map((option) => {
            const isSelected = selectedDecision === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedDecision(option.value)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: isSelected
                    ? 'var(--color-background)'
                    : 'var(--color-surface)',
                  border: isSelected
                    ? '2px solid var(--color-primary)'
                    : '2px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'border-color 120ms ease, background-color 120ms ease',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--text-lg)',
                    color: isSelected
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-lg)',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {option.icon}
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 'var(--leading-sm)',
                    }}
                  >
                    {option.label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      lineHeight: 'var(--leading-xs)',
                    }}
                  >
                    {option.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {error && (
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-sm)',
              color: 'var(--color-weak-text)',
              marginTop: 'var(--space-2)',
            }}
          >
            {error}
          </p>
        )}

        <p
          style={{
            margin: 0,
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-2)',
          }}
        >
          Esta accion es irreversible
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-4)',
          }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedDecision || isLoading}
          >
            {isLoading ? 'Confirmando...' : 'Confirmar decision'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
