'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FeedbackTopicChips } from './FeedbackTopicChips'
import { ImageUploader } from './ImageUploader'
import type { UploaderImage } from './ImageUploader'
import type { LaunchIdeaFormValues } from '@/lib/validations/projects'

const MAX_MODAL_IMAGES = 3

interface Props {
  feedbackTopics: string[]
  onFeedbackTopicsChange: (topics: string[]) => void
  images: UploaderImage[]
  onImagesChange: (images: UploaderImage[]) => void
}

export function LaunchIdeaForm({
  feedbackTopics,
  onFeedbackTopicsChange,
  images,
  onImagesChange,
}: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<LaunchIdeaFormValues>()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Project name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="launch-title">
          Nombre del proyecto{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
        </Label>
        <Input
          id="launch-title"
          data-testid="modal-field-title"
          placeholder="ej. Pulse Check"
          aria-invalid={!!errors.title}
          {...register('title')}
        />
        {errors.title && (
          <p
            role="alert"
            aria-label="title"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-weak-text)', margin: 0 }}
          >
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Tagline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="launch-tagline">
          Tagline{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
        </Label>
        <Input
          id="launch-tagline"
          data-testid="modal-field-tagline"
          placeholder="Una frase que capture tu idea"
          aria-invalid={!!errors.tagline}
          {...register('tagline')}
        />
        {errors.tagline && (
          <p
            role="alert"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-weak-text)', margin: 0 }}
          >
            {errors.tagline.message}
          </p>
        )}
      </div>

      {/* Problem */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="launch-problem">
          Problema que resuelve{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
        </Label>
        <Textarea
          id="launch-problem"
          data-testid="modal-field-problem"
          placeholder="¿Qué problema resuelves?"
          rows={3}
          aria-invalid={!!errors.problem}
          {...register('problem')}
        />
        {errors.problem && (
          <p
            role="alert"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-weak-text)', margin: 0 }}
          >
            {errors.problem.message}
          </p>
        )}
      </div>

      {/* Solution */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="launch-solution">
          Solución propuesta{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
        </Label>
        <Textarea
          id="launch-solution"
          data-testid="modal-field-solution"
          placeholder="¿Cuál es tu solución propuesta?"
          rows={3}
          aria-invalid={!!errors.solution}
          {...register('solution')}
        />
        {errors.solution && (
          <p
            role="alert"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-weak-text)', margin: 0 }}
          >
            {errors.solution.message}
          </p>
        )}
      </div>

      {/* Target user — optional */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="launch-target-user">Usuario objetivo</Label>
        <Input
          id="launch-target-user"
          data-testid="modal-field-target-user"
          placeholder="¿Quién es el usuario objetivo?"
          aria-invalid={!!errors.targetUser}
          {...register('targetUser')}
        />
        {errors.targetUser && (
          <p
            role="alert"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-weak-text)', margin: 0 }}
          >
            {errors.targetUser.message}
          </p>
        )}
      </div>

      {/* Hypothesis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="launch-hypothesis">
          Hipótesis a validar{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
        </Label>
        <Textarea
          id="launch-hypothesis"
          data-testid="modal-field-hypothesis"
          placeholder="Si [acción], entonces [resultado]…"
          rows={3}
          aria-invalid={!!errors.hypothesis}
          {...register('hypothesis')}
        />
        {errors.hypothesis && (
          <p
            role="alert"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-weak-text)', margin: 0 }}
          >
            {errors.hypothesis.message}
          </p>
        )}
      </div>

      {/* Demo link — optional */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="launch-demo-link">Enlace de demo (opcional)</Label>
        <Input
          id="launch-demo-link"
          data-testid="modal-field-demo-link"
          type="url"
          placeholder="https://..."
          aria-invalid={!!errors.demoLink}
          {...register('demoLink')}
        />
        {errors.demoLink && (
          <p
            role="alert"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-weak-text)', margin: 0 }}
          >
            {errors.demoLink.message}
          </p>
        )}
      </div>

      {/* Images */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label>
          Imágenes (hasta {MAX_MODAL_IMAGES})
        </Label>
        <ImageUploader
          images={images}
          onImagesChange={onImagesChange}
          maxImages={MAX_MODAL_IMAGES}
        />
      </div>

      {/* Feedback topic chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label>¿Qué feedback buscas?</Label>
        <FeedbackTopicChips
          value={feedbackTopics}
          onChange={onFeedbackTopicsChange}
        />
      </div>
    </div>
  )
}
