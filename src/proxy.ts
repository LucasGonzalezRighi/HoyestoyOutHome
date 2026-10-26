import { NextResponse, type NextRequest } from 'next/server';

import { ADMIN_ROUTES } from '@/constants/routes';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/sessionToken';

/**
 * Primer filtro del panel de administración: sin una cookie de sesión válida,
 * cualquier ruta de `/admin` (menos la de entrada) redirige a
 * `/admin/login`. Es un chequeo optimista (solo la firma del token): cada
 * página y cada acción del panel lo vuelve a verificar con `requireAdmin()`,
 * como pide la guía de autenticación de Next.
 *
 * Además, todo `/admin` sale con `X-Robots-Tag: noindex` y sin caché
 * compartida.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === ADMIN_ROUTES.login;

  if (!isLogin) {
    const secret = process.env.ADMIN_SESSION_SECRET?.trim() ?? '';
    const email = secret
      ? await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, secret)
      : null;
    if (!email) {
      const login = new URL(ADMIN_ROUTES.login, request.url);
      // Para volver a donde se quería ir después de entrar.
      if (pathname !== ADMIN_ROUTES.home) login.searchParams.set('next', pathname + search);
      return NextResponse.redirect(login);
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
