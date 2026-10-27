import { NextResponse } from "next/server";

const LOCALES = ["fr", "en"];

// Redirige les adresses sans langue vers /fr ou /en selon le navigateur
export function proxy(request) {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const accept = request.headers.get("accept-language") || "";
  const locale = /^\s*en\b/i.test(accept) ? "en" : "fr";
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|photos|og.jpg|icon|favicon|robots.txt|sitemap.xml|.*\\..*).*)"],
};
