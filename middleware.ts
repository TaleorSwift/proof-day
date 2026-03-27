import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Placeholder — proteccion de rutas completa en Story 1.3
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Excluir:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Incluir todas las demas rutas.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
