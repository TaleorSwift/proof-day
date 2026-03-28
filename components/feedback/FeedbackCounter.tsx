interface FeedbackCounterProps {
  count: number
}

export function FeedbackCounter({ count }: FeedbackCounterProps) {
  return (
    <p
      aria-live="polite"
      style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
        fontWeight: 'var(--font-medium)',
        margin: 0,
      }}
    >
      {count} {count === 1 ? 'feedback' : 'feedbacks'}
    </p>
  )
}
