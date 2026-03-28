import { createBrowserClient } from "@supabase/ssr";
import { mockBrowserClient } from "@/lib/mock/supabase";

export function createClient() {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockBrowserClient() as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
