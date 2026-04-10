import { type CSSProperties } from 'react'

export type SignalLevel = 'promising' | 'needs-work' | 'weak'

interface SignalIndicatorProps {
  level: SignalLevel
  label: string
}

const LEVEL_STYLES: Record<SignalLevel, { dotColor: string; textColor: string }> = {
  promising: {
    dotColor: 'var(--color-promising-text)',
    textColor: 'var(--color-promising-text)',
  },
  'needs-work': {
    dotColor: 'var(--color-needs-text)',
    textColor: 'var(--color-needs-text)',
  },
  weak: {
    dotColor: 'var(--color-weak-text)',
    textColor: 'var(--color-weak-text)',
  },
}

export function SignalIndicator({ level, label }: SignalIndicatorProps) {
  const styles = LEVEL_STYLES[level]

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: 'var(--radius-full)',
          backgroundColor: styles.dotColor,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 'var(--text-sm)',
          color: styles.textColor,
          fontWeight: 'var(--font-medium)' as CSSProperties['fontWeight'],
        }}
      >
        {label}
      </span>
    </div>
  )
}
