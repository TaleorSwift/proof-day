import { describe, it, expect, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks globales — deben declararse ANTES de los imports que los usan
// ---------------------------------------------------------------------------

// Mock de next/server — NextRequest y NextResponse son clases de Node.js runtime
// que no existen en entorno Vitest (node). Se simulan con objetos planos.
vi.mock("next/server", () => {
  const mockNextResponse = {
    next: vi.fn((opts?: { request?: unknown }) => ({
      status: 200,
      headers: new Map(),
      cookies: {
        set: vi.fn(),
        _store: {} as Record<string, string>,
        get: vi.fn(),
        getAll: vi.fn().mockReturnValue([]),
        setAll: vi.fn(),
      },
      _opts: opts,
    })),
    redirect: vi.fn((url: URL) => ({
      status: 302,
      url: url.toString(),
    })),
  };
  return { NextResponse: mockNextResponse };
});

// Mock de @supabase/ssr — se controla getClaims() por test
const mockGetClaims = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getClaims: mockGetClaims,
    },
  })),
}));

// ---------------------------------------------------------------------------
// Imports — DESPUÉS de los mocks
// ---------------------------------------------------------------------------

import { isPublicPath } from "../../../middleware";

// ---------------------------------------------------------------------------
// Suite 1: isPublicPath — función pura exportada desde middleware.ts
// ---------------------------------------------------------------------------

describe("isPublicPath", () => {
  it("retorna true para /", () => {
    expect(isPublicPath("/")).toBe(true);
  });

  it("retorna true para /login", () => {
    expect(isPublicPath("/login")).toBe(true);
  });

  it("retorna true para /auth/callback", () => {
    expect(isPublicPath("/auth/callback")).toBe(true);
  });

  it("retorna true para subrutas de /auth/callback", () => {
    expect(isPublicPath("/auth/callback/")).toBe(true);
  });

  it("retorna false para /communities", () => {
    expect(isPublicPath("/communities")).toBe(false);
  });

  it("retorna false para /communities/slug-de-comunidad", () => {
    expect(isPublicPath("/communities/mi-comunidad")).toBe(false);
  });

  it("retorna false para /profile", () => {
    expect(isPublicPath("/profile")).toBe(false);
  });

  it("retorna false para /profile/123", () => {
    expect(isPublicPath("/profile/123")).toBe(false);
  });

  it("no confunde /login con /loginextra", () => {
    // /loginextra no es subruta de /login/ — retorna false
    expect(isPublicPath("/loginextra")).toBe(false);
  });

  it("subrutas de /login son privadas — /login/anything retorna false", () => {
    // /login solo es publica como ruta exacta; no tiene subrutas publicas (F7 CR#2)
    expect(isPublicPath("/login/anything")).toBe(false);
    expect(isPublicPath("/login/reset")).toBe(false);
  });

  // CR3-F3 fix (T7 story 2.2): tests de /invite en middleware.test.ts (ubicación correcta)
  it("retorna true para /invite (ruta exacta) — AC 8 story 2.2", () => {
    expect(isPublicPath("/invite")).toBe(true);
  });

  it("retorna true para /invite/abc-123 (subruta con token UUID) — AC 8 story 2.2", () => {
    expect(isPublicPath("/invite/abc-123")).toBe(true);
  });

  it("retorna true para /invite/ (trailing slash) — AC 8 story 2.2", () => {
    expect(isPublicPath("/invite/")).toBe(true);
  });

  it("retorna false para /invitations/abc (no confundir con /invite) — story 2.2", () => {
    expect(isPublicPath("/invitations/abc")).toBe(false);
  });

  it("retorna false para /invited (no es subruta de /invite) — story 2.2", () => {
    expect(isPublicPath("/invited")).toBe(false);
  });

  it("retorna false para /invite-extra (prefijo estricto) — story 2.2", () => {
    expect(isPublicPath("/invite-extra")).toBe(false);
  });

  // /auth/confirm — página intermedia anti-scanner magic link
  it("retorna true para /auth/confirm (ruta exacta) — anti-scanner magic link", () => {
    expect(isPublicPath("/auth/confirm")).toBe(true);
  });

  it("retorna true para /auth/confirm/ (trailing slash) — anti-scanner magic link", () => {
    expect(isPublicPath("/auth/confirm/")).toBe(true);
  });

  it("no confunde /auth/confirmation con /auth/confirm — prefijo estricto", () => {
    expect(isPublicPath("/auth/confirmation")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Suite 2: updateSession — lib/supabase/middleware.ts (AC 8)
// Testea la implementación REAL usando vi.importActual.
// Las dependencias externas (@supabase/ssr, next/server) están mockeadas
// arriba para controlar el comportamiento de getClaims().
// ---------------------------------------------------------------------------

describe("updateSession — implementación real (AC 8)", () => {
  // Construir un NextRequest simulado con cookies y nextUrl.
  // Se usa unknown cast para evitar dependencia de tipos de next/server en tiempo de compilacion
  // (NextRequest es una clase de runtime que no existe en entorno Vitest node).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function buildMockRequest(cookies: Record<string, string> = {}): any {
    return {
      cookies: {
        getAll: () =>
          Object.entries(cookies).map(([name, value]) => ({ name, value })),
        set: vi.fn(),
      },
      nextUrl: {
        clone: () => ({ pathname: "", toString: () => "http://localhost/login" }),
      },
    };
  }

  it("retorna objeto con claves response y user (implementacion real, sin sesion)", async () => {
    // getClaims() retorna claims: null → usuario no autenticado
    mockGetClaims.mockResolvedValueOnce({ data: { claims: null }, error: null });

    const { updateSession } = await vi.importActual<
      typeof import("../../../lib/supabase/middleware")
    >("../../../lib/supabase/middleware");

    const result = await updateSession(buildMockRequest());

    expect(result).toHaveProperty("response");
    expect(result).toHaveProperty("user");
  });

  it("user es null cuando getClaims retorna claims: null (sin sesion)", async () => {
    mockGetClaims.mockResolvedValueOnce({ data: { claims: null }, error: null });

    const { updateSession } = await vi.importActual<
      typeof import("../../../lib/supabase/middleware")
    >("../../../lib/supabase/middleware");

    const result = await updateSession(buildMockRequest());

    expect(result.user).toBeNull();
  });

  it("user NO es null cuando getClaims retorna claims con sub (sesion valida)", async () => {
    mockGetClaims.mockResolvedValueOnce({
      data: { claims: { sub: "user-123", email: "test@example.com" } },
      error: null,
    });

    const { updateSession } = await vi.importActual<
      typeof import("../../../lib/supabase/middleware")
    >("../../../lib/supabase/middleware");

    const result = await updateSession(buildMockRequest());

    expect(result.user).not.toBeNull();
    expect(result.user).toHaveProperty("sub", "user-123");
  });

  it("response tiene status 200 cuando hay sesion valida", async () => {
    mockGetClaims.mockResolvedValueOnce({
      data: { claims: { sub: "user-456" } },
      error: null,
    });

    const { updateSession } = await vi.importActual<
      typeof import("../../../lib/supabase/middleware")
    >("../../../lib/supabase/middleware");

    const result = await updateSession(buildMockRequest());

    expect(result.response).toBeDefined();
    expect(result.response.status).toBe(200);
  });

  it("response es un objeto NextResponse valido (no redirect)", async () => {
    mockGetClaims.mockResolvedValueOnce({ data: { claims: null }, error: null });

    const { updateSession } = await vi.importActual<
      typeof import("../../../lib/supabase/middleware")
    >("../../../lib/supabase/middleware");

    const result = await updateSession(buildMockRequest());

    // response no debe ser un redirect (302) — updateSession solo refresca session
    // el redirect lo gestiona middleware.ts (raiz)
    expect(result.response.status).not.toBe(302);
  });

  it("updateSession es una funcion asincrona que acepta un parametro", async () => {
    const mod = await vi.importActual<
      typeof import("../../../lib/supabase/middleware")
    >("../../../lib/supabase/middleware");

    expect(typeof mod.updateSession).toBe("function");
    expect(mod.updateSession.constructor.name).toBe("AsyncFunction");
    expect(mod.updateSession.length).toBe(1);
  });
});
