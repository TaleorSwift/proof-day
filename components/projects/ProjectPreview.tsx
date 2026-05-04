'use client'

// Story 10.4 — Paso 5 del wizard: vista previa read-only antes de publicar

import type { WizardFormData } from '@/components/projects/ProjectWizard'

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  data: WizardFormData
  templateName?: string
  onEdit: () => void
  onPublish: () => void
  isPublishing?: boolean
}

// ── ProjectPreview ────────────────────────────────────────────────────────────

export function ProjectPreview({
  data,
  templateName,
  onEdit,
  onPublish,
  isPublishing = false,
}: Props) {
  const { title, tagline, problem, solution, hypothesis } = data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      {/* Banner "Así verán tu proyecto los Reviewers" — patrón "En Juego" */}
      <div
        data-testid="preview-reviewer-banner"
        style={{
          backgroundColor: 'var(--color-hypothesis-bg)',
          border: '1px solid var(--color-hypothesis-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Así verán tu proyecto los Reviewers
        </span>
      </div>

      {/* Tarjeta de preview del proyecto */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
        }}
      >
        {/* Pill de template */}
        {templateName && (
          <div>
            <span
              data-testid="preview-template-pill"
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-border)',
                borderRadius: 'var(--radius-full)',
                padding: 'var(--space-1) var(--space-3)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {templateName}
            </span>
          </div>
        )}

        {/* Título */}
        <div>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              margin: '0 0 var(--space-1)',
              fontWeight: 'var(--font-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Título
          </p>
          <p
            data-testid="preview-title"
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {title}
          </p>
        </div>

        {/* Tagline */}
        <div>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              margin: '0 0 var(--space-1)',
              fontWeight: 'var(--font-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Tagline
          </p>
          <p
            data-testid="preview-tagline"
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            {tagline}
          </p>
        </div>

        {/* Problema */}
        <div>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              margin: '0 0 var(--space-1)',
              fontWeight: 'var(--font-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Problema
          </p>
          <p
            data-testid="preview-problem"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              margin: 0,
              lineHeight: 'var(--leading-base)',
            }}
          >
            {problem}
          </p>
        </div>

        {/* Solución */}
        <div>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              margin: '0 0 var(--space-1)',
              fontWeight: 'var(--font-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Solución
          </p>
          <p
            data-testid="preview-solution"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              margin: 0,
              lineHeight: 'var(--leading-base)',
            }}
          >
            {solution}
          </p>
        </div>

        {/* Hipótesis — solo si tiene contenido */}
        {hypothesis && hypothesis.trim().length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--color-hypothesis-bg)',
              border: '1px solid var(--color-hypothesis-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-3)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                margin: '0 0 var(--space-1)',
                fontWeight: 'var(--font-medium)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Hipótesis a validar
            </p>
            <p
              data-testid="preview-hypothesis"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                margin: 0,
                lineHeight: 'var(--leading-base)',
              }}
            >
              {hypothesis}
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--space-3)',
          paddingTop: 'var(--space-2)',
        }}
      >
        <button
          type="button"
          data-testid="preview-edit-btn"
          onClick={onEdit}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'transparent',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
          }}
        >
          Editar
        </button>

        <button
          type="button"
          data-testid="preview-publish-btn"
          onClick={onPublish}
          disabled={isPublishing}
          style={{
            padding: 'var(--space-2) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: isPublishing ? 'var(--color-border)' : 'var(--color-accent)',
            color: isPublishing ? 'var(--color-text-muted)' : 'white',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            cursor: isPublishing ? 'not-allowed' : 'pointer',
            height: '40px',
            opacity: isPublishing ? 0.7 : 1,
          }}
        >
          {isPublishing ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  )
}
