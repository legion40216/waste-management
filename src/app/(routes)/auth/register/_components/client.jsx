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
import { registerSchema } from '@/schemas'
import { toast } from 'sonner'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { Switch } from "@/components/ui/switch"

export default function Client() {
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            isDriver: false,
        },
        mode: "onChange"
    });

    const { isSubmitting } = form.formState

    const onSubmit = async (values) => {
        const toastId = toast.loading('Creating your account...');
        try {
            const dataToSend = {
                name: values.name,
                email: values.email,
                password: values.password,
                isDriver: values.isDriver,
                role: values.isDriver ? "DRIVER" : "USER",
            };
            await axios.post(`/api/register/`, dataToSend);
            toast.success('Registration successful!');
            
            // Redirect after a short delay
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        } catch (error) {
            console.log(error)
            // Show error toast
            toast.error(error.response?.data?.error || "Something went wrong!");
        }  finally {
            toast.dismiss(toastId); // Dismiss loading toast in one place
          }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                    Create an account to get started
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-3">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <div className='flex justify-between'>
                                            <FormLabel>Name</FormLabel>
                                            <FormMessage/>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="jhon doe"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <div className='flex justify-between'>
                                            <FormLabel>Email</FormLabel>
                                            <FormMessage/>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="john.doe@example.com"
                                                type="email"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <div className='flex justify-between'>
                                            <FormLabel>Password</FormLabel>
                                            <FormMessage/>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="*****"
                                                type="password"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isDriver"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Apply as Driver</FormLabel>
                                            <FormDescription>
                                                Sign up as a driver to start accepting deliveries
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked);
                                                }}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
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
                                {isSubmitting ? "Registering..." : "Register"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="login" className="text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}