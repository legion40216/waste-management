import * as z from "zod"

export const loginSchema = z.object({
    email: z.string().email({
     message: "Email is required"
    }),
    password: z.string().min(1,{
     message: "Password is required"
    })
   })

   export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    isDriver: z.boolean().default(false), // Ensure this is included
    role: z.enum(["USER", "DRIVER"]).optional(), // Optional role field
});