import { FeedbackEntry } from '@/components/feedback/FeedbackEntry'
import type { FeedbackEntryData } from '@/lib/types/feedback'

interface TeamPerspectivesProps {
  feedbacks: FeedbackEntryData[]
}

export function TeamPerspectives({ feedbacks }: TeamPerspectivesProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h2
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          margin: 0,
        }}
      >
        Perspectivas del equipo
      </h2>

      {feedbacks.length === 0 ? (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
            padding: 'var(--space-4) 0',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Aún no hay perspectivas del equipo
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {feedbacks.map((feedback) => (
            <FeedbackEntry key={feedback.id} data={feedback} />
          ))}
        </div>
      )}
    </section>
  )
}
