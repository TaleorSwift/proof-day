'use client'

import { useState, useEffect } from 'react'
import type { ProofScoreResult } from '@/lib/types/proof-score'
import { getProofScore } from '@/lib/api/proof-score'
import { ProofScoreWaiting } from './ProofScoreWaiting'
import { ProofScoreBadge } from './ProofScoreBadge'

interface ProofScoreSidebarProps {
  projectId: string
  isBuilder: boolean
  feedbackCount: number
}

export function ProofScoreSidebar({
  projectId,
  isBuilder,
  feedbackCount,
}: ProofScoreSidebarProps) {
  const [score, setScore] = useState<ProofScoreResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isBuilder) return

    let cancelled = false

    async function fetchScore() {
      try {
        const result = await getProofScore(projectId)
        if (!cancelled) {
          setScore(result)
        }
      } catch {
        // score remains null — show waiting state
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchScore()

    return () => {
      cancelled = true
    }
  }, [projectId, isBuilder])

  if (!isBuilder) return null

  if (isLoading) {
    return <ProofScoreWaiting feedbackCount={feedbackCount} isLoading={true} />
  }

  if (score === null) {
    return <ProofScoreWaiting feedbackCount={feedbackCount} />
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <ProofScoreBadge label={score.label} variant="full" />
    </div>
  )
}
