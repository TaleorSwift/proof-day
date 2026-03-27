import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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
import { generateInvitationLink } from '../../../lib/api/invitations'
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

// ---------------------------------------------------------------------------
// Suite 4: isPublicPath — regresión /auth/callback (L2 fix)
// Verificar que añadir /invite a PUBLIC_PREFIX_PATHS no rompe /auth/callback
// ---------------------------------------------------------------------------

describe('isPublicPath — regresión rutas existentes (L2 fix)', () => {
  it('/auth/callback sigue siendo pública tras añadir /invite', () => {
    expect(isPublicPath('/auth/callback')).toBe(true)
  })

  it('/auth/callback/subruta sigue siendo pública', () => {
    expect(isPublicPath('/auth/callback/something')).toBe(true)
  })

  it('/ sigue siendo pública', () => {
    expect(isPublicPath('/')).toBe(true)
  })

  it('/login sigue siendo pública (sin subrutas)', () => {
    expect(isPublicPath('/login')).toBe(true)
  })

  it('/communities sigue siendo privada', () => {
    expect(isPublicPath('/communities')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Suite 5: generateInvitationLink — error paths (CR4-F5)
// ---------------------------------------------------------------------------

describe('generateInvitationLink — error paths', () => {
  const originalFetch = global.fetch
  const mockWindowLocation = { origin: 'http://localhost:3000' }

  beforeEach(() => {
    // Mock window.location.origin
    Object.defineProperty(global, 'window', {
      value: { location: mockWindowLocation },
      writable: true,
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('lanza Error cuando la respuesta no es ok (status 500)', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Error al generar el link' }),
    } as Response)

    await expect(generateInvitationLink('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'))
      .rejects
      .toThrow('Error al generar el link')
  })

  it('lanza Error con mensaje por defecto cuando el body no tiene campo error', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    await expect(generateInvitationLink('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'))
      .rejects
      .toThrow('Error al generar el link de invitación')
  })

  it('lanza Error cuando el JSON del error no se puede parsear', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new SyntaxError('Invalid JSON') },
    } as unknown as Response)

    await expect(generateInvitationLink('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'))
      .rejects
      .toThrow('Error al generar el link de invitación')
  })

  it('construye URL correctamente con window.location.origin y token retornado', async () => {
    const fakeToken = 'abc12345-0000-0000-0000-000000000001'
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { token: fakeToken } }),
    } as Response)

    const result = await generateInvitationLink('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    expect(result).toBe(`http://localhost:3000/invite/${fakeToken}`)
  })

  it('llama al endpoint correcto con método POST', async () => {
    const communityId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { token: 'some-token' } }),
    } as Response)
    global.fetch = mockFetch

    await generateInvitationLink(communityId)

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/communities/${communityId}/invitations`,
      { method: 'POST' }
    )
  })
})
