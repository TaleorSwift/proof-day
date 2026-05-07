// Story 12.4 — Componente presentacional: resumen IA de feedbacks del proyecto

import { Skeleton } from '@/components/ui/skeleton'
import type { AISummary } from '@/lib/types/ai'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AISummaryCardProps {
  summary: AISummary | null
  isLoading?: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Extrae los puntos clave (bullet lines) del campo `content`.
 * Busca líneas que empiecen por `- ` o `• ` (convención de Claude).
 * Devuelve array vacío si no encuentra bullets.
 */
function extractKeyInsights(content: string): string[] {
  const lines = content.split('\n')
  const bullets = lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- ') || line.startsWith('• '))
    .map((line) => line.replace(/^[-•]\s+/, ''))
    .filter((line) => line.length > 0)

  return bullets
}

/**
 * Formatea una fecha ISO como "6 may 2026" en locale español.
 */
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function AISummarySkeleton() {
  return (
    <div
      data-testid="ai-summary-skeleton"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-4)',
      }}
    >
      <Skeleton style={{ height: '16px', width: '60%' }} />
      <Skeleton style={{ height: '16px', width: '100%' }} />
      <Skeleton style={{ height: '16px', width: '80%' }} />
    </div>
  )
}

function AISummaryEmpty() {
  return (
    <div
      data-testid="ai-summary-empty"
      style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          margin: 0,
          lineHeight: 'var(--leading-base)',
        }}
      >
        Tu síntesis aún no está disponible. Se genera automáticamente cuando recibes 3 feedbacks completos.
      </p>
    </div>
  )
}

function AISummaryContent({ summary }: { summary: AISummary }) {
  const insights = extractKeyInsights(summary.content)
  const formattedDate = formatDate(summary.createdAt)

  return (
    <div
      data-testid="ai-summary-card"
      style={{
        backgroundColor: 'var(--color-hypothesis-bg)',
        border: '1px solid var(--color-hypothesis-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-4) var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {/* Banner "Generado por IA" */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span aria-hidden="true">✦</span>
        <span>Generado por IA</span>
      </div>

      {/* Texto principal del resumen */}
      <p
        data-testid="ai-summary-text"
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-primary)',
          margin: 0,
          lineHeight: 'var(--leading-base)',
          whiteSpace: 'pre-line',
        }}
      >
        {summary.content}
      </p>

      {/* Lista de insights — solo si el contenido tiene bullets */}
      {insights.length > 0 && (
        <ul
          data-testid="ai-summary-insights"
          style={{
            margin: 0,
            paddingLeft: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          {insights.map((insight, index) => (
            <li
              key={index}
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-base)',
              }}
            >
              {insight}
            </li>
          ))}
        </ul>
      )}

      {/* Footer: modelo + fecha */}
      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          margin: 0,
          marginTop: 'var(--space-1)',
        }}
      >
        Generado el {formattedDate} · {summary.model}
      </p>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────

/**
 * Muestra el resumen IA de los feedbacks de un proyecto.
 *
 * Tres variantes:
 * - `isLoading=true`: skeleton de 3 líneas
 * - `summary=null, isLoading=false`: mensaje de estado vacío
 * - `summary` existe: card con banner IA, texto, insights opcionales y footer
 *
 * Solo se renderiza en la sidebar del owner (AC5).
 * Los tokens CSS siguen el patrón "en juego" del design system (design-tokens.md).
 */
export function AISummaryCard({ summary, isLoading = false }: AISummaryCardProps) {
  if (isLoading) {
    return <AISummarySkeleton />
  }

  if (summary === null) {
    return <AISummaryEmpty />
  }

  return <AISummaryContent summary={summary} />
}
