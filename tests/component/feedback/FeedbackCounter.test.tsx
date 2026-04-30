// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { FeedbackCounter } from '@/components/feedback/FeedbackCounter'

// ---------------------------------------------------------------------------
// Suite: FeedbackCounter — texto singular/plural
// ---------------------------------------------------------------------------

describe('FeedbackCounter — texto singular', () => {
  it('muestra "1 feedback" cuando count es 1', () => {
    render(<FeedbackCounter count={1} />)
    expect(screen.getByText('1 feedback')).toBeInTheDocument()
  })
})

describe('FeedbackCounter — texto plural', () => {
  it('muestra "0 feedbacks" cuando count es 0', () => {
    render(<FeedbackCounter count={0} />)
    expect(screen.getByText('0 feedbacks')).toBeInTheDocument()
  })

  it('muestra "2 feedbacks" cuando count es 2', () => {
    render(<FeedbackCounter count={2} />)
    expect(screen.getByText('2 feedbacks')).toBeInTheDocument()
  })

  it('muestra "100 feedbacks" cuando count es 100', () => {
    render(<FeedbackCounter count={100} />)
    expect(screen.getByText('100 feedbacks')).toBeInTheDocument()
  })
})

describe('FeedbackCounter — accesibilidad', () => {
  it('renderiza un elemento con aria-live="polite"', () => {
    render(<FeedbackCounter count={3} />)
    const el = screen.getByText('3 feedbacks')
    expect(el).toHaveAttribute('aria-live', 'polite')
  })
})
