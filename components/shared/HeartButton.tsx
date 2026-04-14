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
  const activeColor = 'var(--color-primary)'
  const idleColor   = 'rgb(106,113,129)'
  const iconColor = isActive ? activeColor : idleColor
  const iconFill  = isActive ? activeColor : 'transparent'
  const textColor = isActive ? activeColor : idleColor

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
        border: 'none',
        borderRadius: '10px',
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
