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
