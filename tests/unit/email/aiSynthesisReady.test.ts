// Story 12.6 — Tests del template buildAiSynthesisReadyEmail
// TDD Outside-In: tests escritos ANTES de la implementación

import { describe, it, expect } from 'vitest'
import { buildAiSynthesisReadyEmail } from '@/lib/email/templates/aiSynthesisReady'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_INPUT = {
  projectTitle: 'Mi Proyecto Startup',
  projectUrl: 'https://proof-day.com/communities/startup-madrid/projects/mi-proyecto',
  summaryText: 'Este proyecto tiene un mercado con alto potencial y feedback muy positivo de los revisores.',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildAiSynthesisReadyEmail', () => {
  it('retorna un objeto con subject y html', () => {
    const result = buildAiSynthesisReadyEmail(BASE_INPUT)
    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('html')
    expect(typeof result.subject).toBe('string')
    expect(typeof result.html).toBe('string')
  })

  it('el subject incluye el título del proyecto', () => {
    const { subject } = buildAiSynthesisReadyEmail(BASE_INPUT)
    expect(subject).toContain(BASE_INPUT.projectTitle)
  })

  it('el subject indica que la síntesis está lista', () => {
    const { subject } = buildAiSynthesisReadyEmail(BASE_INPUT)
    expect(subject.toLowerCase()).toContain('síntesis')
    expect(subject.toLowerCase()).toContain('lista')
  })

  it('el html contiene el texto del resumen', () => {
    const { html } = buildAiSynthesisReadyEmail(BASE_INPUT)
    expect(html).toContain(BASE_INPUT.summaryText)
  })

  it('el html contiene la URL del proyecto', () => {
    const { html } = buildAiSynthesisReadyEmail(BASE_INPUT)
    expect(html).toContain(BASE_INPUT.projectUrl)
  })

  it('el html tiene un enlace CTA "Ver síntesis"', () => {
    const { html } = buildAiSynthesisReadyEmail(BASE_INPUT)
    expect(html).toContain('Ver síntesis')
    expect(html).toContain('<a')
    expect(html).toContain('href=')
  })

  it('el html usa estilos inline para el CTA (background-color y color)', () => {
    const { html } = buildAiSynthesisReadyEmail(BASE_INPUT)
    expect(html).toContain('background-color')
    expect(html).toContain('text-decoration: none')
  })

  it('el html tiene un contenedor con max-width 600px', () => {
    const { html } = buildAiSynthesisReadyEmail(BASE_INPUT)
    expect(html).toContain('600px')
  })

  it('el html es una cadena no vacía con estructura HTML válida básica', () => {
    const { html } = buildAiSynthesisReadyEmail(BASE_INPUT)
    expect(html.length).toBeGreaterThan(100)
    expect(html).toContain('<html')
    expect(html).toContain('</html>')
  })

  it('el título del proyecto aparece en el html', () => {
    const { html } = buildAiSynthesisReadyEmail(BASE_INPUT)
    expect(html).toContain(BASE_INPUT.projectTitle)
  })

  it('funciona con un summaryText largo sin truncar', () => {
    const longSummary = 'A'.repeat(2000)
    const { html } = buildAiSynthesisReadyEmail({ ...BASE_INPUT, summaryText: longSummary })
    expect(html).toContain(longSummary)
  })

  it('maneja caracteres especiales en el título del proyecto', () => {
    const specialTitle = 'Proyecto & "Demo" <Test>'
    const { subject, html } = buildAiSynthesisReadyEmail({
      ...BASE_INPUT,
      projectTitle: specialTitle,
    })
    // Subject contiene el título tal cual (sin escapar — es texto plano)
    expect(subject).toContain(specialTitle)
    // HTML debe contener la URL sin romper
    expect(html).toContain(BASE_INPUT.projectUrl)
  })
})
