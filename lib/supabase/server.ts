import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { mockServerClient } from "@/lib/mock/supabase";

export async function createClient() {
  if (process.env.MOCK_MODE === "true") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockServerClient() as any as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
