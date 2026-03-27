import { describe, it, expect, vi } from "vitest";

// Testear la funcion isPublicPath de forma aislada
// El comportamiento completo de redirect se cubre en tests E2E (route-protection.spec.ts)
// porque mockear NextRequest/NextResponse con Vitest es complejo y fragil.

// Importar isPublicPath directamente desde middleware.ts
// Nota: middleware.ts usa '@/lib/supabase/middleware' que requiere env vars — mockear.
vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn().mockResolvedValue({
    response: { status: 200 },
    user: null,
  }),
}));

// Mock next/server para evitar dependencias de Next.js runtime en Vitest
vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => ({ status: 200, headers: new Map() })),
    redirect: vi.fn((url: URL) => ({ status: 302, url: url.toString() })),
  },
}));

import { isPublicPath } from "../../../middleware";

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
});
