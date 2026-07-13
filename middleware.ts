import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "./lib/auth/config";

const PROTECTED_ROUTES = ["/admin-camp", "/admin-camp/importar", "/admin-camp/participantes", "/admin-camp/usuarios"];
const API_PROTECTED_ROUTES = ["/api/camp-admin"];
const PUBLIC_ROUTES = ["/login", "/setup", "/api/camp-admin/auth", "/api/camp-admin/setup", "/api/camp-admin/debug"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublicRoute) return NextResponse.next();

  const isProtectedPage = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedApi = API_PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtectedPage && !isProtectedApi) return NextResponse.next();

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-camp/:path*", "/api/camp-admin/:path*"],
};
