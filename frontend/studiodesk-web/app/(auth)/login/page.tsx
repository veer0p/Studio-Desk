import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import LoginFormInner from "./login-form"

export default function LoginPage() {
    return (
        <Suspense fallback={<Skeleton className="w-full h-96 rounded-md" />}>
            <LoginFormInner />
        </Suspense>
    )
}
