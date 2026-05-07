// @vitest-environment jsdom
// Story 12.4 — Tests TDD Outside-In para AISummaryCard

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { AISummaryCard } from '@/components/projects/AISummaryCard'
import type { AISummary } from '@/lib/types/ai'

// ── Fixture ────────────────────────────────────────────────────────────────────

const summaryWithInsights: AISummary = {
  id: 'summary-1',
  projectId: 'project-1',
  content:
    'Este proyecto aborda un problema real de validación de ideas.\n\n**Puntos clave:**\n- Proceso claro y bien estructurado\n- UI intuitiva para el usuario\n- Falta integración con herramientas existentes\n\n**Recomendación:** Continuar con el MVP.',
  feedbackCountAtGeneration: 5,
  model: 'claude-sonnet-4-6',
  createdAt: '2026-05-06T10:00:00Z',
  updatedAt: '2026-05-06T10:00:00Z',
}

const summaryWithoutInsights: AISummary = {
  id: 'summary-2',
  projectId: 'project-2',
  content: 'Resumen sin bullets ni puntos clave destacados. Texto plano continuo.',
  feedbackCountAtGeneration: 3,
  model: 'claude-sonnet-4-6',
  createdAt: '2026-05-06T10:00:00Z',
  updatedAt: '2026-05-06T10:00:00Z',
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AISummaryCard — estado loading', () => {
  it('muestra el skeleton cuando isLoading=true', () => {
    render(<AISummaryCard summary={null} isLoading={true} />)
    expect(screen.getByTestId('ai-summary-skeleton')).toBeInTheDocument()
  })

  it('no muestra el contenido real cuando isLoading=true', () => {
    render(<AISummaryCard summary={summaryWithInsights} isLoading={true} />)
    expect(screen.queryByTestId('ai-summary-card')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ai-summary-empty')).not.toBeInTheDocument()
  })

  it('no muestra el estado vacío cuando isLoading=true', () => {
    render(<AISummaryCard summary={null} isLoading={true} />)
    expect(screen.queryByTestId('ai-summary-empty')).not.toBeInTheDocument()
  })
})

describe('AISummaryCard — estado vacío (summary=null)', () => {
  it('muestra el estado vacío cuando summary=null e isLoading=false', () => {
    render(<AISummaryCard summary={null} isLoading={false} />)
    expect(screen.getByTestId('ai-summary-empty')).toBeInTheDocument()
  })

  it('muestra el mensaje de estado vacío correcto', () => {
    render(<AISummaryCard summary={null} isLoading={false} />)
    expect(
      screen.getByText(
        'Tu síntesis aún no está disponible. Se genera automáticamente cuando recibes 3 feedbacks completos.'
      )
    ).toBeInTheDocument()
  })

  it('no muestra ai-summary-card cuando summary=null', () => {
    render(<AISummaryCard summary={null} isLoading={false} />)
    expect(screen.queryByTestId('ai-summary-card')).not.toBeInTheDocument()
  })

  it('no muestra ai-summary-text cuando summary=null', () => {
    render(<AISummaryCard summary={null} isLoading={false} />)
    expect(screen.queryByTestId('ai-summary-text')).not.toBeInTheDocument()
  })

  it('no muestra ai-summary-insights cuando summary=null', () => {
    render(<AISummaryCard summary={null} isLoading={false} />)
    expect(screen.queryByTestId('ai-summary-insights')).not.toBeInTheDocument()
  })

  it('no muestra el skeleton cuando summary=null e isLoading=false', () => {
    render(<AISummaryCard summary={null} isLoading={false} />)
    expect(screen.queryByTestId('ai-summary-skeleton')).not.toBeInTheDocument()
  })
})

describe('AISummaryCard — estado con datos', () => {
  it('muestra ai-summary-card cuando hay datos', () => {
    render(<AISummaryCard summary={summaryWithInsights} isLoading={false} />)
    expect(screen.getByTestId('ai-summary-card')).toBeInTheDocument()
  })

  it('muestra el banner "Generado por IA"', () => {
    render(<AISummaryCard summary={summaryWithInsights} isLoading={false} />)
    expect(screen.getByText('Generado por IA')).toBeInTheDocument()
  })

  it('muestra el texto del resumen en ai-summary-text', () => {
    render(<AISummaryCard summary={summaryWithInsights} isLoading={false} />)
    const textEl = screen.getByTestId('ai-summary-text')
    expect(textEl).toBeInTheDocument()
    expect(textEl.textContent).toBeTruthy()
  })

  it('muestra ai-summary-insights cuando hay bullets en el contenido', () => {
    render(<AISummaryCard summary={summaryWithInsights} isLoading={false} />)
    expect(screen.getByTestId('ai-summary-insights')).toBeInTheDocument()
  })

  it('renderiza los insights como lista <ul>', () => {
    render(<AISummaryCard summary={summaryWithInsights} isLoading={false} />)
    const insightsEl = screen.getByTestId('ai-summary-insights')
    expect(insightsEl.tagName).toBe('UL')
  })

  it('renderiza al menos un <li> de insight', () => {
    render(<AISummaryCard summary={summaryWithInsights} isLoading={false} />)
    const insightsEl = screen.getByTestId('ai-summary-insights')
    const items = insightsEl.querySelectorAll('li')
    expect(items.length).toBeGreaterThan(0)
  })

  it('muestra el modelo usado en el footer', () => {
    render(<AISummaryCard summary={summaryWithInsights} isLoading={false} />)
    expect(screen.getByText(/claude-sonnet-4-6/)).toBeInTheDocument()
  })

  it('muestra la fecha en el footer', () => {
    render(<AISummaryCard summary={summaryWithInsights} isLoading={false} />)
    // La fecha 2026-05-06 formateada debe estar presente
    expect(screen.getByText(/6 may 2026/i)).toBeInTheDocument()
  })

  it('no muestra el skeleton cuando hay datos', () => {
    render(<AISummaryCard summary={summaryWithInsights} isLoading={false} />)
    expect(screen.queryByTestId('ai-summary-skeleton')).not.toBeInTheDocument()
  })

  it('no muestra el estado vacío cuando hay datos', () => {
    render(<AISummaryCard summary={summaryWithInsights} isLoading={false} />)
    expect(screen.queryByTestId('ai-summary-empty')).not.toBeInTheDocument()
  })
})

describe('AISummaryCard — contenido sin insights (sin bullets)', () => {
  it('no muestra ai-summary-insights si no hay bullets en el contenido', () => {
    render(<AISummaryCard summary={summaryWithoutInsights} isLoading={false} />)
    expect(screen.queryByTestId('ai-summary-insights')).not.toBeInTheDocument()
  })

  it('sí muestra ai-summary-card aunque no haya insights', () => {
    render(<AISummaryCard summary={summaryWithoutInsights} isLoading={false} />)
    expect(screen.getByTestId('ai-summary-card')).toBeInTheDocument()
  })
})

describe('AISummaryCard — isLoading por defecto', () => {
  it('muestra estado vacío si isLoading no se pasa y summary=null (default false)', () => {
    render(<AISummaryCard summary={null} />)
    expect(screen.getByTestId('ai-summary-empty')).toBeInTheDocument()
  })
})
