import Image from 'next/image'
import { ContentTag } from '@/components/shared/ContentTag'
import { UserAvatar } from '@/components/shared/UserAvatar'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProjectDetailAuthorProps {
  authorName: string
}

interface ProjectDetailFeaturedImageProps {
  imageUrls: string[]
  projectTitle: string
}

interface ProjectDetailTargetUserProps {
  targetUser: string | null | undefined
}

interface ProjectDetailDemoProps {
  demoUrl: string | null | undefined
}

interface ProjectDetailFeedbackTopicsProps {
  feedbackTopics: string[] | null | undefined
}

// ---------------------------------------------------------------------------
// Author section — UserAvatar con nombre del perfil
// ---------------------------------------------------------------------------

export function ProjectDetailAuthor({ authorName }: ProjectDetailAuthorProps) {
  return (
    <div data-testid="project-detail-author-avatar">
      <UserAvatar name={authorName} size="sm" showName={true} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Featured image — primera imagen con next/image + priority (LCP)
// Imágenes secundarias sin priority
// ---------------------------------------------------------------------------

export function ProjectDetailFeaturedImage({ imageUrls, projectTitle }: ProjectDetailFeaturedImageProps) {
  if (!imageUrls || imageUrls.length === 0) return null

  const [featuredUrl, ...secondaryUrls] = imageUrls

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Imagen destacada — LCP, priority */}
      <div
        data-testid="project-detail-featured-image"
        style={{
          position: 'relative',
          width: '100%',
          height: '480px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      >
        <Image
          src={featuredUrl}
          alt={`Imagen destacada de ${projectTitle}`}
          fill
          priority
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 960px) 100vw, 960px"
        />
      </div>

      {/* Galería secundaria — sin priority */}
      {secondaryUrls.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          {secondaryUrls.map((url, index) => (
            <div
              key={url}
              style={{
                position: 'relative',
                width: '160px',
                height: '120px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                flexShrink: 0,
              }}
            >
              <Image
                src={url}
                alt={`Imagen ${index + 2} de ${projectTitle}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="160px"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Target user section — renderizado condicional (AC-5)
// ---------------------------------------------------------------------------

export function ProjectDetailTargetUser({ targetUser }: ProjectDetailTargetUserProps) {
  if (!targetUser || targetUser.trim() === '') return null

  return (
    <section
      data-testid="project-detail-section-target-user"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
    >
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
        {targetUser}
      </p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Demo URL section — texto "Ver demo" (AC-6)
// ---------------------------------------------------------------------------

export function ProjectDetailDemo({ demoUrl }: ProjectDetailDemoProps) {
  if (!demoUrl || demoUrl.trim() === '') return null

  return (
    <section
      data-testid="project-detail-section-demo"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
    >
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
        href={demoUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-accent)',
          textDecoration: 'underline',
        }}
      >
        Ver demo
      </a>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Feedback topics section — ContentTag por topic (AC-7)
// ---------------------------------------------------------------------------

export function ProjectDetailFeedbackTopics({ feedbackTopics }: ProjectDetailFeedbackTopicsProps) {
  if (!Array.isArray(feedbackTopics) || feedbackTopics.length === 0) return null

  return (
    <section
      data-testid="project-detail-section-feedback-topics"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
    >
      <h2
        style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
        }}
      >
        Temas de feedback
      </h2>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        {feedbackTopics.map((topic) => (
          <ContentTag key={topic} label={topic} variant="default" />
        ))}
      </div>
    </section>
  )
}
