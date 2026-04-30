// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import { PersonalFeedbackCounter } from '@/components/gamification/PersonalFeedbackCounter'

// ---------------------------------------------------------------------------
// Mocks de módulos
// ---------------------------------------------------------------------------

const mockGetFeedbackCount = vi.fn()

vi.mock('@/lib/api/gamification', () => ({
  getTopReviewer: vi.fn(),
  getFeedbackCount: (...args: unknown[]) => mockGetFeedbackCount(...args),
}))

// ---------------------------------------------------------------------------
// Suite: estado de carga
// ---------------------------------------------------------------------------

describe('PersonalFeedbackCounter — estado de carga', () => {
  it('renderiza el skeleton mientras se resuelve la promesa', () => {
    mockGetFeedbackCount.mockImplementation(() => new Promise(() => {})) // never resolves
    const { container } = render(<PersonalFeedbackCounter communityId="com-1" />)
    // El skeleton está presente (es el único contenido en carga)
    expect(container.firstChild).toBeInTheDocument()
    // El contador final no está visible
    expect(screen.queryByText(/has dado/i)).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: datos cargados correctamente
// ---------------------------------------------------------------------------

describe('PersonalFeedbackCounter — con datos', () => {
  beforeEach(() => {
    mockGetFeedbackCount.mockReset()
  })

  it('muestra el texto con el conteo de feedbacks en plural', async () => {
    mockGetFeedbackCount.mockResolvedValueOnce({ count: 5, communityId: 'com-1' })
    render(<PersonalFeedbackCounter communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText(/has dado/i)).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText(/feedbacks en esta comunidad/i)).toBeInTheDocument()
    })
  })

  it('muestra "feedback" en singular cuando count es 1', async () => {
    mockGetFeedbackCount.mockResolvedValueOnce({ count: 1, communityId: 'com-1' })
    render(<PersonalFeedbackCounter communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText(/feedback en esta comunidad/i)).toBeInTheDocument()
    })
  })

  it('muestra 0 feedbacks cuando el conteo es 0', async () => {
    mockGetFeedbackCount.mockResolvedValueOnce({ count: 0, communityId: 'com-1' })
    render(<PersonalFeedbackCounter communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  it('llama a getFeedbackCount con el communityId correcto', async () => {
    mockGetFeedbackCount.mockResolvedValueOnce({ count: 3, communityId: 'com-99' })
    render(<PersonalFeedbackCounter communityId="com-99" />)
    await waitFor(() => {
      expect(mockGetFeedbackCount).toHaveBeenCalledWith('com-99')
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: estado de error
// ---------------------------------------------------------------------------

describe('PersonalFeedbackCounter — estado de error', () => {
  beforeEach(() => {
    mockGetFeedbackCount.mockReset()
  })

  it('muestra 0 cuando la API lanza un error', async () => {
    mockGetFeedbackCount.mockRejectedValueOnce(new Error('Error de red'))
    render(<PersonalFeedbackCounter communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })
})
