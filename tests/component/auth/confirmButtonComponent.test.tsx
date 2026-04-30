// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// ---------------------------------------------------------------------------
// Mocks — deben declararse ANTES de los imports que los usan
// ---------------------------------------------------------------------------

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockVerifyOtp = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      verifyOtp: mockVerifyOtp,
    },
  })),
}));

// ---------------------------------------------------------------------------
// Import del componente bajo test
// ---------------------------------------------------------------------------

import { ConfirmButton } from "@/components/auth/ConfirmButton";

// ---------------------------------------------------------------------------
// Suite: ConfirmButton — M1
// ---------------------------------------------------------------------------

describe("ConfirmButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el botón con texto inicial", () => {
    render(<ConfirmButton token="tok" type="magiclink" redirectTo="/communities" />);
    expect(screen.getByRole("button")).toHaveTextContent("Acceder a Proof Day");
  });

  it("el botón tiene aria-busy=false en estado inicial", () => {
    render(<ConfirmButton token="tok" type="magiclink" redirectTo="/communities" />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "false");
  });

  it("muestra estado loading mientras verifyOtp está en vuelo", async () => {
    // verifyOtp nunca resuelve durante este test
    mockVerifyOtp.mockReturnValue(new Promise(() => {}));

    render(<ConfirmButton token="tok" type="magiclink" redirectTo="/communities" />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveTextContent("Verificando...");
  });

  it("el span tiene aria-live=polite y aria-atomic=true", () => {
    render(<ConfirmButton token="tok" type="magiclink" redirectTo="/communities" />);
    const liveRegion = screen.getByText("Acceder a Proof Day");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
  });

  // H2 — happy path: router.push se llama y isLoading vuelve a false
  it("llama a router.push con redirectTo en caso de éxito", async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    render(<ConfirmButton token="tok" type="magiclink" redirectTo="/communities" />);

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/communities");
    });
  });

  it("el botón ya no está disabled tras éxito", async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    render(<ConfirmButton token="tok" type="magiclink" redirectTo="/communities" />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  // Error state
  it("muestra mensaje de error cuando verifyOtp falla", async () => {
    mockVerifyOtp.mockResolvedValue({ error: { message: "Token expired" } });

    render(<ConfirmButton token="tok" type="magiclink" redirectTo="/communities" />);

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "El enlace ha expirado. Solicita uno nuevo."
      );
    });
  });

  it("el botón no está disabled tras error", async () => {
    mockVerifyOtp.mockResolvedValue({ error: { message: "Token expired" } });

    render(<ConfirmButton token="tok" type="magiclink" redirectTo="/communities" />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("NO llama a router.push cuando verifyOtp falla", async () => {
    mockVerifyOtp.mockResolvedValue({ error: { message: "Token expired" } });

    render(<ConfirmButton token="tok" type="magiclink" redirectTo="/communities" />);

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
