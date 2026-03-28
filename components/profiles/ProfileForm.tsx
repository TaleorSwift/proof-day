'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validations/profiles'
import { updateProfile } from '@/lib/api/profiles'
import type { Profile } from '@/lib/types/profiles'

interface ProfileFormProps {
  profile: Profile
  onSuccess: (updated: Profile) => void
  onCancel: () => void
}

export function ProfileForm({ profile, onSuccess, onCancel }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interestInput, setInterestInput] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name ?? '',
      bio: profile.bio ?? '',
      interests: profile.interests ?? [],
    },
  })

  const interests = watch('interests') ?? []

  function addInterest() {
    const tag = interestInput.trim()
    if (!tag || tag.length > 30) return
    if (interests.includes(tag)) return
    if (interests.length >= 10) return
    setValue('interests', [...interests, tag])
    setInterestInput('')
  }

  function removeInterest(tag: string) {
    setValue('interests', interests.filter((t) => t !== tag))
  }

  function handleInterestKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addInterest()
    }
  }

  async function onSubmit(data: UpdateProfileInput) {
    setIsSubmitting(true)
    setError(null)
    try {
      const updated = await updateProfile(profile.id, data)
      onSuccess(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-[var(--space-4)]">
      {/* Nombre */}
      <div className="space-y-[var(--space-2)]">
        <Label htmlFor="profile-name">Nombre / Alias</Label>
        <Input
          id="profile-name"
          placeholder="Tu nombre o alias"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-[var(--text-sm)] text-[var(--color-weak-text)]" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-[var(--space-2)]">
        <Label htmlFor="profile-bio">Bio</Label>
        <Textarea
          id="profile-bio"
          placeholder="Cuéntanos sobre ti, tu expertise, en qué trabajas..."
          rows={3}
          {...register('bio')}
        />
        {errors.bio && (
          <p className="text-[var(--text-sm)] text-[var(--color-weak-text)]" role="alert">
            {errors.bio.message}
          </p>
        )}
      </div>

      {/* Intereses (tags) */}
      <div className="space-y-[var(--space-2)]">
        <Label htmlFor="profile-interest-input">Intereses</Label>
        <div className="flex gap-[var(--space-2)]">
          <Input
            id="profile-interest-input"
            placeholder="Añadir interés (Enter)"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={handleInterestKeyDown}
            disabled={interests.length >= 10}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addInterest}
            disabled={!interestInput.trim() || interests.length >= 10}
          >
            +
          </Button>
        </div>
        {errors.interests && (
          <p className="text-[var(--text-sm)] text-[var(--color-weak-text)]" role="alert">
            {errors.interests.message}
          </p>
        )}
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-[var(--space-2)] mt-[var(--space-2)]">
            {interests.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-[var(--space-1)] px-[var(--space-3)] py-[var(--space-1)] rounded-full text-[var(--text-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeInterest(tag)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] leading-none"
                  aria-label={`Eliminar interés ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Error global */}
      {error && (
        <p className="text-[var(--text-sm)] text-[var(--color-weak-text)]" role="alert">
          {error}
        </p>
      )}

      {/* Acciones */}
      <div className="flex gap-[var(--space-3)] justify-end pt-[var(--space-2)]">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
