import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createProfilesRepository } from '@/lib/repositories/profiles.repository'
import { BackButton } from '@/components/shared/BackButton'
import { StatusBadge } from '@/components/projects/StatusBadge'
import { DraftBanner } from '@/components/projects/DraftBanner'
import { InactiveBanner } from '@/components/projects/InactiveBanner'
import { ProjectStateActions } from '@/components/projects/ProjectStateActions'
import { FeedbackButton } from '@/components/feedback/FeedbackButton'
import { FeedbackList } from '@/components/feedback/FeedbackList'
import { FeedbackCounter } from '@/components/feedback/FeedbackCounter'
import { ProofScoreSidebar } from '@/components/proof-score/ProofScoreSidebar'
import {
  ProjectDetailAuthor,
  ProjectDetailFeaturedImage,
  ProjectDetailTargetUser,
  ProjectDetailDemo,
  ProjectDetailFeedbackTopics,
} from '@/components/projects/ProjectDetailSections'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { slug, id } = await params
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/auth/login')

  const user = authData.user

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, problem, solution, hypothesis, image_urls, status, builder_id, community_id, created_at, updated_at, decision, target_user, demo_url, feedback_topics')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const isOwner = user?.id === project.builder_id

  // Task 3 — Consulta del perfil del autor via ProfilesRepository (AC-2, AC-9)
  const { data: builderProfile } = await createProfilesRepository(supabase).findByIdForWidget(project.builder_id)
  // Fallback: si el builder es el usuario autenticado, usar prefijo del email. Para terceros, usar 'Autor'.
  const authorName = builderProfile?.name
    ?? (isOwner ? (user.email?.split('@')[0] ?? 'Autor') : 'Autor')

  // Count de feedbacks para el Server Component (solo relevante para el builder)
  let feedbackCount = 0
  if (isOwner) {
    const { count } = await supabase
      .from('feedbacks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id)
    feedbackCount = count ?? 0
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
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        {/* Task 4 — BackButton (AC-1) */}
        <div data-testid="project-detail-back-button">
          <BackButton
            href={`/communities/${slug}`}
            label="Volver al feed"
          />
        </div>

        {/* AC-6: Banner draft — solo visible para el builder */}
        {project.status === 'draft' && <DraftBanner />}

        {/* Banner inactivo */}
        {project.status === 'inactive' && <InactiveBanner />}

        {/* Layout principal: contenido + sidebar (owner) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isOwner ? 'minmax(0, 1fr) clamp(280px, 30%, 380px)' : '1fr',
            gap: 'var(--space-8)',
            alignItems: 'start',
          }}
        >
          {/* Columna principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Task 4 — Header refactored (AC-2) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {/* Breadcrumb comunidad */}
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
                  <Link
                    href={`/communities/${slug}`}
                    style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}
                  >
                    Comunidad
                  </Link>
                </p>
                {/* Título + StatusBadge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <h1
                    data-testid="project-detail-title"
                    style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {project.title}
                  </h1>
                  <StatusBadge status={project.status as 'draft' | 'live' | 'inactive'} />
                </div>
                {/* UserAvatar del autor (AC-2, AC-9) */}
                <ProjectDetailAuthor authorName={authorName} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flexShrink: 0 }}>
                {isOwner && project.status === 'draft' && (
                  <Link
                    href={`/communities/${slug}/projects/${id}/edit`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: 'var(--space-2) var(--space-4)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-text-primary)',
                      textDecoration: 'none',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    Editar
                  </Link>
                )}
                {/* AC-1: Boton "Dar feedback" — solo en proyectos live y para no-builders */}
                {project.status === 'live' && !isOwner && (
                  <FeedbackButton
                    projectId={project.id}
                    communityId={project.community_id}
                  />
                )}
              </div>
            </div>

            {/* Acciones de estado — solo para el builder */}
            {isOwner && (
              <ProjectStateActions
                projectId={project.id}
                currentStatus={project.status as 'draft' | 'live' | 'inactive'}
                isBuilder={isOwner}
              />
            )}

            {/* Task 5 — Imagen destacada con next/image (AC-3, AC-10) */}
            <ProjectDetailFeaturedImage
              imageUrls={project.image_urls}
              projectTitle={project.title}
            />

            {/* Problema (AC-4) */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <h2
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Problema
              </h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-base)' }}>
                {project.problem}
              </p>
            </section>

            {/* Solucion (AC-4) */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <h2
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Solucion propuesta
              </h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-base)' }}>
                {project.solution}
              </p>
            </section>

            {/* Hipotesis — patron "en juego" del design system (AC-4) */}
            <section
              style={{
                backgroundColor: 'var(--color-hypothesis-bg)',
                border: '1px solid var(--color-hypothesis-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4) var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <h2
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Hipotesis
              </h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-base)' }}>
                {project.hypothesis}
              </p>
            </section>

            {/* Task — Usuario objetivo (AC-5) */}
            <ProjectDetailTargetUser targetUser={project.target_user} />

            {/* Task 6 — Demo URL con texto "Ver demo" (AC-6) */}
            <ProjectDetailDemo demoUrl={project.demo_url} />

            {/* Task 7 — Temas de feedback con ContentTag (AC-7) */}
            <ProjectDetailFeedbackTopics feedbackTopics={project.feedback_topics} />
          </div>

          {/* Sidebar de feedback — solo para el builder (AC-8) */}
          {isOwner && (
            <aside
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                position: 'sticky',
                top: 'var(--space-8)',
              }}
            >
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <h2
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    Feedback recibido
                  </h2>
                  <FeedbackCounter count={feedbackCount} />
                </div>

                <FeedbackList projectId={project.id} isBuilder={isOwner} />
              </div>

              {/* Proof Score — solo para el builder */}
              <ProofScoreSidebar
                projectId={project.id}
                isBuilder={isOwner}
                feedbackCount={feedbackCount}
                initialDecision={project.decision as import('@/lib/types/projects').ProjectDecision | null}
              />
            </aside>
          )}
        </div>
      </div>
    </main>
  )
}
