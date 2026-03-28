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

const VALID_OTP_TYPES: ReadonlyArray<EmailOtpType> = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

function isValidOtpType(value: string): value is EmailOtpType {
  return (VALID_OTP_TYPES as readonly string[]).includes(value);
}

/**
 * Una ruta interna debe empezar por "/" pero NO por "//" (protocol-relative URL).
 * Ejemplos válidos:  "/communities", "/profile"
 * Ejemplos inválidos: "//evil.com", "https://evil.com", "javascript:..."
 */
function isInternalPath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//");
}

// ---------------------------------------------------------------------------
// Funciones puras
// ---------------------------------------------------------------------------

/**
 * Valida los searchParams recibidos en la página /auth/confirm.
 * Retorna valid:true con los valores normalizados, o valid:false si faltan parámetros.
 *
 * Seguridad:
 * - redirect_to debe empezar por "/" (ruta interna). Cualquier otro valor
 *   (absoluto, vacío o ausente) se sustituye por DEFAULT_REDIRECT para
 *   prevenir open-redirect hacia dominios externos.
 * - type debe ser uno de los valores válidos del union EmailOtpType. Un
 *   valor desconocido se considera inválido y retorna valid:false.
 */
export function validateConfirmSearchParams(
  params: ConfirmSearchParams
): ConfirmValidationResult {
  const { token, type, redirect_to } = params;

  if (!token || token.trim() === "") return { valid: false };
  if (!type || type.trim() === "") return { valid: false };
  if (!isValidOtpType(type)) return { valid: false };

  const redirectTo =
    redirect_to && isInternalPath(redirect_to)
      ? redirect_to
      : DEFAULT_REDIRECT;

  return {
    valid: true,
    token,
    type,
    redirectTo,
  };
}

/**
 * Construye los parámetros para supabase.auth.verifyOtp a partir del token y type.
 * Acepta undefined en type y aplica el valor por defecto.
 *
 * Seguridad: si type está presente pero no es un valor válido de EmailOtpType,
 * se usa DEFAULT_OTP_TYPE en lugar de hacer un cast ciego.
 */
export function buildConfirmParams(params: {
  token: string;
  type: string | undefined;
}): OtpParams {
  const resolvedType: EmailOtpType =
    params.type && isValidOtpType(params.type)
      ? params.type
      : DEFAULT_OTP_TYPE;

  return {
    token_hash: params.token,
    type: resolvedType,
  };
}
