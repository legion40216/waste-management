// routes.js
export const publicRoutes = [
  "/",
]

export const authRoutes = [
  "/auth/login",
  "/auth/register",
]

export const apiAuthPrefix = "/api/auth"

// Role-based default redirects
export const ROLE_REDIRECTS = {
  ADMIN: "/admin/dashboard",
  DRIVER: "/driver/dashboard",
  USER: "/report"
}