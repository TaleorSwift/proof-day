'use client'

import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Community } from '@/lib/types/communities'

interface Props {
  communities: Community[]
  activeCommunitySlug?: string
}

export function CommunitySwitcher({ communities, activeCommunitySlug }: Props) {
  const router = useRouter()

  // Solo se muestra si el usuario pertenece a 2 o más comunidades (AC-6)
  if (communities.length < 2) {
    if (communities.length === 1) {
      return (
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-primary)',
          }}
        >
          {communities[0].name}
        </span>
      )
    }
    return null
  }

  const activeCommunity = communities.find((c) => c.slug === activeCommunitySlug)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-text-primary)',
          background: 'none',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-1) var(--space-3)',
          cursor: 'pointer',
        }}
      >
        {activeCommunity ? activeCommunity.name : 'Mis comunidades'}
        <span aria-hidden="true" style={{ fontSize: 'var(--text-xs)' }}>▾</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        {communities.map((community) => {
          const isActive = community.slug === activeCommunitySlug
          return (
            <DropdownMenuItem
              key={community.id}
              onClick={() => router.push(`/communities/${community.slug}`)}
              style={{
                cursor: 'pointer',
                fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-regular)',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              {isActive && (
                <span aria-hidden="true" style={{ fontSize: 'var(--text-xs)' }}>✓</span>
              )}
              {community.name}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
