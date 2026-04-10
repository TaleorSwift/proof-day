// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { FeedbackEntry } from '@/components/feedback/FeedbackEntry'
import type { FeedbackEntryData } from '@/lib/types/feedback'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_ENTRY: FeedbackEntryData = {
  id: 'entry-1',
  reviewerName: 'Ana García',
  createdAt: '2026-04-10T10:00:00Z',
  textResponses: {
    p4: 'Mejoraría la onboarding para nuevos usuarios.',
  },
}

const ENTRY_WITH_ALL_RESPONSES: FeedbackEntryData = {
  id: 'entry-2',
  reviewerName: 'Carlos López',
  createdAt: '2026-04-09T15:30:00Z',
  textResponses: {
    p1: 'Sí, el problema es muy real en startups.',
    p2: 'Definitivamente la usaría.',
    p3: 'Técnicamente es viable con las herramientas actuales.',
    p4: 'Añadiría integración con Slack.',
  },
}

const ENTRY_WITH_BADGE: FeedbackEntryData = {
  id: 'entry-3',
  reviewerName: 'María Torres',
  createdAt: '2026-04-08T09:00:00Z',
  textResponses: {
    p4: 'Excelente propuesta de valor.',
  },
  contributorType: 'top-reviewer',
}

const ENTRY_WITH_EMPTY_OPTIONAL: FeedbackEntryData = {
  id: 'entry-4',
  reviewerName: 'Juan Pérez',
  createdAt: '2026-04-07T12:00:00Z',
  textResponses: {
    p1: '',
    p2: undefined,
    p4: 'Campo obligatorio con contenido.',
  },
}

// ---------------------------------------------------------------------------
// Suite: FeedbackEntry
// ---------------------------------------------------------------------------

describe('FeedbackEntry — nombre del reviewer', () => {
  it('muestra el nombre del reviewer', () => {
    render(<FeedbackEntry data={BASE_ENTRY} />)
    expect(screen.getByText('Ana García')).toBeInTheDocument()
  })

  it('muestra el nombre del reviewer en entrada con badge', () => {
    render(<FeedbackEntry data={ENTRY_WITH_BADGE} />)
    expect(screen.getByText('María Torres')).toBeInTheDocument()
  })
})

describe('FeedbackEntry — UserAvatar', () => {
  it('renderiza UserAvatar con el nombre del reviewer', () => {
    render(<FeedbackEntry data={BASE_ENTRY} />)
    // UserAvatar renderiza un div con role="img" y aria-label="Avatar de {name}"
    expect(screen.getByRole('img', { name: 'Avatar de Ana García' })).toBeInTheDocument()
  })
})

describe('FeedbackEntry — respuestas de texto', () => {
  it('renderiza p4 cuando tiene valor', () => {
    render(<FeedbackEntry data={BASE_ENTRY} />)
    expect(screen.getByText('Mejoraría la onboarding para nuevos usuarios.')).toBeInTheDocument()
  })

  it('renderiza todas las respuestas truthy (p1, p2, p3, p4)', () => {
    render(<FeedbackEntry data={ENTRY_WITH_ALL_RESPONSES} />)
    expect(screen.getByText('Sí, el problema es muy real en startups.')).toBeInTheDocument()
    expect(screen.getByText('Definitivamente la usaría.')).toBeInTheDocument()
    expect(screen.getByText('Técnicamente es viable con las herramientas actuales.')).toBeInTheDocument()
    expect(screen.getByText('Añadiría integración con Slack.')).toBeInTheDocument()
  })

  it('no renderiza campos con valor vacío o undefined', () => {
    render(<FeedbackEntry data={ENTRY_WITH_EMPTY_OPTIONAL} />)
    // p1 vacío y p2 undefined no deben aparecer sus labels
    expect(screen.queryByText('¿Entiendes el problema?')).not.toBeInTheDocument()
    expect(screen.queryByText('¿Usarías la solución?')).not.toBeInTheDocument()
    // p4 sí aparece
    expect(screen.getByText('Campo obligatorio con contenido.')).toBeInTheDocument()
  })
})

describe('FeedbackEntry — ContributorBadge', () => {
  it('no renderiza ContributorBadge cuando contributorType es undefined', () => {
    render(<FeedbackEntry data={BASE_ENTRY} />)
    expect(screen.queryByText('Top Reviewer')).not.toBeInTheDocument()
    expect(screen.queryByText('Perspicaz')).not.toBeInTheDocument()
    expect(screen.queryByText('Cambió mi perspectiva')).not.toBeInTheDocument()
  })

  it('renderiza ContributorBadge con label "Top Reviewer" cuando contributorType es top-reviewer', () => {
    render(<FeedbackEntry data={ENTRY_WITH_BADGE} />)
    expect(screen.getByText('Top Reviewer')).toBeInTheDocument()
  })

  it('renderiza ContributorBadge con label "Perspicaz" cuando contributorType es insightful', () => {
    const entry: FeedbackEntryData = { ...BASE_ENTRY, contributorType: 'insightful' }
    render(<FeedbackEntry data={entry} />)
    expect(screen.getByText('Perspicaz')).toBeInTheDocument()
  })
})

describe('FeedbackEntry — fecha', () => {
  it('renderiza un elemento time con el atributo dateTime', () => {
    render(<FeedbackEntry data={BASE_ENTRY} />)
    const timeEl = screen.getByRole('time' as 'status')
    // El elemento time debe existir con el valor de createdAt como dateTime
    expect(timeEl).toBeInTheDocument()
  })
})
