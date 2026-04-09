import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: { sub: string } | null }> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: No poner codigo entre createServerClient y getClaims().
  // getClaims() verifica el JWT localmente — seguro y sin llamada al servidor.
  // Si se elimina, los usuarios pueden ser deslogueados aleatoriamente en SSR.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  return { response: supabaseResponse, user };
}
