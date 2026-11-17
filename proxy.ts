import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "salt-session";
const PUBLIC_PANEL_PATHS = ["/painel/login", "/painel/setup"];

/**
 * Primeira barreira (Next 16 `proxy`). Só checa se há cookie de sessão; a validação real da
 * sessão e das permissões acontece em cada página, Server Action e Route Handler.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PANEL_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL("/painel/login", request.url);
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/painel/:path*", "/api/painel/:path*"],
};
