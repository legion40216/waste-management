import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcryptjs from "bcryptjs"
import prisma from "@/lib/prismadb"
import { loginSchema } from "@/schemas"
import { getUserById } from "@/data/user"

export const authOptions = {
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    Credentials({
      name: "credentials",
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials)

        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user?.hashedPassword) {
          return null
        }

        const passwordMatch = await bcryptjs.compare(
          password,
          user.hashedPassword
        )

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async session({token, session}){
     if(token.sub && session.user) {
       session.user.id = token.sub
     }
   
     if(token.role && session.user) {
       session.user.role = token.role
     }
     return session
    },
    async jwt({token}) {
     const existingUser = await getUserById(token.sub)
   
     if(!existingUser) return token 
   
     token.role = existingUser.role
   
     return token
    }
   },
  secret: process.env.AUTH_SECRET,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

