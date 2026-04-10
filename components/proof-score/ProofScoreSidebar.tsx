'use client'

import { useState, useEffect } from 'react'
import type { ProofScoreResult } from '@/lib/types/proof-score'
import type { ProjectDecision } from '@/lib/types/projects'
import { getProofScore } from '@/lib/api/proof-score'
import { ProofScoreWaiting } from './ProofScoreWaiting'
import { ValidationSignalCard } from './ValidationSignalCard'
import { DecisionBadge } from '@/components/projects/DecisionBadge'
import { DecisionDialog } from '@/components/projects/DecisionDialog'
import { Button } from '@/components/ui/button'

interface ProofScoreSidebarProps {
  projectId: string
  isBuilder: boolean
  feedbackCount: number
  initialDecision?: ProjectDecision | null
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

  if (!isBuilder) return null
  if (isLoading) return <ProofScoreWaiting feedbackCount={feedbackCount} isLoading={true} />
  if (score === null) return <ProofScoreWaiting feedbackCount={feedbackCount} />

  return (
    <div data-testid="proof-score-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <ValidationSignalCard score={score} />
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
