"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  studioName: z.string().min(2, "Studio name must be at least 2 characters"),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch("password", "");

  const passwordStrength = useMemo(() => {
    if (!password) return { label: "", color: "bg-slate-200", width: "w-0", score: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4", score };
    if (score <= 3) return { label: "Fair", color: "bg-amber-500", width: "w-1/2", score };
    return { label: "Strong", color: "bg-brand-teal", width: "w-full", score };
  }, [password]);

  const onSubmit = async (values: SignupValues) => {
    setIsLoading(true);
    try {
      // 1. Supabase Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error("Signup failed. Please try again.");
        return;
      }

      // 2. Create Studio & Member
      const res = await fetch("/api/studios/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studio_name: values.studioName,
          owner_name: values.fullName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to initialize studio");
      }

      toast.success("Account created successfully!");
      router.push("/onboarding");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight">Start your free trial</h2>
        <p className="text-muted-foreground">
          14 days free. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            disabled={isLoading}
            {...register("fullName")}
            className={errors.fullName ? "border-destructive" : ""}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@studio.com"
            disabled={isLoading}
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            disabled={isLoading}
            {...register("password")}
            className={errors.password ? "border-destructive" : ""}
          />
          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-1.5 px-1">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">
                  Strength: <span style={{ color: "var(--tw-gradient-from)" }} className="font-bold">{passwordStrength.label}</span>
                </p>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} 
                />
              </div>
            </div>
          )}
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="studioName">Studio Name</Label>
          <Input
            id="studioName"
            placeholder="Grand Wedding Films"
            disabled={isLoading}
            {...register("studioName")}
            className={errors.studioName ? "border-destructive" : ""}
          />
          {errors.studioName && (
            <p className="text-xs text-destructive">{errors.studioName.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <input
            type="checkbox"
            id="terms"
            disabled={isLoading}
            {...register("terms")}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
          />
          <Label htmlFor="terms" className="text-xs leading-none peer-disabled:cursor-not-available peer-disabled:opacity-70">
            I agree to the{" "}
            <Link href="/terms" className="text-accent underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-accent underline">Privacy Policy</Link>
          </Label>
        </div>
        {errors.terms && (
          <p className="text-xs text-destructive">{errors.terms.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline font-semibold">
          Sign in
        </Link>
      </div>
    </div>
  );
}
