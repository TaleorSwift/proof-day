import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

interface ProofScoreWaitingProps {
  feedbackCount: number
  isLoading?: boolean
}

export function ProofScoreWaiting({ feedbackCount, isLoading }: ProofScoreWaitingProps) {
  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-lg" />
  }

  const remaining = Math.max(0, 3 - feedbackCount)
  const progress = (feedbackCount / 3) * 100

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
        {remaining === 0
          ? 'Calculando tu Proof Score...'
          : `Faltan ${remaining} ${remaining === 1 ? 'feedback' : 'feedbacks'} para tu señal`}
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
