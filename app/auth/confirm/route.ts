import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash") ?? searchParams.get("token");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? searchParams.get("redirect_to") ?? "/communities";
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/communities'

  const supabase = await createClient();

  // PKCE flow: Supabase server verifies the token and redirects here with ?code=
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    }
    redirect(`/auth/error?error=confirmation_failed`);
  }

  // Direct token hash flow
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect(next);
    }
    redirect(`/auth/error?error=confirmation_failed`);
  }

  redirect(`/auth/error?error=invalid_link`);
}
