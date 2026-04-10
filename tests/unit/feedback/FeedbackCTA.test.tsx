// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock de FeedbackButton — evita useRouter y dependencias client
vi.mock('@/components/feedback/FeedbackButton', () => ({
  FeedbackButton: ({ projectId }: { projectId: string }) => (
    <button data-testid="feedback-button">{projectId}</button>
  ),
}))

import { FeedbackCTA } from '@/components/feedback/FeedbackCTA'

// ---------------------------------------------------------------------------
// Suite: FeedbackCTA — variante authenticated-member
// ---------------------------------------------------------------------------

describe('FeedbackCTA — variante authenticated-member', () => {
  const defaultProps = {
    variant: 'authenticated-member' as const,
    projectId: 'project-123',
    communityId: 'community-abc',
  }

  it('renderiza el heading "Ayuda a mejorar esta idea"', () => {
    render(<FeedbackCTA {...defaultProps} />)
    expect(
      screen.getByRole('heading', { name: 'Ayuda a mejorar esta idea' })
    ).toBeInTheDocument()
  })

  it('renderiza el texto motivacional', () => {
    render(<FeedbackCTA {...defaultProps} />)
    expect(
      screen.getByText(
        'Tu perspectiva como miembro de la comunidad es valiosa. Da feedback y ayuda a validar si esta propuesta tiene potencial.'
      )
    ).toBeInTheDocument()
  })

  it('renderiza el botón de feedback (data-testid="feedback-button")', () => {
    render(<FeedbackCTA {...defaultProps} />)
    expect(screen.getByTestId('feedback-button')).toBeInTheDocument()
  })

  it('renderiza el wrapper del botón con data-testid="feedback-cta-button-wrapper"', () => {
    render(<FeedbackCTA {...defaultProps} />)
    expect(screen.getByTestId('feedback-cta-button-wrapper')).toBeInTheDocument()
  })

  it('renderiza el contenedor raíz con data-testid="feedback-cta"', () => {
    render(<FeedbackCTA {...defaultProps} />)
    expect(screen.getByTestId('feedback-cta')).toBeInTheDocument()
  })

  it('NO renderiza el link de sign-in', () => {
    render(<FeedbackCTA {...defaultProps} />)
    expect(screen.queryByTestId('feedback-cta-signin-link')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackCTA — variante owner
// ---------------------------------------------------------------------------

describe('FeedbackCTA — variante owner', () => {
  it('devuelve null — el container queda vacío', () => {
    const { container } = render(
      <FeedbackCTA variant="owner" projectId="project-123" communityId="community-abc" />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('no renderiza ningún heading', () => {
    render(
      <FeedbackCTA variant="owner" projectId="project-123" communityId="community-abc" />
    )
    expect(
      screen.queryByRole('heading', { name: 'Ayuda a mejorar esta idea' })
    ).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackCTA — variante unauthenticated
// ---------------------------------------------------------------------------

describe('FeedbackCTA — variante unauthenticated', () => {
  const defaultProps = {
    variant: 'unauthenticated' as const,
    projectId: 'project-123',
    communityId: 'community-abc',
  }

  it('renderiza el heading "Ayuda a mejorar esta idea"', () => {
    render(<FeedbackCTA {...defaultProps} />)
    expect(
      screen.getByRole('heading', { name: 'Ayuda a mejorar esta idea' })
    ).toBeInTheDocument()
  })

  it('renderiza el texto de invitación a iniciar sesión', () => {
    render(<FeedbackCTA {...defaultProps} />)
    expect(
      screen.getByText('Inicia sesión para dar feedback')
    ).toBeInTheDocument()
  })

  it('renderiza el link de sign-in con data-testid="feedback-cta-signin-link"', () => {
    render(<FeedbackCTA {...defaultProps} />)
    expect(screen.getByTestId('feedback-cta-signin-link')).toBeInTheDocument()
  })

  it('el link de sign-in apunta a /auth/login', () => {
    render(<FeedbackCTA {...defaultProps} />)
    const link = screen.getByTestId('feedback-cta-signin-link')
    expect(link).toHaveAttribute('href', '/auth/login')
  })

  it('NO renderiza el botón de feedback (feedback-button)', () => {
    render(<FeedbackCTA {...defaultProps} />)
    expect(screen.queryByTestId('feedback-button')).not.toBeInTheDocument()
  })

  it('NO renderiza el wrapper del botón', () => {
    render(<FeedbackCTA {...defaultProps} />)
    expect(screen.queryByTestId('feedback-cta-button-wrapper')).not.toBeInTheDocument()
  })
})
