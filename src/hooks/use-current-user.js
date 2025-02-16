import { useSession } from "next-auth/react";

export const currentUser = () => {
    const session = useSession()

    return session.data?.user
}