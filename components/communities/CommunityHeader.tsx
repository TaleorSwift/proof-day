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
    <div style={{ marginBottom: 'var(--space-6)' }}>
      {/* Fila superior: avatar + nombre + botón config */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
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
              flexShrink: 0,
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
              color: 'var(--color-surface)',
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
        )}

        <div>
          <h2
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {community.name}
          </h2>

          {isAdmin && (
            <Link
              href={`/communities/${community.slug}/settings`}
              style={{
                display: 'inline-block',
                marginTop: 'var(--space-1)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-1) var(--space-3)',
              }}
            >
              Configuración
            </Link>
          )}
        </div>
      </div>

      {/* Descripción — ancho completo del bloque */}
      {community.description && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            margin: 'var(--space-3) 0 0',
          }}
        >
          {community.description}
        </p>
      )}

      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          margin: 'var(--space-2) 0 0',
        }}
      >
        {community.member_count} {community.member_count === 1 ? 'miembro' : 'miembros'}
      </p>
    </div>
  )
}
