import Image from 'next/image'
import Link from 'next/link'
import { Community } from '@/lib/types/communities'

interface Props {
  community: Community
  isAdmin: boolean
}

export function CommunityHeader({ community, isAdmin }: Props) {
  const initial = community.name.charAt(0).toUpperCase()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-8)',
      }}
    >
      {/* Imagen o avatar con inicial */}
      {community.image_url ? (
        <Image
          src={community.image_url}
          alt={`Imagen de ${community.name}`}
          width={80}
          height={80}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-full)',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-surface)',
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
      )}

      {/* Info de comunidad */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-2)',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {community.name}
          </h1>

          {/* Botón de configuración — solo para admins */}
          {isAdmin && (
            <Link
              href={`/communities/${community.slug}/settings`}
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-1) var(--space-3)',
                flexShrink: 0,
              }}
            >
              Configuración
            </Link>
          )}
        </div>

        {community.description && (
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            {community.description}
          </p>
        )}

        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-3)',
          }}
        >
          {community.member_count} {community.member_count === 1 ? 'miembro' : 'miembros'}
        </p>
      </div>
    </div>
  )
}
