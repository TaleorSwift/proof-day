import { UserAvatar } from '@/components/shared/UserAvatar'
import { ContributorBadge } from '@/components/shared/ContributorBadge'
import { getRelativeTime } from '@/lib/utils/date'
import type { FeedbackEntryData } from '@/lib/types/feedback'

// Mismas etiquetas que FeedbackList — fuente única de verdad.
// Si en el futuro se extraen a lib/constants/feedback.ts, actualizar ambas referencias.
const QUESTION_LABELS: Record<string, string> = {
  p1: '¿Entiendes el problema?',
  p2: '¿Usarías la solución?',
  p3: '¿Es viable técnicamente?',
  p4: '¿Qué mejorarías?',
}

interface FeedbackEntryProps {
  data: FeedbackEntryData
}

export function FeedbackEntry({ data }: FeedbackEntryProps) {
  const { reviewerName, createdAt, textResponses, contributorType } = data
  const textResponsesRecord = textResponses as unknown as Record<string, string | undefined>

  return (
    <article
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
      {/* Cabecera: avatar + nombre + badge opcional + fecha */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <UserAvatar name={reviewerName} size="sm" showName={false} />

          <h3
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {reviewerName}
          </h3>

          {contributorType && <ContributorBadge type={contributorType} />}
        </div>

        <time
          dateTime={createdAt}
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            flexShrink: 0,
          }}
        >
          {getRelativeTime(createdAt)}
        </time>
      </div>

      {/* Cuerpo: respuestas de texto — solo se renderizan las que tienen valor truthy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {(['p1', 'p2', 'p3', 'p4'] as const).map((key) => {
          const text = textResponsesRecord[key]
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
}
