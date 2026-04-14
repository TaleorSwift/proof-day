import { type CSSProperties } from 'react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { ContributorBadge } from '@/components/shared/ContributorBadge'
import type { TopContributor } from '@/lib/types/gamification'

interface TopContributorsListProps {
  contributors: TopContributor[]
}

type ContributorBadgeType = 'top-reviewer' | 'insightful' | 'changed-thinking'

function getBadgeType(index: number): ContributorBadgeType {
  if (index === 0) return 'top-reviewer'
  if (index <= 2) return 'insightful'
  return 'changed-thinking'
}

export function TopContributorsList({ contributors }: TopContributorsListProps) {
  return (
    <div
      data-testid="top-contributors"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
      }}
    >
      <p
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-semibold)' as CSSProperties['fontWeight'],
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 'var(--space-3)',
        }}
      >
        Top Contribuidores
      </p>

      {contributors.length === 0 ? (
        <p
          data-testid="top-contributors-empty"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Aún no hay revisores en esta comunidad
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          {contributors.map((contributor, index) => (
            <li
              key={contributor.userId}
              data-testid="top-contributor-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <UserAvatar name={contributor.name} size="sm" />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  data-testid="contributor-name"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)' as CSSProperties['fontWeight'],
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {contributor.name}
                </p>
                <p
                  data-testid="contributor-count"
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}
                >
                  {contributor.feedbackCount} {contributor.feedbackCount === 1 ? 'feedback' : 'feedbacks'}
                </p>
              </div>

              <span data-testid="contributor-badge">
                <ContributorBadge type={getBadgeType(index)} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
