import Link from 'next/link'
import Image from 'next/image'
import { Community } from '@/lib/types/communities'

interface Props {
  community: Community
}

export function CommunityCard({ community }: Props) {
  const initial = community.name.charAt(0).toUpperCase()

  return (
    <Link
      href={`/communities/${community.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = 'var(--shadow-md)'
          el.style.borderColor = 'var(--color-text-muted)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = 'var(--shadow-sm)'
          el.style.borderColor = 'var(--color-border)'
        }}
      >
        {/* Imagen o avatar con inicial */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          {community.image_url ? (
            <Image
              src={community.image_url}
              alt={`Imagen de ${community.name}`}
              width={48}
              height={48}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              aria-hidden="true"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: '#FFFFFF',
              }}
            >
              {initial}
            </div>
          )}
        </div>

        {/* Nombre */}
        <h2
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {community.name}
        </h2>

        {/* Descripción — máximo 2 líneas */}
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-3)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {community.description}
        </p>

        {/* Número de miembros */}
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          {community.member_count} {community.member_count === 1 ? 'miembro' : 'miembros'}
        </p>
      </div>
    </Link>
  )
}
