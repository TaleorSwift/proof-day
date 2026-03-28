'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/projects/StatusBadge'
import { DecisionBadge } from '@/components/projects/DecisionBadge'
import type { ProjectDecision, ProjectStatus } from '@/lib/types/projects'

type ProofScoreValue = 'Promising' | 'Needs iteration' | 'Weak'

const PROOF_SCORE_CONFIG: Record<ProofScoreValue, { label: string; colorClass: string }> = {
  'Promising':       { label: 'Promising',       colorClass: 'text-[--color-promising-text] bg-[--color-promising-bg]' },
  'Needs iteration': { label: 'Needs iteration', colorClass: 'text-[--color-needs-text] bg-[--color-needs-bg]' },
  'Weak':            { label: 'Weak',            colorClass: 'text-[--color-weak-text] bg-[--color-weak-bg]' },
}

export interface ProjectCardProps {
  project: {
    id: string
    title: string
    imageUrls: string[]
    status: ProjectStatus
    builderId: string
  }
  communitySlug: string
  feedbackCount?: number
  proofScore?: ProofScoreValue | null
  decision?: ProjectDecision | null
  isLoading?: boolean
}

export function ProjectCard({
  project,
  communitySlug,
  feedbackCount = 0,
  proofScore = null,
  decision = null,
  isLoading = false,
}: ProjectCardProps) {
  // Skeleton loading state
  if (isLoading) {
    return (
      <Card
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <Skeleton className="aspect-video w-full rounded-none" />
        <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Card>
    )
  }

  const imageSrc = project.imageUrls[0] ?? '/placeholder-project.png'
  const isDraft = project.status === 'draft'
  const isInactive = project.status === 'inactive'

  return (
    <Link
      href={`/communities/${communitySlug}/projects/${project.id}`}
      style={{ display: 'block', textDecoration: 'none' }}
    >
      <Card
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          opacity: isDraft ? 0.8 : 1,
          transition: 'box-shadow 150ms ease, opacity 150ms ease',
          cursor: 'pointer',
        }}
        className="hover:shadow-md"
      >
        {/* Imagen destacada */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '16/9',
            overflow: 'hidden',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          }}
        >
          <Image
            src={imageSrc}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          {/* Overlay sutil para inactivos */}
          {isInactive && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(26, 26, 24, 0.15)',
              }}
            />
          )}
        </div>

        <CardContent style={{ padding: 'var(--space-4)' }}>
          {/* Título */}
          <p
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-base)',
              marginBottom: 'var(--space-2)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.title}
          </p>

          {/* Decision Badge — compact, bajo el titulo */}
          {decision !== null && decision !== undefined && (
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <DecisionBadge decision={decision} compact />
            </div>
          )}

          {/* Fila: StatusBadge + contador feedbacks */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
            }}
          >
            <StatusBadge status={project.status} />
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              {feedbackCount} {feedbackCount === 1 ? 'feedback' : 'feedbacks'}
            </span>
          </div>

          {/* Proof Score Badge (compact) — solo si tiene valor */}
          {proofScore !== null && proofScore !== undefined && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              <Badge
                className={PROOF_SCORE_CONFIG[proofScore].colorClass}
                variant="outline"
                style={{ border: 'none', fontSize: 'var(--text-xs)' }}
              >
                {PROOF_SCORE_CONFIG[proofScore].label}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
