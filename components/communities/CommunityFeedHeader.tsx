'use client'

import { useState } from 'react'
import { LaunchIdeaModal } from '@/components/projects/LaunchIdeaModal'

interface Props {
  communityName: string
  communitySlug: string
}

export function CommunityFeedHeader({ communityName, communitySlug }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div>
          <h1
            data-testid="feed-heading"
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Ideas en validación
          </h1>
          <p
            data-testid="feed-subheading"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-1)',
              marginBottom: 0,
            }}
          >
            Da feedback. Aprende más rápido. Decide qué construir.
          </p>
          <p
            data-testid="community-name-secondary"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-2)',
              marginBottom: 0,
            }}
          >
            {communityName}
          </p>
        </div>

        <button
          data-testid="btn-launch-idea"
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            cursor: 'pointer',
            flexShrink: 0,
            alignSelf: 'flex-start',
          }}
        >
          + Lanzar idea
        </button>
      </div>

      <LaunchIdeaModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        communitySlug={communitySlug}
      />
    </>
  )
}
