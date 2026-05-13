import { z } from 'zod'

export const createCommunitySchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(60, 'El nombre no puede superar 60 caracteres'),
  description: z.string()
    .min(1, 'La descripción es obligatoria')
    .max(500, 'La descripción no puede superar 500 caracteres'),
  imageUrl: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
})

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>

// Story 11.6 — Configuración de reciprocidad por comunidad
export const updateCommunitySettingsSchema = z.object({
  reciprocityThreshold: z
    .number()
    .int('El umbral debe ser un número entero')
    .min(0, 'El umbral mínimo es 0')
    .max(10, 'El umbral máximo es 10'),
})

export type UpdateCommunitySettingsInput = z.infer<typeof updateCommunitySettingsSchema>

// Community image — acepta URL pública (Supabase o externa) o null para borrar
export const updateCommunityImageSchema = z.object({
  imageUrl: z.string().url('URL de imagen inválida').nullable(),
})

export type UpdateCommunityImageInput = z.infer<typeof updateCommunityImageSchema>
