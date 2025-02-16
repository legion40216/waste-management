import { currentRole } from "./server-auth-utils";

export async function checkRoleAndRedirect(expectedRole, redirectPath = "/") {
    const role = await currentRole();
  
    if (role !== expectedRole) {
      redirect(redirectPath);
    }
  }