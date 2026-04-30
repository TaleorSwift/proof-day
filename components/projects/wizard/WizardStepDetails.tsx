'use client'

// Story 10.3 — Paso 3 del wizard: detalles opcionales + submit temporal

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FeedbackTopicChips } from '@/components/projects/FeedbackTopicChips'
import { ImageUploader } from '@/components/projects/ImageUploader'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

const MAX_MODAL_IMAGES = 3

interface Props {
  data: WizardFormData
  onChange: (fields: Partial<WizardFormData>) => void
  onSubmit: () => void
  isSubmitting?: boolean
}

export function WizardStepDetails({
  data,
  onChange,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const { targetUser, demoLink, feedbackTopics, images } = data

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

      {/* Submit temporal — deuda técnica */}
      {/* TODO Story 10.4: eliminar submit temporal — reemplazar por avance al paso 'preview' */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          style={{
            padding: 'var(--space-2) var(--space-6)',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--color-accent)',
            color: 'white',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            height: '40px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? 'Lanzando...' : '+ Lanzar proyecto'}
        </button>
      </div>
    </div>
  )
}
