import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

const requiereLogin = withAuth({ pages: { signIn: "/admin/login" } });

function nuevoId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
}

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  // Modo demo: sin login y con un espacio de datos propio para cada visitante.
  if (process.env.DEMO_MODE === "1") {
    if (pathname === "/admin/login") return NextResponse.redirect(new URL("/admin", req.url));
    const actual = req.cookies.get("demo_id")?.value;
    const id = actual && /^[a-z0-9]{12,40}$/.test(actual) ? actual : nuevoId();
    const headers = new Headers(req.headers);
    headers.set("x-demo-id", id);
    const res = NextResponse.next({ request: { headers } });
    if (id !== actual) {
      res.cookies.set("demo_id", id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
    }
    return res;
  }

  // Modo normal: el panel exige iniciar sesión (el login queda libre).
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    return (requiereLogin as unknown as (r: NextRequest, e: NextFetchEvent) => Response)(req, ev);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|.*\\.(?:png|jpg|jpeg|svg|webp|ico|js|css|woff2?)$).*)",
  ],
};
