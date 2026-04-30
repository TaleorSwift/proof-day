'use client'

// Story 10.3 — ProjectWizard: orquestador multi-paso con useReducer

import { useReducer, useCallback } from 'react'
import { ProjectTemplateSelector } from './ProjectTemplateSelector'
import { WizardStepDescription } from './wizard/WizardStepDescription'
import { WizardStepDetails } from './wizard/WizardStepDetails'
import type { ProjectTemplate } from '@/lib/types/templates'
import type { UploaderImage } from './ImageUploader'

// ── Tipos públicos ────────────────────────────────────────────────────────────

export interface WizardFormData {
  // Paso 1
  templateId: string | null
  selectedTemplate: ProjectTemplate | null
  // Paso 2
  title: string
  tagline: string
  problem: string
  solution: string
  // Paso 3
  targetUser: string
  demoLink: string
  feedbackTopics: string[]
  images: UploaderImage[]
  // Pasos 4+ (Story 10.5, Story 11.2 — placeholder)
  hypothesis: string
}

// ── Estado del wizard ─────────────────────────────────────────────────────────

interface WizardState {
  currentStep: number
  data: WizardFormData
}

type WizardAction =
  | { type: 'SET_FIELD'; payload: Partial<WizardFormData> }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' }

const INITIAL_DATA: WizardFormData = {
  templateId: null,
  selectedTemplate: null,
  title: '',
  tagline: '',
  problem: '',
  solution: '',
  targetUser: '',
  demoLink: '',
  feedbackTopics: [],
  images: [],
  hypothesis: '',
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, data: { ...state.data, ...action.payload } }
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1 }
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) }
    case 'RESET':
      return { currentStep: 1, data: INITIAL_DATA }
    default:
      return state
  }
}

// ── Definición extensible de pasos ────────────────────────────────────────────

interface WizardStep {
  id: string
  label: string
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 'template', label: 'Tipo de proyecto' },
  { id: 'description', label: 'Descripción' },
  { id: 'details', label: 'Detalles' },
  // { id: 'hypothesis', label: 'Hipótesis' },  // Story 10.5
  // { id: 'preview', label: 'Vista previa' },    // Story 10.4
]

// ── Validación de paso ────────────────────────────────────────────────────────

function isStepValid(step: number, data: WizardFormData): boolean {
  switch (step) {
    case 1:
      // Paso 1: template es opcional — siempre válido
      return true
    case 2:
      // Paso 2: title, tagline, problem, solution requeridos
      return (
        data.title.trim().length > 0 &&
        data.tagline.trim().length > 0 &&
        data.problem.trim().length > 0 &&
        data.solution.trim().length > 0
      )
    case 3:
      // Paso 3: todos los campos son opcionales — siempre válido
      return true
    default:
      return true
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  communitySlug: string
  templates: ProjectTemplate[]
  onSubmit: (data: WizardFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
  serverError?: string | null
}

// ── Indicador de progreso ─────────────────────────────────────────────────────

function WizardProgress({
  currentStep,
  totalSteps,
  stepLabel,
}: {
  currentStep: number
  totalSteps: number
  stepLabel: string
}) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div
      data-testid="wizard-progress"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {stepLabel}
        </span>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          {currentStep} de {totalSteps}
        </span>
      </div>
      <div
        style={{
          height: '4px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-border)',
          overflow: 'hidden',
          maxWidth: '100%',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-accent)',
            transition: 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  )
}

// ── ProjectWizard ─────────────────────────────────────────────────────────────

export function ProjectWizard({
  templates,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = null,
}: Props) {
  const [state, dispatch] = useReducer(wizardReducer, {
    currentStep: 1,
    data: INITIAL_DATA,
  })

  const { currentStep, data } = state
  const totalSteps = WIZARD_STEPS.length
  const currentStepDef = WIZARD_STEPS[currentStep - 1]
  const canContinue = isStepValid(currentStep, data)

  const handleFieldChange = useCallback((fields: Partial<WizardFormData>) => {
    dispatch({ type: 'SET_FIELD', payload: fields })
  }, [])

  function handleNext() {
    if (canContinue) {
      dispatch({ type: 'NEXT_STEP' })
    }
  }

  function handlePrev() {
    dispatch({ type: 'PREV_STEP' })
  }

  function handleSubmit() {
    onSubmit(data)
  }

  const isLastStep = currentStep === totalSteps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <WizardProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabel={currentStepDef.label}
      />

      {/* Paso 1: selector de tipo */}
      {currentStep === 1 && (
        <div data-testid="wizard-step-1">
          {templates.length === 0 ? (
            <p
              data-testid="templates-empty-state"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                margin: 0,
              }}
            >
              No hay tipos disponibles
            </p>
          ) : (
            <ProjectTemplateSelector
              templates={templates}
              selectedId={data.templateId}
              onSelect={(id) => {
                const template = id ? (templates.find((t) => t.id === id) ?? null) : null
                handleFieldChange({ templateId: id, selectedTemplate: template })
              }}
            />
          )}
        </div>
      )}

      {/* Paso 2: descripción básica */}
      {currentStep === 2 && (
        <div data-testid="wizard-step-2">
          <WizardStepDescription data={data} onChange={handleFieldChange} />
        </div>
      )}

      {/* Paso 3: detalles opcionales */}
      {currentStep === 3 && (
        <div data-testid="wizard-step-3">
          <WizardStepDetails
            data={data}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {serverError && (
        <p
          role="alert"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-weak-text)',
            margin: 0,
          }}
        >
          {serverError}
        </p>
      )}

      {/* Botones de navegación — pasos 1 y 2 */}
      {!isLastStep && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            paddingTop: 'var(--space-2)',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>

          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              Anterior
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!canContinue}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: canContinue ? 'var(--color-accent)' : 'var(--color-border)',
              color: canContinue ? 'white' : 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              cursor: canContinue ? 'pointer' : 'not-allowed',
            }}
          >
            Continuar
          </button>
        </div>
      )}

      {/* Botón Anterior visible en paso 3 */}
      {isLastStep && (
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={handlePrev}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
          >
            Anterior
          </button>
        </div>
      )}
    </div>
  )
}
