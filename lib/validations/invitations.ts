import { z } from 'zod'

export const generateInvitationSchema = z.object({
  communityId: z.string().uuid('ID de comunidad inválido'),
})

export type GenerateInvitationInput = z.infer<typeof generateInvitationSchema>
