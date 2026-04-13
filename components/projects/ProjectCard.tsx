'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { HeartButton } from '@/components/shared/HeartButton'
import { StatusBadge } from '@/components/projects/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { buildProjectUrl, formatFeedbackCount, computeLikeState } from '@/lib/utils/projectCard'
import type { ProjectStatus } from '@/lib/types/projects'

export interface ProjectCardProps {
  project: {
    id: string
    title: string
    imageUrls: string[]
    status: ProjectStatus
    builderId: string
    /** Descripción breve — campo `problem` del proyecto */
    problem?: string
    /** Tagline corto (prioridad sobre problem) */
    tagline?: string | null
    /** Número de personas que usarían el proyecto */
    wouldUseCount?: number
    /** Nombre legible del builder (de profiles.name) */
    builderName?: string
  }
  communitySlug: string
  feedbackCount?: number
  initialLikeCount?: number
  /** Modo skeleton — mantiene compatibilidad con ProjectGrid */
  isLoading?: boolean
}

export function ProjectCard({
  project,
  communitySlug,
  feedbackCount = 0,
  initialLikeCount = 0,
  isLoading = false,
}: ProjectCardProps) {
  const [likeState, setLikeState] = useState({
    isActive: false,
    count: initialLikeCount,
  })

  const handleLike = () => setLikeState((prev) => computeLikeState(prev))

  if (isLoading) {
    return (
      <div
        data-testid="project-card"
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          animation: 'pulse 2s infinite',
        }}
      >
        <div style={{ width: 96, height: 64, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-hypothesis-bg)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ height: 16, width: '60%', backgroundColor: 'var(--color-hypothesis-bg)', borderRadius: 4 }} />
          <div style={{ height: 12, width: '40%', backgroundColor: 'var(--color-hypothesis-bg)', borderRadius: 4 }} />
        </div>
      </div>
    )
  }

  const imageSrc = project.imageUrls[0] ?? null
  const builderLabel = project.builderName ?? project.builderId.slice(0, 8)
  const projectUrl = buildProjectUrl(communitySlug, project.id)

  return (
    <div
      data-testid="project-card"
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        transition: 'box-shadow 150ms ease',
        cursor: 'pointer',
      }}
      className="hover:shadow-md"
    >
      {/* Thumbnail */}
      <Link
        href={projectUrl}
        style={{ textDecoration: 'none', flexShrink: 0 }}
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          data-testid="project-card-thumbnail"
          style={{
            width: 96,
            height: 64,
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: 'var(--color-hypothesis-bg)',
            flexShrink: 0,
          }}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={project.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div
              data-testid="project-card-placeholder"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, var(--color-hypothesis-bg) 0%, var(--color-hypothesis-border) 100%)',
              }}
            />
          )}
        </div>
      </Link>

      {/* Info central */}
      <Link
        href={projectUrl}
        style={{ flex: 1, minWidth: 0, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
      >
        {/* Título + StatusBadge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <p
            data-testid="project-card-title"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0,
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.title}
          </p>
          <span data-testid="project-card-status">
            <StatusBadge status={project.status} />
          </span>
        </div>

        {/* Tagline — prioridad sobre problem, 1 línea */}
        {(project.tagline || project.problem) && (
          <p
            data-testid="project-card-tagline"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.tagline ?? project.problem}
          </p>
        )}

        {/* Fila inferior: autor + feedback count + would-use count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'auto' }}>
          <UserAvatar name={builderLabel} size="sm" showName={false} />
          <span
            data-testid="project-card-author-name"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-medium)',
            }}
          >
            {builderLabel}
          </span>
          <span
            data-testid="project-card-feedback-count"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
          >
            {formatFeedbackCount(feedbackCount)}
          </span>
          {(project.wouldUseCount ?? 0) > 0 && (
            <span
              data-testid="project-card-would-use-count"
              style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
            >
              · {project.wouldUseCount} lo usarían
            </span>
          )}
        </div>
      </Link>

      {/* HeartButton */}
      <div
        style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <HeartButton
          count={likeState.count}
          isActive={likeState.isActive}
          onClick={handleLike}
        />
      </div>
    </div>
  )
}
