import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { EmptyCommunitiesState } from '@/components/communities/EmptyCommunitiesState'

export default async function CommunitiesPage() {
  const supabase = await createClient()

  // RLS filtra automáticamente las comunidades del usuario autenticado
  const { data: communities, error } = await supabase
    .from('communities')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="container max-w-2xl py-8">
        <p className="text-sm text-destructive" role="alert">
          Error al cargar las comunidades. Inténtalo de nuevo.
        </p>
      </main>
    )
  }

  return (
    <main className="container max-w-2xl py-8">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Mis comunidades
      </h1>

      {!communities || communities.length === 0 ? (
        <EmptyCommunitiesState />
      ) : (
        <ul className="space-y-4">
          {communities.map((community) => (
            <li
              key={community.id}
              className="rounded-md border p-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {community.image_url && (
                <Image
                  src={community.image_url}
                  alt={`Imagen de ${community.name}`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover mb-3"
                  style={{ borderRadius: 'var(--radius-full)' }}
                />
              )}
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {community.name}
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {community.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
