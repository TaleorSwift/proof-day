import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createProfilesRepository } from '@/lib/repositories/profiles.repository'
import { BackButton } from '@/components/shared/BackButton'
import { StatusBadge } from '@/components/projects/StatusBadge'
import { DraftBanner } from '@/components/projects/DraftBanner'
import { InactiveBanner } from '@/components/projects/InactiveBanner'
import { ProjectStateActions } from '@/components/projects/ProjectStateActions'
import { FeedbackList } from '@/components/feedback/FeedbackList'
import { FeedbackCounter } from '@/components/feedback/FeedbackCounter'
import { FeedbackQualityStats } from '@/components/feedback/FeedbackQualityStats'
import { AISummaryCard } from '@/components/projects/AISummaryCard'
import { TeamPerspectives } from '@/components/feedback/TeamPerspectives'
import { FeedbackCTA } from '@/components/feedback/FeedbackCTA'
import { FeedbackFormInline } from '@/components/feedback/FeedbackFormInline'
import { createFeedbackRepository } from '@/lib/repositories/feedback.repository'
import type { FeedbackEntryData, FeedbackTextResponses, FeedbackScores } from '@/lib/types/feedback'
import { ProofScoreSidebar } from '@/components/proof-score/ProofScoreSidebar'
import { ValidationSignalCard } from '@/components/proof-score/ValidationSignalCard'
import {
  ProjectDetailAuthor,
  ProjectDetailFeaturedImage,
  ProjectDetailTargetUser,
  ProjectDetailDemo,
  ProjectDetailFeedbackTopics,
} from '@/components/projects/ProjectDetailSections'
import Link from 'next/link'
import { calculateValidationMetrics } from '@/lib/projects/calculateValidationMetrics'
import { aiSummaryFromRow } from '@/lib/types/ai'
import { NewVersionActions } from '@/components/projects/NewVersionActions'
import { IterationHistory } from '@/components/projects/IterationHistory'

interface Props {
  params: Promise<{ slug: string; projectSlug: string }>
  searchParams?: Promise<Record<string, string>>
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProjectPage({ params }: Props) {
  const { slug, projectSlug } = await params
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/login')

  const user = authData.user

  const { data: community } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!community) notFound()

  const { data: project } = await supabase
    .from('projects')
    .select('id, slug, title, tagline, problem, solution, hypothesis, image_urls, status, builder_id, community_id, created_at, updated_at, decision, target_user, demo_url, feedback_topics, custom_question, quality_threshold')
    .eq('community_id', community.id)
    .eq('slug', projectSlug)
    .single()

  if (!project) notFound()

  const isOwner = user?.id === project.builder_id

  // Story 8.10 — variante del CTA de feedback
  const feedbackCTAVariant = isOwner ? 'owner' : 'authenticated-member'

  // Task 3 — Consulta del perfil del autor via ProfilesRepository (AC-2, AC-9)
  const { data: builderProfile } = await createProfilesRepository(supabase).findByIdForWidget(project.builder_id)
  // Fallback: si el builder es el usuario autenticado, usar prefijo del email. Para terceros, usar 'Autor'.
  const authorName = builderProfile?.name
    ?? (isOwner ? (user.email?.split('@')[0] ?? 'Autor') : 'Autor')

  // Query incondicional de feedbacks — visible para todos los miembros (Story 8.9).
  // La RLS policy "member_read_community_feedbacks" (migration 012) garantiza el acceso.
  const feedbackRepo = createFeedbackRepository(supabase)
  const { data: feedbacksRaw } = await feedbackRepo.findByProject(project.id)
  const feedbacks = feedbacksRaw ?? []
  const feedbackCount = feedbacks.length

  // Story 13.6 — Query de iteraciones del proyecto (ordenadas por version_number DESC)
  const { data: iterationRows } = await supabase
    .from('project_iterations')
    .select('id, version_number, published_at')
    .eq('project_id', project.id)
    .order('version_number', { ascending: false })

  // Story 13.6 — Conteo de feedbacks por iteración (agrupado en memoria para evitar
  // problemas con la sintaxis PostgREST feedbacks(count) y foreign keys)
  const { data: feedbackIterationRows } = await supabase
    .from('feedbacks')
    .select('iteration_id')
    .eq('project_id', project.id)
    .not('iteration_id', 'is', null)

  const countByIterationId = (feedbackIterationRows ?? []).reduce<Record<string, number>>(
    (acc, f) => {
      const id = (f as { iteration_id: string }).iteration_id
      if (id) acc[id] = (acc[id] ?? 0) + 1
      return acc
    },
    {}
  )

  // Story 13.6 — Mapeo de iteraciones a IterationSummary
  const iterations = (iterationRows ?? []).map((row) => ({
    id: row.id as string,
    versionNumber: row.version_number as number,
    publishedAt: row.published_at as string,
    feedbackCount: countByIterationId[row.id as string] ?? 0,
  }))

  // Story 13.6 — Iteración más reciente (ya ordenado DESC por version_number)
  const latestIteration = iterations[0] ?? null

  // Story 13.6 — Filtrado de feedbacks para el Proof Score:
  // Con iteraciones: solo feedbacks de la iteración más reciente.
  // Sin iteraciones: todos los feedbacks (comportamiento original).
  const feedbacksForScore = latestIteration
    ? feedbacks.filter((f) => (f as unknown as { iteration_id: string | null }).iteration_id === latestIteration.id)
    : feedbacks

  const feedbackCountForScore = feedbacksForScore.length

  // Mapeo a FeedbackEntryData para TeamPerspectives (presentacional, con scores para pills)
  const feedbackEntries: FeedbackEntryData[] = feedbacks.map((f) => ({
    id: f.id,
    reviewerName: (f.profiles as { name?: string } | null)?.name ?? 'Usuario',
    createdAt: f.created_at,
    textResponses: f.text_responses as unknown as FeedbackTextResponses,
    scores: f.scores != null ? (f.scores as unknown as FeedbackScores) : undefined,
  }))

  // Cálculo de métricas de validación desde feedbacks SSR (para sidebar universal)
  const { understandPercent, wouldUsePercent } = calculateValidationMetrics(feedbacks, feedbackCount)

  // Story 12.4 — Query de ai_summaries (solo para el owner, RLS permite SELECT a autenticados)
  let aiSummary = null
  if (isOwner) {
    const { data: aiSummaryRow } = await supabase
      .from('ai_summaries')
      .select('*')
      .eq('project_id', project.id)
      .maybeSingle()

    aiSummary = aiSummaryRow ? aiSummaryFromRow(aiSummaryRow) : null
  }

  // Regla de visibilidad de la sidebar (story 9.7):
  // - draft + owner: sidebar visible (ve sus controles de gestión)
  // - draft + reviewer: sidebar oculta
  // - live/inactive: sidebar visible para TODOS
  const showSidebar = isOwner || project.status === 'live' || project.status === 'inactive'

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
          maxWidth: 'var(--container-max-width)',
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

        {/* AC-6: Banner draft — visible para cualquier miembro que acceda al proyecto en estado draft */}
        {project.status === 'draft' && <DraftBanner />}

        {/* Banner inactivo */}
        {project.status === 'inactive' && <InactiveBanner />}

        {/* Layout principal: contenido + sidebar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: showSidebar ? 'minmax(0, 1fr) clamp(280px, 30%, 380px)' : '1fr',
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
                {/* Tagline — story 9.7 AC-1 */}
                {project.tagline && (
                  <p
                    data-testid="project-detail-tagline"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      margin: 0,
                      lineHeight: 'var(--leading-base)',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {project.tagline}
                  </p>
                )}
                {/* UserAvatar del autor (AC-2, AC-9) */}
                <ProjectDetailAuthor authorName={authorName} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flexShrink: 0 }}>
                {isOwner && project.status === 'draft' && (
                  <Link
                    href={`/communities/${slug}/projects/${project.slug}/edit`}
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
                {/* AC-1: FeedbackButton delegado a FeedbackCTA (Story 8.10) — eliminado aquí */}

                {/* Story 13.2 — Botón "Nueva versión": visible solo para el Builder en proyecto live */}
                {isOwner && project.status === 'live' && (
                  <NewVersionActions
                    projectId={project.id}
                    initialTitle={project.title ?? ''}
                    initialDescription={[project.problem, project.solution].filter(Boolean).join('\n\n')}
                    initialHypothesis={project.hypothesis ?? ''}
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

            {/* Caption de imagen — story 9.7 AC-1 */}
            {project.image_urls && project.image_urls.length > 0 && (
              <p
                data-testid="project-detail-image-caption"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                  marginTop: 'calc(var(--space-1) * -1)', // visual ajuste tras el gap del flex
                }}
              >
                Usa estas imágenes para dar feedback más preciso.
              </p>
            )}

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
                Solución propuesta
              </h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-base)' }}>
                {project.solution}
              </p>
            </section>

            {/* Hipotesis — story 9.7 AC-1: heading actualizado a "🔬 Hipótesis a validar" */}
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
                🔬 Hipótesis a validar
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

            {/* Story 8.10 — FeedbackCTA contextual: solo en proyectos live para el owner.
                Para reviewers en live, el formulario está en la sidebar (story 9.7).
                El owner ve variant="owner" que retorna null — se mantiene por semántica. */}
            {project.status === 'live' && isOwner && (
              <FeedbackCTA
                variant={feedbackCTAVariant}
                projectId={project.id}
                communityId={project.community_id}
              />
            )}

            {/* Story 13.6 — Historial de versiones: visible para todos si hay iteraciones */}
            <IterationHistory iterations={iterations} />

            {/* Story 8.9 — Perspectivas del equipo: visible para TODOS los miembros */}
            <TeamPerspectives feedbacks={feedbackEntries} />
          </div>

          {/* Sidebar — visible para owner y en proyectos live/inactive (story 9.7) */}
          {showSidebar && (
            <aside
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                position: 'sticky',
                top: 'var(--space-8)',
              }}
            >
              {/* Bloque "Feedback recibido" — solo para el owner */}
              {isOwner && (
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

                  {/* Story 11.3 — stats de completitud + warning de calidad */}
                  <FeedbackQualityStats
                    feedbacks={feedbacks.map((f) => ({
                      qualityScore: (f as unknown as { quality_score: number | null }).quality_score ?? null,
                    }))}
                    qualityThreshold={project.quality_threshold ?? 0.6}
                  />

                  {/* Story 12.4 — Resumen IA de feedbacks (solo owner) */}
                  <AISummaryCard summary={aiSummary} isLoading={false} />

                  <FeedbackList projectId={project.id} isBuilder={isOwner} />
                </div>
              )}

              {/* ValidationSignalCard — visible solo para no-owner (owner la recibe via ProofScoreSidebar) */}
              {!isOwner && (
                <div
                  style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <ValidationSignalCard
                    understandPercent={understandPercent}
                    wouldUsePercent={wouldUsePercent}
                    feedbackCount={feedbackCount}
                  />
                </div>
              )}

              {/* Contenido de la sidebar según rol y status */}
              {isOwner ? (
                /* Owner: ProofScoreSidebar con DecisionDialog
                   Story 13.6: feedbackCountForScore usa solo feedbacks de la iteración más reciente
                   (o todos si no hay iteraciones) */
                <ProofScoreSidebar
                  projectId={project.id}
                  isBuilder={isOwner}
                  feedbackCount={feedbackCountForScore}
                  initialDecision={project.decision as import('@/lib/types/projects').ProjectDecision | null}
                />
              ) : project.status === 'live' ? (
                /* Reviewer en proyecto live: FeedbackFormInline */
                <div
                  style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <FeedbackFormInline
                    projectId={project.id}
                    communityId={project.community_id}
                    hypothesis={project.hypothesis ?? undefined}
                    customQuestion={project.custom_question ?? undefined}
                  />
                </div>
              ) : (
                /* Reviewer en proyecto inactive: mensaje de cierre */
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    fontStyle: 'italic',
                    margin: 0,
                    padding: 'var(--space-2) 0',
                  }}
                >
                  Esta idea ya no acepta feedback.
                </p>
              )}
            </aside>
          )}
        </div>
      </div>
    </main>
  )
}
