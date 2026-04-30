// @vitest-environment jsdom
/**
 * Tests — LaunchIdeaForm con descriptionStructure dinámica (Story 10.2)
 * T3.5: form renderiza con placeholder por defecto sin descriptionStructure;
 *        y con placeholder del template cuando se pasa.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { LaunchIdeaForm } from '@/components/projects/LaunchIdeaForm'
import { launchIdeaSchema, type LaunchIdeaFormValues } from '@/lib/validations/projects'
import type { DescriptionStructure } from '@/lib/types/templates'
import { TEMPLATE_SAAS } from '@/lib/fixtures/templates'

// ── Wrapper ────────────────────────────────────────────────────────────────────

interface WrapperProps {
  descriptionStructure?: DescriptionStructure
}

function FormWrapper({ descriptionStructure }: WrapperProps) {
  const methods = useForm<LaunchIdeaFormValues>({
    resolver: zodResolver(launchIdeaSchema),
    defaultValues: {
      title: '',
      tagline: '',
      problem: '',
      solution: '',
      targetUser: '',
      hypothesis: '',
      demoLink: '',
    },
  })

  return (
    <FormProvider {...methods}>
      <LaunchIdeaForm
        feedbackTopics={[]}
        onFeedbackTopicsChange={() => {}}
        images={[]}
        onImagesChange={() => {}}
        descriptionStructure={descriptionStructure}
      />
    </FormProvider>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LaunchIdeaForm — descriptionStructure dinámica (Story 10.2)', () => {
  describe('sin descriptionStructure (retrocompatibilidad)', () => {
    it('usa el placeholder por defecto en el campo "Problema"', () => {
      render(<FormWrapper />)

      const problemTextarea = screen.getByTestId('modal-field-problem')
      expect(problemTextarea).toHaveAttribute('placeholder', '¿Qué problema resuelves?')
    })

    it('usa el placeholder por defecto en el campo "Solución"', () => {
      render(<FormWrapper />)

      const solutionTextarea = screen.getByTestId('modal-field-solution')
      expect(solutionTextarea).toHaveAttribute('placeholder', '¿Cuál es tu solución propuesta?')
    })
  })

  describe('con descriptionStructure del template SaaS', () => {
    it('usa el placeholder del template en el campo "Problema"', () => {
      render(<FormWrapper descriptionStructure={TEMPLATE_SAAS.descriptionStructure} />)

      const problemTextarea = screen.getByTestId('modal-field-problem')
      expect(problemTextarea).toHaveAttribute(
        'placeholder',
        TEMPLATE_SAAS.descriptionStructure.problem.placeholder,
      )
    })

    it('usa el placeholder del template en el campo "Solución"', () => {
      render(<FormWrapper descriptionStructure={TEMPLATE_SAAS.descriptionStructure} />)

      const solutionTextarea = screen.getByTestId('modal-field-solution')
      expect(solutionTextarea).toHaveAttribute(
        'placeholder',
        TEMPLATE_SAAS.descriptionStructure.solution.placeholder,
      )
    })
  })
})
