import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks globales — deben declararse ANTES de los imports que los usan
// ---------------------------------------------------------------------------

// Mock next/navigation — useRouter no existe en entorno node
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock del cliente Supabase browser
const mockVerifyOtp = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      verifyOtp: mockVerifyOtp,
    },
  })),
}));

// Mock react — solo useState y useCallback para lógica pura
// No se renderiza DOM en vitest node environment
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
  };
});

// ---------------------------------------------------------------------------
// Import de la lógica extraída a función pura para testear
// ---------------------------------------------------------------------------

import { buildConfirmParams, validateConfirmSearchParams } from "@/lib/auth/confirm";

// ---------------------------------------------------------------------------
// Suite 1: validateConfirmSearchParams — valida parámetros de la URL
// ---------------------------------------------------------------------------

describe("validateConfirmSearchParams", () => {
  it("retorna valid:true cuando token y type están presentes", () => {
    const result = validateConfirmSearchParams({
      token: "abc123",
      type: "email",
      redirect_to: "/communities",
    });
    expect(result.valid).toBe(true);
  });

  it("retorna valid:false cuando falta token", () => {
    const result = validateConfirmSearchParams({
      token: undefined,
      type: "email",
      redirect_to: "/communities",
    });
    expect(result.valid).toBe(false);
  });

  it("retorna valid:false cuando falta type", () => {
    const result = validateConfirmSearchParams({
      token: "abc123",
      type: undefined,
      redirect_to: "/communities",
    });
    expect(result.valid).toBe(false);
  });

  it("retorna valid:false cuando token es string vacío", () => {
    const result = validateConfirmSearchParams({
      token: "",
      type: "email",
      redirect_to: "/communities",
    });
    expect(result.valid).toBe(false);
  });

  it("retorna valid:false cuando type es string vacío", () => {
    const result = validateConfirmSearchParams({
      token: "abc123",
      type: "",
      redirect_to: "/communities",
    });
    expect(result.valid).toBe(false);
  });

  it("usa /communities como redirectTo por defecto cuando redirect_to está ausente", () => {
    const result = validateConfirmSearchParams({
      token: "abc123",
      type: "email",
      redirect_to: undefined,
    });
    if (!result.valid) throw new Error("Se esperaba valid:true");
    expect(result.redirectTo).toBe("/communities");
  });

  it("respeta redirect_to cuando se proporciona", () => {
    const result = validateConfirmSearchParams({
      token: "abc123",
      type: "email",
      redirect_to: "/my-custom-path",
    });
    if (!result.valid) throw new Error("Se esperaba valid:true");
    expect(result.redirectTo).toBe("/my-custom-path");
  });
});

// ---------------------------------------------------------------------------
// Suite 2: buildConfirmParams — construye parámetros para verifyOtp
// ---------------------------------------------------------------------------

describe("buildConfirmParams", () => {
  it("construye params correctos con type email (default)", () => {
    const params = buildConfirmParams({ token: "tok123", type: "email" });
    expect(params).toEqual({
      token_hash: "tok123",
      type: "email",
    });
  });

  it("construye params correctos con type magiclink", () => {
    const params = buildConfirmParams({ token: "tok456", type: "magiclink" });
    expect(params).toEqual({
      token_hash: "tok456",
      type: "magiclink",
    });
  });

  it("usa email como type por defecto cuando no se especifica", () => {
    const params = buildConfirmParams({ token: "tok789", type: undefined });
    expect(params.type).toBe("email");
  });
});
