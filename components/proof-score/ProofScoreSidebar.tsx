'use client'

import { useState, useEffect } from 'react'
import { isAIEnabled } from '@/lib/ai/featureFlag'
import type { ProofScoreResult } from '@/lib/types/proof-score'
import type { ProjectDecision } from '@/lib/types/projects'
import { getProofScore } from '@/lib/api/proof-score'
import { ProofScoreWaiting } from './ProofScoreWaiting'
import { ValidationSignalCard } from './ValidationSignalCard'
import { DecisionBadge } from '@/components/projects/DecisionBadge'
import { DecisionDialog } from '@/components/projects/DecisionDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface ProofScoreSidebarProps {
  projectId: string
  isBuilder: boolean
  feedbackCount: number
  initialDecision?: ProjectDecision | null
}

// Deriva understandPercent y wouldUsePercent desde ProofScoreResult.
// El endpoint del owner devuelve un average global (media de todas las preguntas).
// Usamos ese average como proxy para ambas barras en el contexto del owner.
function derivePercentsFromScore(score: ProofScoreResult): {
  understandPercent: number
  wouldUsePercent: number
} {
  return {
    understandPercent: score.average,
    wouldUsePercent: score.average,
  }
}

export function ProofScoreSidebar({
  projectId,
  isBuilder,
  feedbackCount,
  initialDecision = null,
}: ProofScoreSidebarProps) {
  const [score, setScore] = useState<ProofScoreResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [decision, setDecision] = useState<ProjectDecision | null>(initialDecision)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [interpretation, setInterpretation] = useState<string | null>(null)
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false)

  // Cargar proof score
  useEffect(() => {
    if (!isBuilder) return
    let cancelled = false
    async function fetchScore() {
      try {
        const result = await getProofScore(projectId)
        if (!cancelled) setScore(result)
      } catch {
        // score remains null
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchScore()
    return () => { cancelled = true }
  }, [projectId, isBuilder])

  // Cargar interpretación cuando el score esté disponible (Story 13.8)
  // Fire-after-score: se lanza DESPUÉS de obtener el score, sin bloquear la UI
  useEffect(() => {
    if (!score) return
    if (!isAIEnabled()) return
    let cancelled = false
    setIsLoadingInterpretation(true)
    fetch(`/api/projects/${projectId}/score-interpretation`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data?.interpretation) {
          setInterpretation(data.interpretation)
        }
      })
      .catch(() => {
        // silencioso — la interpretación es enriquecimiento opcional
      })
      .finally(() => {
        if (!cancelled) setIsLoadingInterpretation(false)
      })
    return () => { cancelled = true }
  }, [projectId, score])

  if (!isBuilder) return null
  if (isLoading) return <ProofScoreWaiting feedbackCount={feedbackCount} isLoading={true} />
  if (score === null) return <ProofScoreWaiting feedbackCount={feedbackCount} />

  const { understandPercent, wouldUsePercent } = derivePercentsFromScore(score)

  return (
    <div data-testid="proof-score-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <ValidationSignalCard
        understandPercent={understandPercent}
        wouldUsePercent={wouldUsePercent}
        feedbackCount={score.feedbackCount}
      />

      {/* Interpretación contextual del Proof Score (Story 13.8) */}
      {isAIEnabled() && isLoadingInterpretation && (
        <div data-testid="score-interpretation-loading">
          <Skeleton style={{ height: '1rem', marginBottom: 'var(--space-2)' }} />
          <Skeleton style={{ height: '1rem', width: '75%' }} />
        </div>
      )}
      {isAIEnabled() && !isLoadingInterpretation && interpretation && (
        <p
          data-testid="score-interpretation"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-base)',
            margin: 0,
          }}
        >
          {interpretation}
        </p>
      )}

      {decision !== null ? (
        <DecisionBadge decision={decision} />
      ) : (
        <>
          <Button type="button" variant="outline" style={{ width: '100%' }} onClick={() => setIsDialogOpen(true)}>
            Registrar decision
          </Button>
          <DecisionDialog
            projectId={projectId}
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSuccess={(d) => { setDecision(d); setIsDialogOpen(false) }}
          />
        </>
      )}
    </div>
  )
}
