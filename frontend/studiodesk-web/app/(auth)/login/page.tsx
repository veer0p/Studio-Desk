"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

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
import { signIn } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const searchParams = useSearchParams()
    const emailParam = searchParams.get("email")
    const passwordParam = searchParams.get("password")

    const router = useRouter()
    const { mutate } = useAuth()
    const [showPassword, setShowPassword] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: emailParam || "",
            password: passwordParam || "",
        },
    })

    // Auto-submit if both params are present
    React.useEffect(() => {
        if (emailParam && passwordParam) {
            console.log('[Login] Auto-submitting based on query parameters')
            form.handleSubmit(onSubmit)()
        }
    }, [emailParam, passwordParam]) // eslint-disable-line react-hooks/exhaustive-deps

    const isLoading = form.formState.isSubmitting

    async function onSubmit(values: LoginFormValues) {
        setError(null)
        try {
            const data = await signIn(values.email, values.password)

            // Update local auth cache
            mutate(data)

            // Redirect based on onboarding status
            if (data?.studio?.onboarding_completed) {
                router.push("/dashboard")
            } else if (data?.studio) {
                router.push("/onboarding")
            } else if (data?.member) {
                // Invited team members belong to a studio already
                router.push("/dashboard")
            } else {
                router.push("/onboarding")
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Invalid email or password"
            setError(message)
        }
    }

    // Error is cleared on next submit attempt (line 44: setError(null))

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center mb-2">
                <p className="text-sm text-muted-foreground">
                    Welcome back! Sign in to manage your studio.
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
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-medium text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            disabled={isLoading}
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span className="sr-only">
                                                {showPassword ? "Hide password" : "Show password"}
                                            </span>
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {error && (
                        <div className="text-sm font-medium text-destructive mt-2" role="alert">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>
            </Form>

            <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-medium text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}
