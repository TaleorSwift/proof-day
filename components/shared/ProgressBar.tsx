import { type CSSProperties } from 'react'

interface ProgressBarProps {
  label: string
  percentage: number
  color?: string
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value))
}

export function ProgressBar({
  label,
  percentage,
  color = 'var(--color-progress-fill)',
}: ProgressBarProps) {
  const clamped = clampPercentage(percentage)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            fontWeight: 'var(--font-medium)' as CSSProperties['fontWeight'],
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-medium)' as CSSProperties['fontWeight'],
          }}
          aria-live="polite"
        >
          {clamped}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        style={{
          width: '100%',
          height: 8,
          backgroundColor: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}
