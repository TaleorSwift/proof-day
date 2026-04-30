// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks — declarados ANTES de los imports del componente bajo test
// ---------------------------------------------------------------------------

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" aria-valuenow={value} role="progressbar" />
  ),
}))

// ---------------------------------------------------------------------------
// Import del componente bajo test
// ---------------------------------------------------------------------------

import { ProofScoreWaiting } from '@/components/proof-score/ProofScoreWaiting'

// ---------------------------------------------------------------------------
// Suite: estado de carga (isLoading=true)
// ---------------------------------------------------------------------------

describe('ProofScoreWaiting — estado de carga', () => {
  it('renderiza el skeleton cuando isLoading es true', () => {
    render(<ProofScoreWaiting feedbackCount={0} isLoading />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('no renderiza la barra de progreso cuando isLoading es true', () => {
    render(<ProofScoreWaiting feedbackCount={0} isLoading />)
    expect(screen.queryByTestId('progress')).not.toBeInTheDocument()
  })

  it('no renderiza el mensaje de espera cuando isLoading es true', () => {
    render(<ProofScoreWaiting feedbackCount={0} isLoading />)
    expect(screen.queryByText('Tu señal estará lista pronto')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: estado normal con feedbacks pendientes
// ---------------------------------------------------------------------------

describe('ProofScoreWaiting — feedbacks pendientes', () => {
  it('muestra "Faltan 3 feedbacks para tu señal" cuando feedbackCount es 0', () => {
    render(<ProofScoreWaiting feedbackCount={0} />)
    expect(screen.getByText('Faltan 3 feedbacks para tu señal')).toBeInTheDocument()
  })

  it('muestra "Faltan 2 feedbacks para tu señal" cuando feedbackCount es 1', () => {
    render(<ProofScoreWaiting feedbackCount={1} />)
    expect(screen.getByText('Faltan 2 feedbacks para tu señal')).toBeInTheDocument()
  })

  it('muestra "Faltan 1 feedback para tu señal" cuando feedbackCount es 2', () => {
    render(<ProofScoreWaiting feedbackCount={2} />)
    expect(screen.getByText('Faltan 1 feedback para tu señal')).toBeInTheDocument()
  })

  it('renderiza la barra de progreso con valor 0 cuando no hay feedbacks', () => {
    render(<ProofScoreWaiting feedbackCount={0} />)
    const progressBar = screen.getByTestId('progress')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  })

  it('renderiza la barra de progreso con valor correcto con 1 feedback de 3', () => {
    render(<ProofScoreWaiting feedbackCount={1} />)
    const progressBar = screen.getByTestId('progress')
    // 1/3 * 100 ≈ 33.33
    expect(Number(progressBar.getAttribute('aria-valuenow'))).toBeCloseTo(33.33, 0)
  })

  it('muestra el texto de pie "Tu señal estará lista pronto"', () => {
    render(<ProofScoreWaiting feedbackCount={1} />)
    expect(screen.getByText('Tu señal estará lista pronto')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: estado calculando (feedbackCount >= mínimo)
// ---------------------------------------------------------------------------

describe('ProofScoreWaiting — calculando el score', () => {
  it('muestra "Calculando tu Proof Score..." cuando feedbackCount alcanza el mínimo (3)', () => {
    render(<ProofScoreWaiting feedbackCount={3} />)
    expect(screen.getByText('Calculando tu Proof Score...')).toBeInTheDocument()
  })

  it('muestra "Calculando tu Proof Score..." cuando feedbackCount supera el mínimo', () => {
    render(<ProofScoreWaiting feedbackCount={5} />)
    expect(screen.getByText('Calculando tu Proof Score...')).toBeInTheDocument()
  })

  it('renderiza la barra de progreso al 100% cuando feedbackCount es el mínimo', () => {
    render(<ProofScoreWaiting feedbackCount={3} />)
    const progressBar = screen.getByTestId('progress')
    expect(Number(progressBar.getAttribute('aria-valuenow'))).toBe(100)
  })

  it('no renderiza el skeleton cuando isLoading no se pasa', () => {
    render(<ProofScoreWaiting feedbackCount={3} />)
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
  })
})
