"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { signUp } from "@/lib/auth"
import { cn } from "@/lib/utils"

const signupSchema = z.object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
    studioName: z.string().min(2, { message: "Studio name must be at least 2 characters" }),
    studioSlug: z.string().min(2, { message: "Slug is required" }).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            studioName: "",
            studioSlug: "",
            email: "",
            password: "",
        },
    })

    const isLoading = form.formState.isSubmitting
    const password = form.watch("password")

    // Password strength logic
    const getStrength = React.useCallback((pass: string) => {
        let score = 0
        if (pass.length >= 8) score++
        if (/[A-Z]/.test(pass)) score++
        if (/[0-9]/.test(pass)) score++
        if (/[^A-Za-z0-9]/.test(pass)) score++
        return score
    }, [])

    const strength = getStrength(password)
    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"]
    const strengthColors = ["bg-muted", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"]

    async function onSubmit(values: SignupFormValues) {
        setError(null)
        try {
            const result = await signUp(values.email, values.password, values.fullName, values.studioName, values.studioSlug)
            router.push("/onboarding")
        } catch (err: unknown) {
            if (err instanceof Error && 'status' in err && (err as Error & { status: number }).status === 409) {
                setError("An account with this email already exists")
            } else {
                const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
                setError(message)
            }
        }
    }

    // Error is cleared on next submit attempt (line 73: setError(null))

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center mb-2">
                <p className="text-sm text-muted-foreground">
                    Create your studio account to get started.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="John Doe"
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
                        name="studioName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Studio Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="XYZ Photography"
                                        disabled={isLoading}
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e)
                                            // Auto-generate slug
                                            const slug = e.target.value
                                                .toLowerCase()
                                                .replace(/[^a-z0-9]+/g, '-')
                                                .replace(/^-+|-+$/g, '')
                                            form.setValue('studioSlug', slug, { shouldValidate: true })
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="studioSlug"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-baseline justify-between">
                                    <FormLabel>Studio URL</FormLabel>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        studiodesk.com/{field.value || 'slug'}
                                    </span>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="studio-slug"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                                <FormLabel>Password</FormLabel>
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
                                <div className="mt-2 space-y-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1.5 flex-1 rounded-full transition-colors",
                                                    i <= strength ? strengthColors[strength] : "bg-muted"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    {password && (
                                        <p className={cn(
                                            "text-[10px] font-medium uppercase tracking-wider",
                                            strength === 1 ? "text-danger" :
                                                strength <= 3 ? "text-warning" : "text-success"
                                        )}>
                                            {strengthLabels[strength]}
                                        </p>
                                    )}
                                </div>
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
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Creating your account...</span>
                            </div>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                </form>
            </Form>

            <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}
