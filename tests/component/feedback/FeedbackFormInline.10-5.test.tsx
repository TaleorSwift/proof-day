// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — FeedbackFormInline + HypothesisContextBanner (Story 10.5)
 * T5.1–T5.3: banner mostrado cuando hypothesis presente; oculto cuando ausente o vacío
 * AC-5, AC-6
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('@/lib/api/feedback', () => ({
  submitFeedback: vi.fn(),
}))

import { FeedbackFormInline } from '@/components/feedback/FeedbackFormInline'

// ── Constantes ────────────────────────────────────────────────────────────────

const DEFAULT_PROPS = {
  projectId: 'proj-uuid',
  communityId: 'comm-uuid',
}

// ── T5.1: banner visible cuando hypothesis tiene contenido ────────────────────

describe('FeedbackFormInline — T5.1: HypothesisContextBanner visible', () => {
  it('muestra el banner con data-testid="hypothesis-context-banner" cuando hypothesis tiene texto', () => {
    render(
      <FeedbackFormInline
        {...DEFAULT_PROPS}
        hypothesis="Si el usuario ve el precio, compra más"
      />,
    )
    expect(screen.getByTestId('hypothesis-context-banner')).toBeInTheDocument()
  })
})

// ── T5.2: banner oculto cuando hypothesis ausente o vacío ─────────────────────

describe('FeedbackFormInline — T5.2: HypothesisContextBanner oculto', () => {
  it('NO muestra el banner cuando hypothesis es undefined', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    expect(screen.queryByTestId('hypothesis-context-banner')).not.toBeInTheDocument()
  })

  it('NO muestra el banner cuando hypothesis es string vacío ""', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} hypothesis="" />)
    expect(screen.queryByTestId('hypothesis-context-banner')).not.toBeInTheDocument()
  })
})

// ── T5.3: el banner muestra el texto de la hypothesis ─────────────────────────

describe('FeedbackFormInline — T5.3: contenido del banner', () => {
  it('el banner muestra el texto de la hypothesis', () => {
    render(
      <FeedbackFormInline
        {...DEFAULT_PROPS}
        hypothesis="Si el usuario ve el precio, compra más"
      />,
    )
    expect(screen.getByTestId('hypothesis-context-banner')).toHaveTextContent(
      'Si el usuario ve el precio, compra más',
    )
  })
})
