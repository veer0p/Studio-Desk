"use client"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-4 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-[400px]">
          There was an error loading this section. This has been logged and we're looking into it.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => window.location.reload()} variant="outline">
          Reload Page
        </Button>
        <Button onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  )
}
