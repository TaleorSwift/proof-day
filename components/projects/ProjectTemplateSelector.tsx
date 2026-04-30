'use client'

// Story 10.2 — T1: Selector de tipo de proyecto

import { Rocket, Puzzle, Settings, Package, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ProjectTemplate } from '@/lib/types/templates'

// ── Icono por tipo de template ──────────────────────────────────────────────

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  saas: Rocket,
  feature: Puzzle,
  internal_process: Settings,
  physical_product: Package,
  service: Users,
}

function getTemplateIcon(type: string): LucideIcon {
  return TEMPLATE_ICONS[type] ?? Rocket
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  templates: ProjectTemplate[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

// ── TemplateCard ─────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: ProjectTemplate
  isSelected: boolean
  onSelect: (id: string) => void
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const Icon = getTemplateIcon(template.type)

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(template.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--space-2)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: isSelected
          ? '2px solid var(--color-accent)'
          : '1px solid var(--color-border)',
        backgroundColor: isSelected
          ? 'var(--color-hypothesis-bg)'
          : 'var(--color-surface)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s, background-color 0.15s',
        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
        width: '100%',
      }}
    >
      <Icon
        size={20}
        aria-hidden="true"
        style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
      />
      <span
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--leading-sm)',
        }}
      >
        {template.name}
      </span>
      {/* HIGH-1: AC-1 — descripción corta usando reviewerContext (Story 10.2 CR fix) */}
      {template.reviewerContext && (
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--leading-xs)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {template.reviewerContext}
        </span>
      )}
    </button>
  )
}

// ── SkipButton ───────────────────────────────────────────────────────────────

interface SkipButtonProps {
  isSelected: boolean
  onSelect: () => void
}

function SkipButton({ isSelected, onSelect }: SkipButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-4)',
        borderRadius: 'var(--radius-full)',
        border: isSelected
          ? '2px solid var(--color-accent)'
          : '1px solid var(--color-border)',
        backgroundColor: isSelected ? 'var(--color-hypothesis-bg)' : 'transparent',
        cursor: 'pointer',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      Sin tipo
    </button>
  )
}

// ── ProjectTemplateSelector ──────────────────────────────────────────────────

export function ProjectTemplateSelector({ templates, selectedId, onSelect }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {/* Grid de templates */}
      {templates.length > 0 && (
        <div
          className="template-grid"
          data-testid="template-grid"
        >
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedId === template.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {/* Opción "Sin tipo" */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          paddingTop: templates.length > 0 ? 'var(--space-1)' : '0',
        }}
      >
        <SkipButton
          isSelected={selectedId === null}
          onSelect={() => onSelect(null)}
        />
      </div>
    </div>
  )
}
