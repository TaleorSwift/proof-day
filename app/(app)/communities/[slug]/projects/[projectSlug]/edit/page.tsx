import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/projects/ProjectForm'
import type { ProjectRow } from '@/lib/types/projects'

interface Props {
  params: Promise<{ slug: string; projectSlug: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const { slug, projectSlug } = await params
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', projectSlug)
    .single()

  if (!project) notFound()

  const typedProject = project as ProjectRow

  // Solo el builder puede editar su draft
  if (typedProject.builder_id !== authData.user.id) redirect(`/communities/${slug}/projects/${projectSlug}`)

  // Solo se puede editar en estado draft
  if (typedProject.status !== 'draft') notFound()

  const { data: community } = await supabase
    .from('communities')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!community) notFound()

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-8)',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-1)',
            }}
          >
            {community.name}
          </p>
          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            Editar proyecto
          </h1>
        </div>
        <ProjectForm
          communityId={community.id}
          communitySlug={slug}
          projectId={typedProject.id}
          defaultValues={typedProject}
        />
      </div>
    </main>
  )
}
