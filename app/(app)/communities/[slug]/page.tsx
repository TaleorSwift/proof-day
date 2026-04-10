import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CommunityHeader } from '@/components/communities/CommunityHeader'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { Button } from '@/components/ui/button'
import { PersonalFeedbackCounter } from '@/components/gamification/PersonalFeedbackCounter'
import { TopReviewerWidget } from '@/components/gamification/TopReviewerWidget'
import type { ProjectListItem } from '@/lib/api/projects'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CommunityPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/auth/login')
  const user = authData.user

  // RLS garantiza que solo miembros pueden leer.
  // Si el usuario no es miembro (o la comunidad no existe), data será null.
  const { data: community } = await supabase
    .from('communities')
    .select('id, name, slug, description, image_url, created_by, created_at, updated_at')
    .eq('slug', slug)
    .single()

  if (!community) {
    notFound()
  }

  // Obtener conteo de miembros, rol del usuario y proyectos en paralelo
  const [{ count: memberCount }, { data: membership }, { data: projectRows }] = await Promise.all([
    supabase
      .from('community_members')
      .select('*', { count: 'exact', head: true })
      .eq('community_id', community.id),
    supabase
      .from('community_members')
      .select('role')
      .eq('community_id', community.id)
      .eq('user_id', user.id)
      .single(),
    // Server Component lee directamente — RLS filtra: live+inactive para todos, draft solo al builder
    supabase
      .from('projects')
      .select('id, title, image_urls, status, builder_id, created_at, problem')
      .eq('community_id', community.id)
      .order('created_at', { ascending: false }),
  ])

  // Si no hay membresía → redirect
  if (!membership) {
    redirect('/communities?error=no-access')
  }

  const isAdmin = membership?.role === 'admin'
  const canCreate = true // Cualquier miembro puede crear proyectos

  // Mapear rows de Supabase a ProjectListItem (camelCase)
  const projects: ProjectListItem[] = (projectRows ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    title: r.title as string,
    imageUrls: r.image_urls as string[],
    status: r.status as 'draft' | 'live' | 'inactive',
    builderId: r.builder_id as string,
    createdAt: r.created_at as string,
    // problem puede ser null en BD si el proyecto no tiene descripción
    ...(r.problem != null && { problem: r.problem as string }),
  }))

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-8)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <CommunityHeader
          community={{
            ...community,
            member_count: memberCount ?? 0,
          }}
          isAdmin={isAdmin}
        />

        {/* Layout de 2 columnas: proyectos + sidebar gamificación */}
        <div
          style={{
            marginTop: 'var(--space-8)',
            display: 'grid',
            gridTemplateColumns: '1fr 280px',
            gap: 'var(--space-8)',
            alignItems: 'start',
          }}
        >
          {/* Columna principal: proyectos — Story 3.4 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Proyectos
              </h2>
              <Link href={`/communities/${slug}/projects/new`}>
                <Button
                  variant="default"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                  }}
                >
                  Nuevo proyecto
                </Button>
              </Link>
            </div>

            <ProjectGrid
              projects={projects}
              communitySlug={slug}
              canCreate={canCreate}
            />
          </div>

          {/* Sidebar derecho: gamificación — Story 6.2 */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <PersonalFeedbackCounter communityId={community.id} />
            <TopReviewerWidget communityId={community.id} />
          </aside>
        </div>
      </div>
    </main>
  )
}
