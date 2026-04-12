import type { Metadata } from 'next'
import { Inter, Geist, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import { ServiceWorkerRegistration } from '@/components/shared/ServiceWorkerRegistration'


const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'StudioDesk',
  description: 'SaaS Dashboard for Indian Photography Studios',
  manifest: '/manifest.json',
  themeColor: '#09090b',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StudioDesk',
  },
}

import { SWRProvider } from "@/components/swr-provider"
import { FeatureFlagsProvider } from "@/lib/feature-flags"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable, playfair.variable)}>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SWRProvider>
              <FeatureFlagsProvider>
                {children}
                <ServiceWorkerRegistration />
                <Toaster position="bottom-right" richColors />
              </FeatureFlagsProvider>
            </SWRProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
