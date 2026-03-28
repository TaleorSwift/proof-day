import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { getRemainingFeedbacks, getProgressPercentage, getRemainingLabel } from '@/lib/utils/proof-score'

interface ProofScoreWaitingProps {
  feedbackCount: number
  isLoading?: boolean
}

export function ProofScoreWaiting({ feedbackCount, isLoading }: ProofScoreWaitingProps) {
  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-lg" />
  }

  const remaining = getRemainingFeedbacks(feedbackCount)
  const progress = getProgressPercentage(feedbackCount)

  return (
    <div
      style={{
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
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
        {remaining === 0 ? 'Calculando tu Proof Score...' : getRemainingLabel(remaining)}
      </p>

      <Progress value={progress} />

      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}
      >
        Tu señal estará lista pronto
      </p>
    </div>
  )
}
