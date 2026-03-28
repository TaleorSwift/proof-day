'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { getFeedbackCount } from '@/lib/api/gamification'

interface PersonalFeedbackCounterProps {
  communityId: string
}

export function PersonalFeedbackCounter({ communityId }: PersonalFeedbackCounterProps) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFeedbackCount(communityId)
      .then((data) => setCount(data.count))
      .catch(() => setCount(0))
      .finally(() => setLoading(false))
  }, [communityId])

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-4)' }}>
        <Skeleton style={{ height: '16px', width: '200px' }} />
      </div>
    )
  }

  if (count === null) return null

  return (
    <div
      style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
        }}
      >
        Has dado{' '}
        <span
          style={{
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
          }}
        >
          {count}
        </span>{' '}
        {count === 1 ? 'feedback' : 'feedbacks'} en esta comunidad
      </p>
    </div>
  )
}
