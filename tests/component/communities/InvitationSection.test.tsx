// @vitest-environment jsdom
/**
 * Tests — InvitationSection (Client Component)
 * Verifica generación de links, copia al portapapeles, estado "Copiado" y errores.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mock de generateInvitationLink
// ---------------------------------------------------------------------------

const { generateInvitationLinkMock } = vi.hoisted(() => ({
  generateInvitationLinkMock: vi.fn(),
}))

vi.mock('@/lib/api/invitations', () => ({
  generateInvitationLink: generateInvitationLinkMock,
}))

import InvitationSection from '@/components/communities/InvitationSection'

// ---------------------------------------------------------------------------
// Setup clipboard mock global
// Nota: jsdom tiene su propio clipboard API. Usamos spyOn sobre el objeto real
// para interceptar la llamada en tiempo de ejecución del componente.
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
  // Restaurar timers reales si algún test los cambió
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// Render inicial
// ---------------------------------------------------------------------------

describe('InvitationSection — render inicial', () => {
  it('muestra el botón "Generar link de invitación"', () => {
    render(<InvitationSection communityId="community-1" />)
    expect(
      screen.getByRole('button', { name: /Generar link de invitación/i })
    ).toBeInTheDocument()
  })

  it('no muestra ningún link en el estado inicial', () => {
    render(<InvitationSection communityId="community-1" />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('no muestra mensaje de error en el estado inicial', () => {
    render(<InvitationSection communityId="community-1" />)
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Click "Generar link" → link aparece en lista
// ---------------------------------------------------------------------------

describe('InvitationSection — generación de link', () => {
  beforeEach(() => {
    generateInvitationLinkMock.mockResolvedValue('https://example.com/invite/token-abc')
  })

  it('llama a generateInvitationLink con el communityId correcto', async () => {
    const user = userEvent.setup()
    render(<InvitationSection communityId="community-42" />)
    await user.click(screen.getByRole('button', { name: /Generar link/i }))
    expect(generateInvitationLinkMock).toHaveBeenCalledWith('community-42')
  })

  it('muestra el link generado en la lista tras hacer click', async () => {
    const user = userEvent.setup()
    render(<InvitationSection communityId="community-1" />)
    await user.click(screen.getByRole('button', { name: /Generar link/i }))
    await screen.findByDisplayValue('https://example.com/invite/token-abc')
    expect(screen.getByDisplayValue('https://example.com/invite/token-abc')).toBeInTheDocument()
  })

  it('muestra el indicador de estado "Activo" junto al link', async () => {
    const user = userEvent.setup()
    render(<InvitationSection communityId="community-1" />)
    await user.click(screen.getByRole('button', { name: /Generar link/i }))
    await screen.findByDisplayValue('https://example.com/invite/token-abc')
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('muestra el botón "Copiar link" tras generar', async () => {
    const user = userEvent.setup()
    render(<InvitationSection communityId="community-1" />)
    await user.click(screen.getByRole('button', { name: /Generar link/i }))
    await screen.findByDisplayValue('https://example.com/invite/token-abc')
    expect(screen.getByRole('button', { name: /Copiar link/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Generación múltiple → múltiples links visibles
// ---------------------------------------------------------------------------

describe('InvitationSection — generación múltiple', () => {
  it('muestra múltiples links tras varios clicks en "Generar link"', async () => {
    generateInvitationLinkMock
      .mockResolvedValueOnce('https://example.com/invite/token-1')
      .mockResolvedValueOnce('https://example.com/invite/token-2')

    const user = userEvent.setup()
    render(<InvitationSection communityId="community-1" />)

    await user.click(screen.getByRole('button', { name: /Generar link/i }))
    await screen.findByDisplayValue('https://example.com/invite/token-1')

    await user.click(screen.getByRole('button', { name: /Generar link/i }))
    await screen.findByDisplayValue('https://example.com/invite/token-2')

    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// Click "Copiar link" → clipboard + estado "Copiado"
// ---------------------------------------------------------------------------

describe('InvitationSection — copiar link', () => {
  beforeEach(() => {
    generateInvitationLinkMock.mockResolvedValue('https://example.com/invite/token-xyz')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('llama a clipboard.writeText con la URL del link', async () => {
    // Spy sobre el clipboard real de jsdom en tiempo de ejecución del test
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    const user = userEvent.setup()
    render(<InvitationSection communityId="community-1" />)

    await user.click(screen.getByRole('button', { name: /Generar link/i }))
    const copyBtn = await screen.findByRole('button', { name: /Copiar link/i })
    await user.click(copyBtn)

    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith('https://example.com/invite/token-xyz')
    })
  })

  it('el botón cambia a "¡Copiado!" tras hacer click', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<InvitationSection communityId="community-1" />)

    await user.click(screen.getByRole('button', { name: /Generar link/i }))
    const copyBtn = await screen.findByRole('button', { name: /Copiar link/i })
    await user.click(copyBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /¡Copiado!/i })).toBeInTheDocument()
    })
  })

  it('el indicador de estado cambia a "Copiado" tras hacer click', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<InvitationSection communityId="community-1" />)

    await user.click(screen.getByRole('button', { name: /Generar link/i }))
    const copyBtn = await screen.findByRole('button', { name: /Copiar link/i })
    await user.click(copyBtn)

    await waitFor(() => {
      expect(screen.getByText('Copiado')).toBeInTheDocument()
    })
  })

  it('el botón vuelve a "Copiar link" después de 2 segundos', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })

    generateInvitationLinkMock.mockResolvedValue('https://example.com/invite/token-timer')

    render(<InvitationSection communityId="community-1" />)

    await user.click(screen.getByRole('button', { name: /Generar link/i }))
    const copyBtn = await screen.findByRole('button', { name: /Copiar link/i })
    await user.click(copyBtn)

    // Confirmar estado copiado
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /¡Copiado!/i })).toBeInTheDocument()
    })

    // Avanzar tiempo
    await act(async () => {
      vi.advanceTimersByTime(2100)
    })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /¡Copiado!/i })).not.toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Copiar link/i })).toBeInTheDocument()
  }, 15000)
})

// ---------------------------------------------------------------------------
// Error en generateInvitationLink → mensaje de error visible
// ---------------------------------------------------------------------------

describe('InvitationSection — error en generación', () => {
  it('muestra mensaje de error cuando generateInvitationLink falla', async () => {
    generateInvitationLinkMock.mockRejectedValue(
      new Error('Error al generar el link de invitación')
    )
    const user = userEvent.setup()
    render(<InvitationSection communityId="community-1" />)

    await user.click(screen.getByRole('button', { name: /Generar link/i }))

    await waitFor(() => {
      expect(screen.getByText('Error al generar el link de invitación')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('no añade ningún link a la lista cuando hay error', async () => {
    generateInvitationLinkMock.mockRejectedValue(new Error('Fallo red'))
    const user = userEvent.setup()
    render(<InvitationSection communityId="community-1" />)

    await user.click(screen.getByRole('button', { name: /Generar link/i }))

    await waitFor(() => {
      expect(screen.getByText('Fallo red')).toBeInTheDocument()
    }, { timeout: 5000 })

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
