import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"


const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'StudioDesk',
  description: 'SaaS Dashboard for Indian Photography Studios',
}

import { SWRProvider } from "@/components/swr-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SWRProvider>
              {children}
              <Toaster position="bottom-right" richColors />
            </SWRProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
