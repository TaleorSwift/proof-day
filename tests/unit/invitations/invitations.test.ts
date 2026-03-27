import { describe, it, expect, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — antes de imports que los usan
// ---------------------------------------------------------------------------

vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({ status: 200 })),
    redirect: vi.fn((url: URL) => ({ status: 302, url: url.toString() })),
  },
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: null }, error: null }) },
  })),
}))

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { generateInvitationSchema } from '../../../lib/validations/invitations'
import { isPublicPath } from '../../../middleware'

// ---------------------------------------------------------------------------
// Suite 1: generateInvitationSchema (Zod validation)
// ---------------------------------------------------------------------------

describe('generateInvitationSchema', () => {
  it('acepta un UUID válido como communityId', () => {
    const result = generateInvitationSchema.safeParse({
      communityId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza un communityId que no es UUID (string libre)', () => {
    const result = generateInvitationSchema.safeParse({
      communityId: 'not-a-valid-uuid',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('ID de comunidad inválido')
    }
  })

  it('rechaza communityId vacío', () => {
    const result = generateInvitationSchema.safeParse({ communityId: '' })
    expect(result.success).toBe(false)
  })

  it('rechaza communityId undefined', () => {
    const result = generateInvitationSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Suite 2: crypto.randomUUID() — unicidad y formato
// ---------------------------------------------------------------------------

describe('crypto.randomUUID — generación de tokens', () => {
  it('genera UUIDs con formato estándar (8-4-4-4-12)', () => {
    const token = crypto.randomUUID()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    expect(uuidRegex.test(token)).toBe(true)
  })

  it('genera tokens únicos en 1000 iteraciones (probabilístico — colisión improbable)', () => {
    const tokens = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      tokens.add(crypto.randomUUID())
    }
    // Si todos son únicos el Set tiene 1000 elementos
    expect(tokens.size).toBe(1000)
  })
})

// ---------------------------------------------------------------------------
// Suite 3: isPublicPath — rutas /invite (AC 8)
// ---------------------------------------------------------------------------

describe('isPublicPath — rutas /invite (story 2.2, AC 8)', () => {
  it('retorna true para /invite (ruta exacta)', () => {
    expect(isPublicPath('/invite')).toBe(true)
  })

  it('retorna true para /invite/abc-123 (subruta con token UUID)', () => {
    expect(isPublicPath('/invite/abc-123')).toBe(true)
  })

  it('retorna true para /invite/ (trailing slash)', () => {
    expect(isPublicPath('/invite/')).toBe(true)
  })

  it('retorna false para /invitations/abc (no confundir con /invite)', () => {
    expect(isPublicPath('/invitations/abc')).toBe(false)
  })

  it('retorna false para /invited (no es subruta de /invite)', () => {
    expect(isPublicPath('/invited')).toBe(false)
  })

  it('retorna false para /invite-extra (no es subruta de /invite)', () => {
    // Verificar que el matcher de prefijo es estricto: /invite/xxx o /invite exacto
    // /invite-extra no comienza con '/invite/' y no es igual a '/invite'
    expect(isPublicPath('/invite-extra')).toBe(false)
  })
})
