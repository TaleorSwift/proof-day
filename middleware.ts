import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rutas publicas exactas (sin subrutas)
const PUBLIC_EXACT_PATHS = ["/", "/login"];

// Rutas publicas con subrutas permitidas (prefijo)
const PUBLIC_PREFIX_PATHS = ["/auth/confirm", "/auth/callback", "/invite"];

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIX_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pasar rutas publicas sin verificar sesion
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  // Sin sesion → redirect a /login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Excluir:
     * - _next/static (archivos estaticos)
     * - _next/image (optimizacion de imagenes)
     * - favicon.ico, sitemap.xml, robots.txt
     * - /images/ (assets estaticos en public/images/)
     * - archivos con extension (imagenes, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
