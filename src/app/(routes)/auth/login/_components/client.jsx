"use client"
import React from 'react'
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card'
import Link from 'next/link'
import axios from 'axios'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from 'next/navigation'
import { loginSchema } from '@/schemas'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { getSession } from "next-auth/react";
import { toast } from 'sonner'
import { ROLE_REDIRECTS } from '@/routes'

export default function Client() {
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const router = useRouter();
    const { isSubmitting } = form.formState;

    const onSubmit = async (values) => {
        const toastId = toast.loading('Logging you in...');
        try {
            const response = await axios.post(`/api/login`, values);
            if (response.data.success) {
                const session = await getSession(); // Get session data after login
                const role = session?.user?.role;

                // Use ROLE_REDIRECTS for role-based redirection
                const redirectTo = ROLE_REDIRECTS[role] || '/'; // Default to '/' if role not found

                router.push(redirectTo); // Redirect based on the user's role
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Something went wrong!");
        } finally {
            toast.dismiss(toastId); // Dismiss loading toast in one place
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>
                    Welcome back! Please sign in to continue.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-3">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="john.doe@example.com"
                                                type="email"
                                                disabled={isSubmitting}
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="*****"
                                                type="password"
                                                disabled={isSubmitting}
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Signing in..." : "Sign in"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-gray-600">
                    Don't have an account yet?{" "}
                    <Link href="register" className="text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}