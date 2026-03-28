'use client'

import { useEffect, useState } from 'react'
import { getFeedbacks, type FeedbackWithReviewer } from '@/lib/api/feedback'

interface FeedbackListProps {
  projectId: string
  isBuilder: boolean
}

function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSeconds < 60) return 'hace un momento'
  if (diffMinutes < 60) return `hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
  if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  if (diffWeeks < 4) return `hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`
  return `hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function AvatarPlaceholder({ name }: { name: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--color-surface)',
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </div>
  )
}

function FeedbackSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {[1, 2].map((i) => (
        <div
          key={i}
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-border)',
                flexShrink: 0,
              }}
            />
            <div
              style={{
                height: '14px',
                width: '120px',
                backgroundColor: 'var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ height: '12px', width: '100%', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
            <div style={{ height: '12px', width: '80%', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const QUESTION_LABELS: Record<string, string> = {
  p1: '¿Entiendes el problema?',
  p2: '¿Usarías la solución?',
  p3: '¿Es viable técnicamente?',
  p4: '¿Qué mejorarías?',
}

export function FeedbackList({ projectId, isBuilder }: FeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackWithReviewer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isBuilder) return

    setIsLoading(true)
    getFeedbacks(projectId)
      .then((data) => setFeedbacks(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar feedbacks'))
      .finally(() => setIsLoading(false))
  }, [projectId, isBuilder])

  if (!isBuilder) return null

  if (isLoading) return <FeedbackSkeleton />

  if (error) {
    return (
      <p
        role="alert"
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-weak-text)',
          padding: 'var(--space-3)',
          backgroundColor: 'var(--color-weak-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-weak-text)',
        }}
      >
        {error}
      </p>
    )
  }

  if (feedbacks.length === 0) {
    return (
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
          padding: 'var(--space-4) 0',
          textAlign: 'center',
        }}
      >
        Aun no has recibido feedback
      </p>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {feedbacks.map((feedback) => {
        const reviewerName = feedback.profiles?.name ?? 'Usuario'
        const avatarUrl = feedback.profiles?.avatar_url ?? null
        const textResponses = feedback.text_responses as unknown as Record<string, string | undefined>

        return (
          <article
            key={feedback.id}
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            {/* Cabecera: avatar + nombre + fecha */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={reviewerName}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <AvatarPlaceholder name={reviewerName} />
                )}
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {reviewerName}
                </span>
              </div>
              <time
                dateTime={feedback.created_at}
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {getRelativeTime(feedback.created_at)}
              </time>
            </div>

            {/* Respuestas textuales P1-P4 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {(['p1', 'p2', 'p3', 'p4'] as const).map((key) => {
                const text = textResponses[key]
                if (!text) return null
                return (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {QUESTION_LABELS[key]}
                    </span>
                    <p
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 'var(--leading-base)',
                        margin: 0,
                      }}
                    >
                      {text}
                    </p>
                  </div>
                )
              })}
            </div>
          </article>
        )
      })}
    </div>
  )
}
