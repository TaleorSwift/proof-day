'use client'

import { Heart } from 'lucide-react'
import { type CSSProperties } from 'react'

interface HeartButtonProps {
  count: number
  isActive?: boolean
  onClick?: () => void
  disabled?: boolean
}

export function HeartButton({
  count,
  isActive = false,
  onClick,
  disabled = false,
}: HeartButtonProps) {
  const iconColor = isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'
  const iconFill  = isActive ? 'var(--color-primary)' : 'transparent'
  const textColor = isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'

  return (
    <button
      type="button"
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      aria-pressed={isActive}
      aria-label={`Me gusta${count > 0 ? `, ${count}` : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        width: 40,
        height: 48,
        background: 'transparent',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s ease',
        flexShrink: 0,
      }}
    >
      <Heart
        size={16}
        style={{
          color: iconColor,
          fill: iconFill,
          transition: 'color 0.15s ease, fill 0.15s ease',
        }}
        aria-hidden="true"
      />
      <span
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-medium)' as CSSProperties['fontWeight'],
          color: textColor,
          lineHeight: 1,
        }}
      >
        {count}
      </span>
    </button>
  )
}
