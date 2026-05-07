// Story 13.6 — Historial de versiones del proyecto por iteración

interface IterationEntry {
  id: string
  versionNumber: number
  publishedAt: string
  feedbackCount: number
}

interface IterationHistoryProps {
  iterations: IterationEntry[]
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate))
}

function feedbackLabel(count: number): string {
  return count === 1 ? '1 feedback' : `${count} feedbacks`
}

export function IterationHistory({ iterations }: IterationHistoryProps) {
  if (iterations.length === 0) return null

  return (
    <section
      data-testid="iteration-history"
      aria-labelledby="iteration-history-heading"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <h2
        id="iteration-history-heading"
        style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          margin: 0,
        }}
      >
        Historial de versiones
      </h2>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {iterations.map((iteration, index) => (
          <li
            key={iteration.id}
            data-testid={`iteration-history-item-${iteration.versionNumber}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) 0',
              ...(index < iterations.length - 1
                ? { borderBottom: '1px solid var(--color-border)' }
                : {}),
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                minWidth: '2rem',
              }}
            >
              v{iteration.versionNumber}
            </span>

            <time
              dateTime={iteration.publishedAt}
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                flex: 1,
              }}
            >
              {formatDate(iteration.publishedAt)}
            </time>

            <span
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              {feedbackLabel(iteration.feedbackCount)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
