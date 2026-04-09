'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createProjectSchema, type CreateProjectInput } from '@/lib/validations/projects'
import { createProject, updateProject } from '@/lib/api/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ProjectRow } from '@/lib/types/projects'
import { PROJECT_IMAGES_BUCKET } from '@/lib/types/projects'
import { ImageGallery } from './ImageGallery'

interface ProjectFormProps {
  communityId: string
  communitySlug: string
  projectId?: string
  defaultValues?: ProjectRow
}

// Para el formulario omitimos imageUrls (gestión via ImageGallery, Story 3.2)
// y feedbackTopics (gestión via estado local con lista dinámica de chips)
const projectFormSchema = createProjectSchema.omit({ imageUrls: true, feedbackTopics: true })
type FormValues = z.infer<typeof projectFormSchema>

export function ProjectForm({
  communityId,
  communitySlug,
  projectId,
  defaultValues,
}: ProjectFormProps) {
  const router = useRouter()
  const isEdit = !!projectId

  // Estado local para temas de feedback (gestionado fuera de RHF por ser lista dinámica)
  const [feedbackTopics, setFeedbackTopics] = useState<string[]>(
    defaultValues?.feedback_topics ?? []
  )
  const [topicInput, setTopicInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultValues
      ? {
          title: defaultValues.title,
          problem: defaultValues.problem,
          solution: defaultValues.solution,
          hypothesis: defaultValues.hypothesis,
          communityId,
          targetUser: defaultValues.target_user ?? '',
          demoUrl: defaultValues.demo_url ?? '',
        }
      : {
          title: '',
          problem: '',
          solution: '',
          hypothesis: '',
          communityId,
          targetUser: '',
          demoUrl: '',
        },
  })

  // Build initial gallery images from stored paths
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const initialImages = (defaultValues?.image_urls ?? []).map((path) => ({
    path,
    url: path.startsWith('http')
      ? path
      : `${supabaseUrl}/storage/v1/object/public/${PROJECT_IMAGES_BUCKET}/${path}`,
  }))

  const addTopic = () => {
    const trimmed = topicInput.trim()
    if (!trimmed || feedbackTopics.includes(trimmed) || feedbackTopics.length >= 10) return
    setFeedbackTopics((prev) => [...prev, trimmed])
    setTopicInput('')
  }

  const removeTopic = (index: number) => {
    setFeedbackTopics((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTopic()
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      // Normalizar campos opcionales: string vacío → undefined para no enviar valores vacíos
      const normalizedData = {
        ...data,
        targetUser: data.targetUser?.trim() || undefined,
        demoUrl: data.demoUrl?.trim() || undefined,
        feedbackTopics: feedbackTopics.length > 0 ? feedbackTopics : undefined,
      }

      if (isEdit && projectId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { communityId: _cid, ...updateData } = normalizedData
        await updateProject(projectId, updateData)
        router.refresh()
      } else {
        // Crear proyecto con imageUrls vacío — las imágenes se suben tras la creación (Story 3.2)
        const fullData: CreateProjectInput = { ...normalizedData, imageUrls: [] }
        const project = await createProject(fullData)
        // Redirigir a edición para que el builder pueda subir imágenes de inmediato
        router.push(`/communities/${communitySlug}/projects/${project.id}/edit`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
    >
      {/* Campo oculto communityId */}
      <input type="hidden" {...register('communityId')} />

      {/* Título */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="title">
          Título{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
            *
          </span>
        </Label>
        <Input
          id="title"
          placeholder="Describe tu proyecto en pocas palabras"
          aria-invalid={!!errors.title}
          {...register('title')}
        />
        {errors.title && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-destructive, #dc2626)' }} role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Problema */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="problem">
          Descripción del problema{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
            *
          </span>
        </Label>
        <Textarea
          id="problem"
          placeholder="¿Qué problema resuelves? ¿A quién afecta?"
          rows={5}
          aria-invalid={!!errors.problem}
          {...register('problem')}
        />
        {errors.problem && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-destructive, #dc2626)' }} role="alert">
            {errors.problem.message}
          </p>
        )}
      </div>

      {/* Solución */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="solution">
          Solución propuesta{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
            *
          </span>
        </Label>
        <Textarea
          id="solution"
          placeholder="¿Cómo resuelves el problema?"
          rows={5}
          aria-invalid={!!errors.solution}
          {...register('solution')}
        />
        {errors.solution && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-destructive, #dc2626)' }} role="alert">
            {errors.solution.message}
          </p>
        )}
      </div>

      {/* Hipótesis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="hypothesis">
          Hipótesis{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
            *
          </span>
        </Label>
        <Textarea
          id="hypothesis"
          placeholder="¿Cuál es tu hipótesis principal? ¿Qué quieres validar?"
          rows={3}
          aria-invalid={!!errors.hypothesis}
          {...register('hypothesis')}
        />
        {errors.hypothesis && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-destructive, #dc2626)' }} role="alert">
            {errors.hypothesis.message}
          </p>
        )}
      </div>

      {/* Separador — sección de campos opcionales */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--space-1)',
          }}
        >
          Información adicional
        </p>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}
        >
          Campos opcionales que ayudan a los Reviewers a darte feedback más específico
        </p>
      </div>

      {/* Usuario objetivo — Story 8.1 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="targetUser">Usuario objetivo</Label>
        <Input
          id="targetUser"
          placeholder="Ej: freelancers de diseño, equipos de startups early-stage..."
          aria-invalid={!!errors.targetUser}
          {...register('targetUser')}
        />
        {errors.targetUser && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-destructive, #dc2626)' }} role="alert">
            {errors.targetUser.message}
          </p>
        )}
      </div>

      {/* URL de demo — Story 8.1 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="demoUrl">URL de demo</Label>
        <Input
          id="demoUrl"
          type="url"
          placeholder="https://..."
          aria-invalid={!!errors.demoUrl}
          {...register('demoUrl')}
        />
        {errors.demoUrl && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-destructive, #dc2626)' }} role="alert">
            {errors.demoUrl.message}
          </p>
        )}
      </div>

      {/* Temas de feedback — Story 8.1 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="topicInput">Temas de feedback</Label>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}
        >
          Escribe un tema y pulsa Enter o &ldquo;Añadir&rdquo; (máximo 10)
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Input
            id="topicInput"
            placeholder="Ej: usabilidad, precio, onboarding..."
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={handleTopicKeyDown}
            style={{ flex: 1 }}
          />
          <Button
            type="button"
            onClick={addTopic}
            disabled={!topicInput.trim() || feedbackTopics.length >= 10}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              flexShrink: 0,
            }}
          >
            Añadir
          </Button>
        </div>

        {feedbackTopics.length > 0 && (
          <ul
            aria-label="Temas de feedback añadidos"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}
          >
            {feedbackTopics.map((topic, i) => (
              <li
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-1) var(--space-3)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {topic}
                <button
                  type="button"
                  aria-label={`Eliminar tema: ${topic}`}
                  onClick={() => removeTopic(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-base)',
                    lineHeight: 1,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Imágenes — gestionadas via Storage (Story 3.2) */}
      {isEdit && projectId ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Label>
            Imágenes
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginLeft: 'var(--space-2)',
              }}
            >
              (máximo 5 · JPG, PNG o WebP · 5MB)
            </span>
          </Label>
          <ImageGallery
            projectId={projectId}
            initialImages={initialImages}
            isEditable={true}
          />
        </div>
      ) : (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-hypothesis-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-hypothesis-border)',
            margin: 0,
          }}
        >
          Podrás subir imágenes una vez creado el proyecto.
        </p>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear proyecto'}
        </Button>
      </div>
    </form>
  )
}
