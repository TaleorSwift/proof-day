'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { createCommunity, ApiError } from '@/lib/api/communities'
import { createCommunitySchema, type CreateCommunityInput } from '@/lib/validations/communities'
import type { Community } from '@/lib/types/communities'
import { CommunityImageInput } from './CommunityImageInput'

interface CommunityFormProps {
  onSuccess?: (community: Community) => void
}

export function CommunityForm({ onSuccess }: CommunityFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateCommunityInput>({
    resolver: zodResolver(createCommunitySchema),
  })

  const onSubmit = async (data: CreateCommunityInput) => {
    setServerError(null)
    try {
      const community = await createCommunity(data)
      if (onSuccess) {
        onSuccess(community)
      } else {
        router.push('/communities')
      }
    } catch (err) {
      // CR2-L2: mostrar COMMUNITY_NAME_TAKEN como error inline bajo el campo name
      if (err instanceof ApiError && err.code === 'COMMUNITY_NAME_TAKEN') {
        setError('name', { message: err.message })
        return
      }
      setServerError(err instanceof Error ? err.message : 'Error al crear la comunidad')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Nombre <span aria-hidden="true" className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Ej. Startup Weekend Madrid"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Descripción <span aria-hidden="true" className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe el propósito de tu comunidad..."
          rows={4}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
          {...register('description')}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Imagen */}
      <div className="space-y-2">
        <Label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Imagen <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>(opcional)</span>
        </Label>
        <CommunityImageInput
          value={watch('imageUrl') || null}
          onChange={(url) => setValue('imageUrl', url ?? '', { shouldValidate: true })}
        />
        {errors.imageUrl && (
          <p id="imageUrl-error" className="text-sm text-destructive" role="alert">
            {errors.imageUrl.message}
          </p>
        )}
      </div>

      {/* Error del servidor */}
      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Creando...' : 'Crear comunidad'}
      </Button>
    </form>
  )
}
