import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Skip to content
      </a>

      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden md:ml-16">
        <Header />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-4 md:p-6 lg:p-8">
          {children}
        </main>
        {/* Mobile Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  )
}