import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import type { ProfileWithStats } from '@/lib/types/profiles'

interface Props {
  params: Promise<{ id: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/auth/login')

  const currentUser = authData.user

  // Si es el propio perfil, redirigir a /profile
  if (id === currentUser.id) {
    redirect('/profile')
  }

  // Verificar que comparten al menos una comunidad
  const { data: targetMemberships } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('user_id', id)

  const targetCommunityIds = targetMemberships?.map((m: Record<string, unknown>) => m.community_id) ?? []

  if (targetCommunityIds.length > 0) {
    const { data: sharedMemberships } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', currentUser.id)
      .in('community_id', targetCommunityIds)
      .limit(1)

    if (!sharedMemberships || sharedMemberships.length === 0) {
      redirect('/communities?error=profile_access_denied')
    }
  } else {
    // El usuario objetivo no pertenece a ninguna comunidad — sin acceso
    redirect('/communities?error=profile_access_denied')
  }

  // Obtener perfil
  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, bio, interests, avatar_url, created_at, updated_at')
    .eq('id', id)
    .single()

  if (profileError || !profileRow) {
    redirect('/communities?error=profile_not_found')
  }

  // Contar proyectos creados (visible para terceros)
  const { count: projectCount } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('builder_id', id)

  // feedbacks dados: NO visibles para terceros (AC10)
  const profile: Omit<ProfileWithStats, 'feedbackCount'> & { feedbackCount: null } = {
    id: profileRow.id,
    name: profileRow.name,
    bio: profileRow.bio,
    interests: profileRow.interests ?? [],
    avatarUrl: profileRow.avatar_url,
    createdAt: profileRow.created_at,
    updatedAt: profileRow.updated_at,
    feedbackCount: null,
    projectCount: projectCount ?? 0,
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-8)',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          padding: 'var(--space-8)',
          maxWidth: '720px',
          margin: '0 auto',
        }}
      >
        {/* Nombre */}
        <h1
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-2xl)',
          }}
        >
          {profile.name ?? 'Usuario'}
        </h1>

        {/* Bio */}
        {profile.bio && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-base)',
            }}
          >
            {profile.bio}
          </p>
        )}

        {/* Intereses */}
        {profile.interests && profile.interests.length > 0 && (
          <div
            className="flex flex-wrap gap-[var(--space-2)]"
            style={{ marginTop: 'var(--space-4)' }}
          >
            {profile.interests.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-sm)',
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Separator style={{ margin: 'var(--space-6) 0' }} />

        {/* Métricas — solo proyectos para terceros */}
        <div className="flex gap-[var(--space-8)]">
          <div>
            <p
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
              }}
            >
              {profile.projectCount}
            </p>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              proyectos creados
            </p>
          </div>
        </div>

        <Separator style={{ margin: 'var(--space-6) 0' }} />

        {/* Solo tab de proyectos — feedbacks no visibles para terceros */}
        <Tabs defaultValue="projects">
          <TabsList>
            <TabsTrigger value="projects">Proyectos creados</TabsTrigger>
          </TabsList>
          <TabsContent value="projects">
            <p
              style={{
                marginTop: 'var(--space-4)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              Los proyectos de este usuario aparecerán aquí.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
