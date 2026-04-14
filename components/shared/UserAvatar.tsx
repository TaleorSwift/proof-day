import { type CSSProperties } from 'react'

type AvatarSize = 'xs' | 'sm' | 'nav' | 'md' | 'lg'

interface UserAvatarProps {
  name: string
  size?: AvatarSize
  showName?: boolean
}

const SIZE_STYLES: Record<AvatarSize, CSSProperties> = {
  xs:  { width: 20, height: 20, fontSize: '10px' },
  sm:  { width: 28, height: 28, fontSize: 'var(--text-xs)' },
  nav: { width: 32, height: 32, fontSize: 'var(--text-xs)' },
  md:  { width: 36, height: 36, fontSize: 'var(--text-sm)' },
  lg:  { width: 48, height: 48, fontSize: 'var(--text-base)' },
}

function getInitial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

export function UserAvatar({ name, size = 'md', showName = false }: UserAvatarProps) {
  const sizeStyle = SIZE_STYLES[size]

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
    >
      <div
        aria-label={`Avatar de ${name}`}
        role="img"
        style={{
          ...sizeStyle,
          backgroundColor: 'rgba(249,115,22,0.12)',
          color: '#F97316',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'var(--font-semibold)' as CSSProperties['fontWeight'],
          flexShrink: 0,
        }}
      >
        {getInitial(name)}
      </div>

      {showName && (
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            fontWeight: 'var(--font-medium)' as CSSProperties['fontWeight'],
          }}
        >
          {name}
        </span>
      )}
    </div>
  )
}
