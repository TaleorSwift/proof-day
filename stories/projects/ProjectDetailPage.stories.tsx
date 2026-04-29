import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'
import { BackButton } from '@/components/shared/BackButton'
import { StatusBadge } from '@/components/projects/StatusBadge'
import { DraftBanner } from '@/components/projects/DraftBanner'
import { InactiveBanner } from '@/components/projects/InactiveBanner'
import { ProjectStateActions } from '@/components/projects/ProjectStateActions'
import { FeedbackList } from '@/components/feedback/FeedbackList'
import { FeedbackFormInline } from '@/components/feedback/FeedbackFormInline'
import { ValidationSignalCard } from '@/components/proof-score/ValidationSignalCard'
import { ProofScoreSidebar } from '@/components/proof-score/ProofScoreSidebar'
import { TeamPerspectives } from '@/components/feedback/TeamPerspectives'
import { FeedbackCounter } from '@/components/feedback/FeedbackCounter'
import {
  ProjectDetailAuthor,
  ProjectDetailFeaturedImage,
  ProjectDetailTargetUser,
  ProjectDetailDemo,
  ProjectDetailFeedbackTopics,
} from '@/components/projects/ProjectDetailSections'
import Link from 'next/link'
import type { FeedbackEntryData } from '@/lib/types/feedback'

// ---------------------------------------------------------------------------
// Datos de muestra
// ---------------------------------------------------------------------------

const COMMUNITY_SLUG = 'producto-alpha'
const PROJECT_SLUG = 'pulse-check'

const sampleFeedbackEntries: FeedbackEntryData[] = [
  {
    id: 'fb-1',
    reviewerName: 'Carlos López',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    textResponses: {
      p1: 'El problema es muy real. He visto burnout invisible en equipos remotos.',
      p2: 'Definitivamente lo usaría para mi equipo.',
      p3: 'Técnicamente viable con las herramientas existentes.',
      p4: 'Añadiría integración con Slack para el contexto de los equipos.',
    },
    scores: { p1: 3, p2: 3, p3: 2 },
  },
  {
    id: 'fb-2',
    reviewerName: 'Ana García',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    textResponses: {
      p4: 'Mejoraría la experiencia de onboarding para managers nuevos.',
    },
    scores: { p1: 2, p2: 2, p3: 3 },
  },
]

// ---------------------------------------------------------------------------
// Wrapper de pantalla completa (simula el layout del Server Component)
// ---------------------------------------------------------------------------

interface ProjectDetailLayoutProps {
  communitySlug: string
  projectSlug: string
  title: string
  tagline: string | null
  problem: string
  solution: string
  hypothesis: string
  imageUrls: string[]
  targetUser: string | null
  demoUrl: string | null
  feedbackTopics: string[] | null
  status: 'draft' | 'live' | 'inactive'
  authorName: string
  isOwner: boolean
  projectId: string
  communityId: string
  feedbackEntries: FeedbackEntryData[]
  feedbackCount: number
  understandPercent: number
  wouldUsePercent: number
  initialDecision?: 'iterate' | 'scale' | 'abandon' | null
}

function ProjectDetailLayout({
  communitySlug,
  title,
  tagline,
  problem,
  solution,
  hypothesis,
  imageUrls,
  targetUser,
  demoUrl,
  feedbackTopics,
  status,
  authorName,
  isOwner,
  projectId,
  communityId,
  feedbackEntries,
  feedbackCount,
  understandPercent,
  wouldUsePercent,
  initialDecision = null,
}: ProjectDetailLayoutProps) {
  // Regla de visibilidad de la sidebar (story 9.7)
  const showSidebar = isOwner || status === 'live' || status === 'inactive'

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
          maxWidth: 'var(--container-max-width, 960px)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        {/* BackButton */}
        <div data-testid='project-detail-back-button'>
          <BackButton
            href={`/communities/${communitySlug}`}
            label='Volver al feed'
          />
        </div>

        {/* Banners */}
        {status === 'draft' && <DraftBanner />}
        {status === 'inactive' && <InactiveBanner />}

        {/* Layout principal */}
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
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
                  <Link href={`/communities/${communitySlug}`} style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>
                    Comunidad
                  </Link>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <h1
                    data-testid='project-detail-title'
                    style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {title}
                  </h1>
                  <StatusBadge status={status} />
                </div>
                {tagline && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
                    {tagline}
                  </p>
                )}
                <ProjectDetailAuthor authorName={authorName} />
              </div>
              {isOwner && status === 'draft' && (
                <Link
                  href={`/communities/${communitySlug}/projects/${projectId}/edit`}
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
                  }}
                >
                  Editar
                </Link>
              )}
            </div>

            {/* Acciones de estado — solo para el builder */}
            {isOwner && (
              <ProjectStateActions
                projectId={projectId}
                currentStatus={status}
                isBuilder={isOwner}
              />
            )}

            <ProjectDetailFeaturedImage imageUrls={imageUrls} projectTitle={title} />

            {/* Secciones de contenido */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>Problema</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-base)' }}>{problem}</p>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>Solución propuesta</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-base)' }}>{solution}</p>
            </section>

            <section style={{
              backgroundColor: 'var(--color-hypothesis-bg)',
              border: '1px solid var(--color-hypothesis-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-4) var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
                🔬 Hipótesis a validar
              </h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-base)' }}>{hypothesis}</p>
            </section>

            <ProjectDetailTargetUser targetUser={targetUser} />
            <ProjectDetailDemo demoUrl={demoUrl} />
            <ProjectDetailFeedbackTopics feedbackTopics={feedbackTopics} />

            {/* Perspectivas del equipo */}
            <TeamPerspectives feedbacks={feedbackEntries} />
          </div>

          {/* Sidebar */}
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
                <div style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>
                      Feedback recibido
                    </h2>
                    <FeedbackCounter count={feedbackCount} />
                  </div>
                  <FeedbackList projectId={projectId} isBuilder={isOwner} />
                </div>
              )}

              {/* ValidationSignalCard — solo para no-owner */}
              {!isOwner && (
                <div style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <ValidationSignalCard
                    understandPercent={understandPercent}
                    wouldUsePercent={wouldUsePercent}
                    feedbackCount={feedbackCount}
                  />
                </div>
              )}

              {/* Contenido sidebar según rol y status */}
              {isOwner ? (
                <ProofScoreSidebar
                  projectId={projectId}
                  isBuilder={isOwner}
                  feedbackCount={feedbackCount}
                  initialDecision={initialDecision}
                />
              ) : status === 'live' ? (
                <div style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <FeedbackFormInline projectId={projectId} communityId={communityId} />
                </div>
              ) : (
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  fontStyle: 'italic',
                  margin: 0,
                  padding: 'var(--space-2) 0',
                }}>
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

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Projects/ProjectDetailPage',
  component: ProjectDetailLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProjectDetailLayout>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Datos base compartidos
// ---------------------------------------------------------------------------

const baseProjectData = {
  communitySlug: COMMUNITY_SLUG,
  projectSlug: PROJECT_SLUG,
  projectId: 'proj-001',
  communityId: 'comm-001',
  title: 'Pulse Check',
  tagline: 'Anonymous weekly mood tracking for distributed teams',
  problem: 'Remote teams struggle to surface burnout and morale issues before they escalate.',
  solution: 'A lightweight weekly pulse survey with trend visualization for team leads.',
  hypothesis: 'If team leads see mood trends weekly, they will intervene 2x faster on morale dips.',
  imageUrls: ['https://picsum.photos/seed/pulse-check/800/500'],
  targetUser: 'Engineering managers with 5+ remote reports',
  demoUrl: 'https://example.com/pulse-demo',
  feedbackTopics: ['Problem clarity', 'Willingness to use', 'Missing features'],
  authorName: 'Alex Builder',
  feedbackEntries: sampleFeedbackEntries,
  feedbackCount: 2,
  understandPercent: 75,
  wouldUsePercent: 50,
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const OwnerLive: Story = {
  name: 'Owner — Live (FeedbackList visible, sin FeedbackFormInline)',
  args: {
    ...baseProjectData,
    status: 'live',
    isOwner: true,
    initialDecision: null,
  },
}

export const OwnerDraft: Story = {
  name: 'Owner — Draft (DraftBanner + ProjectStateActions visibles)',
  args: {
    ...baseProjectData,
    status: 'draft',
    isOwner: true,
    feedbackCount: 0,
    feedbackEntries: [],
    understandPercent: 0,
    wouldUsePercent: 0,
    initialDecision: null,
  },
}

export const ReviewerLive: Story = {
  name: 'Reviewer — Live (FeedbackFormInline en sidebar, sin FeedbackList owner)',
  args: {
    ...baseProjectData,
    status: 'live',
    isOwner: false,
    initialDecision: null,
  },
}

export const ReviewerInactive: Story = {
  name: 'Reviewer — Inactive (mensaje "ya no acepta feedback")',
  args: {
    ...baseProjectData,
    status: 'inactive',
    isOwner: false,
    initialDecision: null,
  },
}

export const ReviewerDraft: Story = {
  name: 'Reviewer — Draft (sin sidebar)',
  args: {
    ...baseProjectData,
    status: 'draft',
    isOwner: false,
    feedbackCount: 0,
    feedbackEntries: [],
    understandPercent: 0,
    wouldUsePercent: 0,
    initialDecision: null,
  },
}
