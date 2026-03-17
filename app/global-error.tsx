'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-slate-500 max-w-md mb-8">
            Our team has been notified of this error. We&apos;re working to get things back on track.
          </p>
          
          <div className="flex gap-3">
             <Button 
                variant="outline" 
                onClick={() => window.location.href = '/dashboard'}
                className="h-12 px-6 rounded-xl font-bold border-slate-200"
              >
                Go to Dashboard
             </Button>
             <Button 
                onClick={reset}
                className="h-12 px-8 rounded-xl font-bold bg-primary"
              >
                Try Again
             </Button>
          </div>
          
          {error.digest && (
            <p className="mt-8 text-[10px] text-slate-400 font-mono tracking-tighter uppercase">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
