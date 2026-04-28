// @vitest-environment jsdom
/**
 * Tests — CommunitiesNewPage (smoke test)
 * Verifica que la página renderiza el heading correcto y el formulario.
 * CommunityForm se mockea para aislar la página de dependencias de navegación.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

vi.mock('@/components/communities/CommunityForm', () => ({
  CommunityForm: () => <div data-testid="community-form" />,
}))

import NewCommunityPage from '@/app/(app)/communities/new/page'

// ---------------------------------------------------------------------------
// Smoke tests
// ---------------------------------------------------------------------------

describe('CommunitiesNewPage — smoke tests', () => {
  it('renderiza el heading "Crear comunidad"', () => {
    render(<NewCommunityPage />)
    expect(
      screen.getByRole('heading', { name: 'Crear comunidad', level: 1 })
    ).toBeInTheDocument()
  })

  it('renderiza el formulario de creación de comunidad', () => {
    render(<NewCommunityPage />)
    expect(screen.getByTestId('community-form')).toBeInTheDocument()
  })
})
