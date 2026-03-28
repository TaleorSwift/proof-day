'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FeedbackQuestion } from './FeedbackQuestion'
import { submitFeedback } from '@/lib/api/feedback'
import type { FeedbackScore } from '@/lib/types/feedback'

interface FeedbackDialogProps {
  projectId: string
  communityId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const QUESTIONS = [
  {
    number: 1 as const,
    question: '¿Entiendes claramente el problema planteado?',
    tooltip: 'Evalúa si el problema está bien explicado y es comprensible.',
  },
  {
    number: 2 as const,
    question: '¿Usarías esta solución si estuviera disponible?',
    tooltip: 'Evalúa si la solución resuelve un problema real que tú tendrías.',
  },
  {
    number: 3 as const,
    question: '¿Te parece viable técnicamente la solución propuesta?',
    tooltip:
      'Evalúa si la solución es técnicamente realizable con los recursos disponibles.',
  },
  {
    number: 4 as const,
    question: '¿Qué mejorarías de esta propuesta?',
    tooltip: 'Comparte qué cambiarías, qué falta, o qué mejorarías.',
  },
]

export function FeedbackDialog({
  projectId,
  communityId,
  isOpen,
  onClose,
  onSuccess,
}: FeedbackDialogProps) {
  const [scores, setScores] = useState<{
    p1?: FeedbackScore
    p2?: FeedbackScore
    p3?: FeedbackScore
  }>({})
  const [textResponses, setTextResponses] = useState<{
    p1: string
    p2: string
    p3: string
    p4: string
  }>({ p1: '', p2: '', p3: '', p4: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid =
    scores.p1 !== undefined &&
    scores.p2 !== undefined &&
    scores.p3 !== undefined &&
    textResponses.p4.length >= 10

  const handleSubmit = async () => {
    if (!isValid) return
    setIsLoading(true)
    setError(null)

    try {
      await submitFeedback({
        projectId,
        communityId,
        scores: {
          p1: scores.p1!,
          p2: scores.p2!,
          p3: scores.p3!,
        },
        textResponses: {
          p1: textResponses.p1 || undefined,
          p2: textResponses.p2 || undefined,
          p3: textResponses.p3 || undefined,
          p4: textResponses.p4,
        },
      })
      onClose()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar feedback')
    } finally {
      setIsLoading(false)
    }
  }

  const updateScore = (key: 'p1' | 'p2' | 'p3', value: FeedbackScore) => {
    setScores((prev) => ({ ...prev, [key]: value }))
  }

  const updateText = (key: 'p1' | 'p2' | 'p3' | 'p4', value: string) => {
    setTextResponses((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={{
          maxWidth: '560px',
          maxHeight: '80vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            Dar feedback
          </DialogTitle>
        </DialogHeader>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            paddingTop: 'var(--space-2)',
          }}
        >
          {/* P1 */}
          <FeedbackQuestion
            number={QUESTIONS[0].number}
            question={QUESTIONS[0].question}
            tooltip={QUESTIONS[0].tooltip}
            scoreValue={scores.p1}
            textValue={textResponses.p1}
            onScoreChange={(v) => updateScore('p1', v)}
            onTextChange={(v) => updateText('p1', v)}
            textOptional
          />

          {/* P2 */}
          <FeedbackQuestion
            number={QUESTIONS[1].number}
            question={QUESTIONS[1].question}
            tooltip={QUESTIONS[1].tooltip}
            scoreValue={scores.p2}
            textValue={textResponses.p2}
            onScoreChange={(v) => updateScore('p2', v)}
            onTextChange={(v) => updateText('p2', v)}
            textOptional
          />

          {/* P3 */}
          <FeedbackQuestion
            number={QUESTIONS[2].number}
            question={QUESTIONS[2].question}
            tooltip={QUESTIONS[2].tooltip}
            scoreValue={scores.p3}
            textValue={textResponses.p3}
            onScoreChange={(v) => updateScore('p3', v)}
            onTextChange={(v) => updateText('p3', v)}
            textOptional
          />

          {/* P4 — solo textarea, obligatorio */}
          <FeedbackQuestion
            number={QUESTIONS[3].number}
            question={QUESTIONS[3].question}
            tooltip={QUESTIONS[3].tooltip}
            textValue={textResponses.p4}
            onTextChange={(v) => updateText('p4', v)}
            isTextOnly
          />

          {/* Error inline */}
          {error && (
            <p
              role="alert"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-weak-text)',
                backgroundColor: 'var(--color-weak-bg)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-weak-text)',
              }}
            >
              {error}
            </p>
          )}

          {/* Botón enviar */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            style={{
              alignSelf: 'flex-end',
              backgroundColor: isValid && !isLoading
                ? 'var(--color-primary)'
                : undefined,
              color: isValid && !isLoading
                ? 'var(--color-surface)'
                : undefined,
            }}
          >
            {isLoading ? 'Enviando...' : 'Enviar feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
