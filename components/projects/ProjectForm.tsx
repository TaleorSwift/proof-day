'use client'

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
import { ImageGallery } from './ImageGallery'

interface ProjectFormProps {
  communityId: string
  communitySlug: string
  projectId?: string
  defaultValues?: ProjectRow
}

// For the form we omit imageUrls — images are managed via the ImageGallery component (Story 3.2)
const projectFormSchema = createProjectSchema.omit({ imageUrls: true })
type FormValues = z.infer<typeof projectFormSchema>

export function ProjectForm({
  communityId,
  communitySlug,
  projectId,
  defaultValues,
}: ProjectFormProps) {
  const router = useRouter()
  const isEdit = !!projectId

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
        }
      : {
          title: '',
          problem: '',
          solution: '',
          hypothesis: '',
          communityId,
        },
  })

  // Build initial gallery images from stored paths
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const initialImages = (defaultValues?.image_urls ?? []).map((path) => ({
    path,
    url: path.startsWith('http')
      ? path
      : `${supabaseUrl}/storage/v1/object/public/project-images/${path}`,
  }))

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit && projectId) {
        const { communityId: _cid, ...updateData } = data
        await updateProject(projectId, updateData)
        router.refresh()
      } else {
        // Create project with empty imageUrls — images are uploaded after creation (Story 3.2 Dev Notes)
        const fullData: CreateProjectInput = { ...data, imageUrls: [] }
        const project = await createProject(fullData)
        // Redirect to edit page so the builder can upload images immediately
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
