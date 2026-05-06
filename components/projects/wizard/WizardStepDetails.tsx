'use client'

// Story 10.3 — Paso 3 del wizard: detalles opcionales
// Story 10.4 — Submit temporal eliminado; publicación ocurre en el paso 5 (ProjectPreview)
// Story 11.2 — Campo customQuestion con contador de caracteres

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FeedbackTopicChips } from '@/components/projects/FeedbackTopicChips'
import { ImageUploader } from '@/components/projects/ImageUploader'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

const MAX_MODAL_IMAGES = 3
const MAX_CUSTOM_QUESTION_LENGTH = 200

interface Props {
  data: WizardFormData
  onChange: (fields: Partial<WizardFormData>) => void
}

export function WizardStepDetails({
  data,
  onChange,
}: Props) {
  const { targetUser, demoLink, feedbackTopics, images, customQuestion = '' } = data
  const customQuestionLength = customQuestion.length
  const isCustomQuestionOverLimit = customQuestionLength > MAX_CUSTOM_QUESTION_LENGTH

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Usuario objetivo — opcional */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="wizard-target-user">Usuario objetivo</Label>
        <Input
          id="wizard-target-user"
          data-testid="wizard-field-target-user"
          placeholder="¿Quién es el usuario objetivo?"
          value={targetUser}
          onChange={(e) => onChange({ targetUser: e.target.value })}
        />
      </div>

      {/* Demo link — opcional */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="wizard-demo-link">Enlace de demo (opcional)</Label>
        <Input
          id="wizard-demo-link"
          data-testid="wizard-field-demo-link"
          type="url"
          placeholder="https://..."
          value={demoLink}
          onChange={(e) => onChange({ demoLink: e.target.value })}
        />
      </div>

      {/* Imágenes — opcional para guardar como draft */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label>Imágenes (hasta {MAX_MODAL_IMAGES})</Label>
        <ImageUploader
          images={images}
          onImagesChange={(imgs) => onChange({ images: imgs })}
          maxImages={MAX_MODAL_IMAGES}
        />
      </div>

      {/* Chips de feedback — opcional */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label>¿Qué feedback buscas?</Label>
        <FeedbackTopicChips
          value={feedbackTopics}
          onChange={(topics) => onChange({ feedbackTopics: topics })}
        />
      </div>

      {/* Pregunta custom para Reviewers — opcional (Story 11.2) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <Label htmlFor="wizard-custom-question">
            Pregunta para los Reviewers (opcional)
          </Label>
          <span
            data-testid="wizard-custom-question-counter"
            data-error={isCustomQuestionOverLimit ? 'true' : undefined}
            style={{
              fontSize: 'var(--text-xs)',
              color: isCustomQuestionOverLimit
                ? 'var(--color-weak-text)'
                : 'var(--color-text-muted)',
            }}
          >
            {customQuestionLength}/{MAX_CUSTOM_QUESTION_LENGTH}
          </span>
        </div>
        <textarea
          id="wizard-custom-question"
          data-testid="wizard-field-custom-question"
          data-error={isCustomQuestionOverLimit ? 'true' : undefined}
          placeholder="¿Echarías en falta esta funcionalidad si desapareciera mañana?"
          value={customQuestion}
          rows={3}
          onChange={(e) => onChange({ customQuestion: e.target.value })}
          style={{
            width: '100%',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-background)',
            border: isCustomQuestionOverLimit
              ? '1px solid var(--color-weak-text)'
              : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: 'var(--leading-base)',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  )
}
