import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner'

export default function AdminInnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <ImpersonationBanner />
      <AdminSidebar />
      <main className="ml-60 flex-1 p-6 pt-14">
        {children}
      </main>
    </div>
  )
}
