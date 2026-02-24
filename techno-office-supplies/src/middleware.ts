import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware de protección de rutas.
 * Las rutas /admin/* requieren una cookie de sesión de Firebase.
 * Firebase no puede verificarse en el Edge Runtime, entonces redirigimos
 * al login si no existe ninguna cookie de sesión.
 *
 * Nota: La verificación real de la sesión la hace el AuthProvider en el cliente.
 * Para producción con SSR seguro, se puede usar firebase-admin + cookies de sesión.
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Solo protegemos rutas /admin/*
    if (pathname.startsWith("/admin")) {
        // Firebase guarda la sesión en IndexedDB (no en cookies), así que
        // usamos una cookie propia que seteamos al hacer login
        const sessionCookie = request.cookies.get("session");

        if (!sessionCookie) {
            const loginUrl = new URL("/auth/login", request.url);
            // Guardamos la URL de destino para redirigir luego del login
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
