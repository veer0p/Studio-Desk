"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CheckCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { forgotPassword } from "@/lib/auth"

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = React.useState(false)

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    const isLoading = form.formState.isSubmitting

    async function onSubmit(values: ForgotPasswordFormValues) {
        try {
            await forgotPassword(values.email)
        } finally {
            // Always show success to prevent email enumeration
            setIsSubmitted(true)
        }
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center text-center gap-4">
                <CheckCircle className="h-12 w-12 text-success" />
                <h2 className="text-xl font-semibold">Check your email</h2>
                <p className="text-sm text-muted-foreground">
                    If an account exists, you&apos;ll receive a password reset link shortly.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                    <Link href="/login">Back to login</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center mb-2">
                <p className="text-sm text-muted-foreground">
                    Enter your email and we&apos;ll send you a link to reset your password.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="name@example.com"
                                        type="email"
                                        autoComplete="email"
                                        disabled={isLoading}
                                        autoFocus
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>
                </form>
            </Form>

            <div className="text-center mt-4">
                <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                    Back to login
                </Link>
            </div>
        </div>
    )
}
