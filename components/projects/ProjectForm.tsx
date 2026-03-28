'use client'

import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { createProjectSchema, type CreateProjectInput } from '@/lib/validations/projects'
import { createProject, updateProject } from '@/lib/api/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ProjectRow } from '@/lib/types/projects'

interface ProjectFormProps {
  communityId: string
  communitySlug: string
  projectId?: string
  defaultValues?: ProjectRow
}

export function ProjectForm({ communityId, communitySlug, projectId, defaultValues }: ProjectFormProps) {
  const router = useRouter()
  const isEdit = !!projectId
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      problem: defaultValues?.problem ?? '',
      solution: defaultValues?.solution ?? '',
      hypothesis: defaultValues?.hypothesis ?? '',
      imageUrls:
        defaultValues?.image_urls && defaultValues.image_urls.length > 0
          ? defaultValues.image_urls
          : [''],
      communityId,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'imageUrls' as never,
  })

  const onSubmit = async (data: CreateProjectInput) => {
    setGlobalError(null)
    setSuccessMessage(null)

    try {
      if (isEdit && projectId) {
        const { communityId: _cid, ...updateData } = data
        await updateProject(projectId, updateData)
        setSuccessMessage('Proyecto guardado correctamente')
      } else {
        const project = await createProject(data)
        router.push(`/communities/${communitySlug}/projects/${project.id}`)
      }
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Error inesperado al guardar el proyecto')
    }
  }

  const imageUrlsError = errors.imageUrls
  const imageUrlsRootError =
    imageUrlsError && !Array.isArray(imageUrlsError)
      ? (imageUrlsError as { message?: string }).message
      : undefined

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

      {/* URLs de imágenes — lista dinámica (mínimo 1, máximo 5) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label>
          Imágenes{' '}
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
            *
          </span>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              marginLeft: 'var(--space-2)',
              fontWeight: 'var(--font-regular)',
            }}
          >
            (mínimo 1, máximo 5 URLs)
          </span>
        </Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {fields.map((field, index) => (
            <div
              key={field.id}
              style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}
            >
              <div style={{ flex: 1 }}>
                <Input
                  type="url"
                  placeholder={`URL de imagen ${index + 1}`}
                  aria-label={`URL de imagen ${index + 1}`}
                  {...register(`imageUrls.${index}`)}
                />
                {Array.isArray(errors.imageUrls) && errors.imageUrls[index] && (
                  <p
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--color-destructive, #dc2626)' }}
                    role="alert"
                  >
                    {errors.imageUrls[index]?.message}
                  </p>
                )}
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => remove(index)}
                  aria-label={`Eliminar imagen ${index + 1}`}
                  style={{ flexShrink: 0 }}
                >
                  Eliminar
                </Button>
              )}
            </div>
          ))}
        </div>
        {imageUrlsRootError && (
          <p
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-destructive, #dc2626)' }}
            role="alert"
          >
            {imageUrlsRootError}
          </p>
        )}
        {fields.length < 5 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => append('' as never)}
            style={{ alignSelf: 'flex-start' }}
          >
            Añadir imagen
          </Button>
        )}
      </div>

      {/* Error global */}
      {globalError && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-destructive, #dc2626)',
            padding: 'var(--space-3)',
            backgroundColor: '#fee2e2',
            borderRadius: 'var(--radius-md)',
          }}
          role="alert"
        >
          {globalError}
        </p>
      )}

      {/* Mensaje de éxito (modo edición) */}
      {successMessage && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-promising-text)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-promising-bg)',
            borderRadius: 'var(--radius-md)',
          }}
          role="status"
        >
          {successMessage}
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
