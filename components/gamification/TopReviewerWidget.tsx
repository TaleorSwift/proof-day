'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getTopReviewer } from '@/lib/api/gamification'
import type { TopReviewer } from '@/lib/types/gamification'

interface TopReviewerWidgetProps {
  communityId: string
}

export function TopReviewerWidget({ communityId }: TopReviewerWidgetProps) {
  const [data, setData] = useState<TopReviewer | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTopReviewer(communityId)
      .then(setData)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar el top reviewer')
        setData(null)
      })
  }, [communityId])

  // Estado carga — skeleton
  if (data === undefined) {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-hypothesis-bg)',
          border: '1px solid var(--color-hypothesis-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
        }}
      >
        <Skeleton style={{ height: '16px', width: '120px', marginBottom: 'var(--space-3)' }} />
        <div className="flex items-center gap-[var(--space-3)]">
          <Skeleton style={{ height: '40px', width: '40px', borderRadius: 'var(--radius-full)' }} />
          <div>
            <Skeleton style={{ height: '14px', width: '100px', marginBottom: 'var(--space-2)' }} />
            <Skeleton style={{ height: '12px', width: '80px' }} />
          </div>
        </div>
      </div>
    )
  }

  // Sin feedbacks esta semana — empty state o error
  if (data === null) {
    if (error) return null
    return (
      <div
        style={{
          backgroundColor: 'var(--color-hypothesis-bg)',
          border: '1px solid var(--color-hypothesis-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-2)',
          }}
        >
          Top Reviewer esta semana
        </p>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Sé el primero en dar feedback esta semana
        </p>
      </div>
    )
  }

  const initials = data.name
    ? data.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div
      style={{
        backgroundColor: 'var(--color-hypothesis-bg)',
        border: '1px solid var(--color-hypothesis-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
      }}
    >
      <p
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 'var(--space-3)',
        }}
      >
        Top Reviewer esta semana
      </p>
      <div className="flex items-center gap-[var(--space-3)]">
        <Link href={`/profile/${data.userId}`} aria-label={`Ver perfil de ${data.name ?? 'usuario'}`}>
          <Avatar style={{ width: '40px', height: '40px' }}>
            {data.avatarUrl && <AvatarImage src={data.avatarUrl} alt={data.name ?? 'Avatar'} />}
            <AvatarFallback
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
            }}
          >
            {data.name ?? 'Usuario'}
          </p>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {data.feedbackCount} {data.feedbackCount === 1 ? 'feedback' : 'feedbacks'} esta semana
          </p>
        </div>
      </div>
    </div>
  )
}
