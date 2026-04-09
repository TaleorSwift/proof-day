import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DraftBanner } from '@/components/projects/DraftBanner'
import { StatusBadge } from '@/components/projects/StatusBadge'
import { InactiveBanner } from '@/components/projects/InactiveBanner'
import { ProjectStateActions } from '@/components/projects/ProjectStateActions'
import { FeedbackButton } from '@/components/feedback/FeedbackButton'
import { FeedbackList } from '@/components/feedback/FeedbackList'
import { FeedbackCounter } from '@/components/feedback/FeedbackCounter'
import { ProofScoreSidebar } from '@/components/proof-score/ProofScoreSidebar'

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
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
                  <Link
                    href={`/communities/${slug}`}
                    style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}
                  >
                    Comunidad
                  </Link>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <h1
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

            {/* Problema */}
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

            {/* Solucion */}
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

            {/* Hipotesis — patron "en juego" del design system */}
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

            {/* Usuario objetivo — Story 8.1 */}
            {project.target_user && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <h2
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Usuario objetivo
                </h2>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-base)' }}>
                  {project.target_user}
                </p>
              </section>
            )}

            {/* URL de demo — Story 8.1 */}
            {project.demo_url && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <h2
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Demo
                </h2>
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-accent)',
                    wordBreak: 'break-all',
                  }}
                >
                  {project.demo_url}
                </a>
              </section>
            )}

            {/* Temas de feedback — Story 8.1 */}
            {Array.isArray(project.feedback_topics) && project.feedback_topics.length > 0 && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <h2
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Temas de feedback
                </h2>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-2)',
                  }}
                >
                  {project.feedback_topics.map(topic => (
                    <li
                      key={topic}
                      style={{
                        padding: 'var(--space-1) var(--space-3)',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Imagenes */}
            {project.image_urls.length > 0 && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <h2
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Imagenes
                </h2>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}
                >
                  {project.image_urls.map((url: string, i: number) => (
                    <li key={i}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Imagen ${i + 1} del proyecto`}
                        style={{
                          width: '100%',
                          maxHeight: '400px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar de feedback — solo para el builder */}
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
