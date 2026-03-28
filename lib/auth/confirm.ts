import { type EmailOtpType } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface ConfirmSearchParams {
  token: string | undefined;
  type: string | undefined;
  redirect_to: string | undefined;
}

export type ValidConfirmResult = {
  valid: true;
  token: string;
  type: EmailOtpType;
  redirectTo: string;
};

export type InvalidConfirmResult = {
  valid: false;
};

export type ConfirmValidationResult = ValidConfirmResult | InvalidConfirmResult;

export interface OtpParams {
  token_hash: string;
  type: EmailOtpType;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const DEFAULT_REDIRECT = "/communities";
const DEFAULT_OTP_TYPE: EmailOtpType = "email";

// ---------------------------------------------------------------------------
// Funciones puras
// ---------------------------------------------------------------------------

/**
 * Valida los searchParams recibidos en la página /auth/confirm.
 * Retorna valid:true con los valores normalizados, o valid:false si faltan parámetros.
 */
export function validateConfirmSearchParams(
  params: ConfirmSearchParams
): ConfirmValidationResult {
  const { token, type, redirect_to } = params;

  if (!token || token.trim() === "") return { valid: false };
  if (!type || type.trim() === "") return { valid: false };

  return {
    valid: true,
    token,
    type: type as EmailOtpType,
    redirectTo: redirect_to || DEFAULT_REDIRECT,
  };
}

/**
 * Construye los parámetros para supabase.auth.verifyOtp a partir del token y type.
 * Acepta undefined en type y aplica el valor por defecto.
 */
export function buildConfirmParams(params: {
  token: string;
  type: string | undefined;
}): OtpParams {
  return {
    token_hash: params.token,
    type: (params.type as EmailOtpType) || DEFAULT_OTP_TYPE,
  };
}
