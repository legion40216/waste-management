import { auth } from "@/lib/auth";
import {
  authRoutes,
  publicRoutes,
  ROLE_REDIRECTS
} from "@/routes";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const { role } = req.auth?.user || {};

  // Define route type checks
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isRootRoute = nextUrl.pathname === "/";

  // Define role-based route checks
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isDriverRoute = nextUrl.pathname.startsWith('/driver');
  const isUserRoute = nextUrl.pathname.startsWith('/user');

  // ✅ Allow all NextAuth API routes without interference
  if (isApiAuthRoute) {
    console.log("Skipping middleware for NextAuth API:", nextUrl.pathname);
    return null;
  }

  // ✅ Redirect logged-in users away from auth pages (login/register)
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL(ROLE_REDIRECTS[role] || "/", nextUrl));
  }

  // ✅ Redirect non-authenticated users to login if accessing protected routes
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
  }

  // ✅ Redirect logged-in users from root ("/") to their role-based dashboard
  if (isRootRoute && isLoggedIn) {
    return Response.redirect(new URL(ROLE_REDIRECTS[role] || "/", nextUrl));
  }

  // ✅ Role-based access control
  if (isLoggedIn) {
    if (isAdminRoute && role !== 'ADMIN') {
      return Response.redirect(new URL(ROLE_REDIRECTS[role], nextUrl));
    }
    if (isDriverRoute && role !== 'DRIVER' && role !== 'ADMIN') {
      return Response.redirect(new URL(ROLE_REDIRECTS[role], nextUrl));
    }
    if (isUserRoute && role !== 'USER' && role !== 'DRIVER') {
      return Response.redirect(new URL(ROLE_REDIRECTS[role], nextUrl));
    }
  }

  return null;
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"], // ✅ Ensure NextAuth API routes are not matched
};
