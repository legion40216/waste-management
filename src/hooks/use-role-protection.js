import { auth } from "@/lib/auth";

// hooks/useRoleProtection.js
export async function useRoleProtection(requiredRole) {
    const session = await auth();
    if (!session || session.user.role !== requiredRole) {
      return false;
    }
    return true;
  }