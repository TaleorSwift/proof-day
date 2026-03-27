import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rutas que NO requieren autenticacion
const PUBLIC_PATHS = ["/", "/login", "/auth/callback"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
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
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
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
