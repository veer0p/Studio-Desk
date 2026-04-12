"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

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
import { resetPassword } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants/routes"

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
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
    const strengthColors = ["bg-muted", "bg-danger", "bg-warning", "bg-warning", "bg-success"]

    async function onSubmit(values: ResetPasswordFormValues) {
        setError(null)
        try {
            await resetPassword(values.password)
            toast.success("Password updated successfully")

            // Delay redirect to show success toast
            setTimeout(() => {
                router.push(ROUTES.LOGIN)
            }, 2000)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update password. Please try again."
            setError(message)
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center mb-4 gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Update Password
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your new password below.
                </p>
            </div>

            <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                disabled={isLoading}
                                                autoFocus
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

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <div id="reset-password-error" className="text-sm font-medium text-destructive mt-2" role="alert" aria-live="assertive" aria-atomic="true">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </form>
                </Form>
        </div>
    )
}
